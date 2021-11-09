import HttpClientCreator from './HttpClientCreator'
import Validator from './Validator'

class TokenProvider {
  #httpClient
  #clientSecret

  /**
   * TokenProvider class
   *
   * @param {object} params - an object with all data necessary to init TokenProvider, required
   * @param {string} params.engineAuthEndpoint - authorization endpoint, required
   * @param {string} params.clientId - configuration clientId, not required, but then must be passed into "generateToken(secrets)" or "getToken(secrets)"
   * @param {string} params.clientSecret - configuration clientSecret, not required, but then must be passed into "generateToken(secrets)" or "getToken(secrets)"
   * @param {string} params.token - token, not required
   * @param {string} params.tokenType - tokenType, not required
   *
   */

  constructor ({engineAuthEndpoint, clientId, clientSecret, token, tokenType} = {}) {
    const config = {
      baseURL: engineAuthEndpoint,
      json: true
    }

    TokenProvider.#validateTokenProvider(engineAuthEndpoint)

    this.token = token
    this.tokenType = tokenType

    this.#httpClient = new HttpClientCreator({config}).create()

    this.clientId = clientId
    this.#clientSecret = clientSecret
  }

  get isAuthorized () {
    const {tokenType, token} = this
    return tokenType && token
  }

  get #data () {
    return `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.#clientSecret}`
  }

  async getToken (secrets) {
    if (this.isAuthorized) {
      const {tokenType, token} = this
      return {tokenType, token}
    } else {
      return this.generateToken(secrets)
    }
  }

  async generateToken (secrets) {
    if (!!secrets) this.#setSecrets(secrets)
    try {
      TokenProvider.#validateGenerateToken(this)

      const response = await this.#httpClient({
        method: 'post',
        data: this.#data
      })
      const {access_token: token, expires_in: expiresIn, token_type: tokenType, scope} = response?.data || {}
      return {token, expiresIn, tokenType, scope}
    } catch (e) {
      return Promise.reject(e)
    }
  }

  #setSecrets ({clientSecret, clientId} = {}) {
    if (clientId) this.clientId = clientId
    if (clientSecret) this.#clientSecret = clientSecret
  }

  static #validateTokenProvider (engineAuthEndpoint) {
    const validator = new Validator([
      {
        rule: !!engineAuthEndpoint,
        message: `"engineAuthEndpoint" is required field, must be defined`
      }
    ])

    validator.validateWithThrowError()
  }

  static #validateGenerateToken (secrets) {
    const validator = new Validator([
      {
        rule: !!secrets.clientId,
        message: `"clientId" is required field, must be defined`
      },
      {
        rule: !!secrets.#clientSecret,
        message: `"clientSecret" is required field, must be defined`
      }
    ])

    validator.validateWithThrowError()
  }
}

export default TokenProvider

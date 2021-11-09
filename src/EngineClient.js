import TokenProvider from './TokenProvider'
import HttpClientCreator from './HttpClientCreator'
import Validator from './Validator'
import schemaValidator from './schemes'

class EngineClient {
  #httpClient
  #tokenProvider
  #returnOriginalResponse = false
  #secondAttempt = false

  /**
   * EngineClient class
   *
   * @param {object} config - axios config, 'baseURL' property is required
   * @param {string} config.baseURL - httpClient baseURL, required
   * @param {function} errorHandler - custom error handler, not required
   * @param {boolean} returnOriginalResponse - if true, the original response will be returned by default, not required, default value: false
   * @param {TokenProvider} tokenProvider - external TokenProvider, not required if "authorizationParams" defined
   * @param {object} authorizationParams - params for build-in TokenProvider, not required if "tokenProvider" defined
   * @param {string} authorizationParams.engineAuthEndpoint - authorization endpoint, required
   * @param {string} authorizationParams.clientId - configuration clientId, not required, but then must be passed into "transform(requestsData, secrets)"
   * @param {string} authorizationParams.clientSecret - configuration clientSecret, not required, but then must be passed into "transform(requestsData, secrets)"
   * @param {string} authorizationParams.token - token, not required
   * @param {string} authorizationParams.tokenType - tokenType, not required
   *
   */
  constructor ({
                 config = {baseURL: '', json: true},
                 returnOriginalResponse = false,
                 errorHandler = () => {},
                 tokenProvider,
                 authorizationParams
               } = {}) {
    EngineClient.#validateClient({config, tokenProvider, authorizationParams})

    this.#returnOriginalResponse = returnOriginalResponse
    this.#tokenProvider = tokenProvider instanceof TokenProvider ? tokenProvider : new TokenProvider(authorizationParams)
    this.#httpClient = new HttpClientCreator({
      config,
      errorHandler
    }).create()
  }

  async transformPostRequest (requestData, tokenInfo) {
    const headers = EngineClient.#genHeaders(tokenInfo)

    return this.#httpClient.post('transform', requestData, {headers})
  }

  /**
   * Transform request data
   *
   * @param {object} requestData - request data object, built with RequestBuilder
   * @param {{returnOriginal: boolean}} config - optional config of transform
   * @param {object} config.secrets - configuration secrets
   * @param {string} config.secrets.clientId - configuration clientId
   * @param {string} config.secrets.clientSecret - configuration clientSecret
   * @param {boolean} config.returnOriginal - if true, the original response will be returned
   *
   */

  async transform (requestData, config = {}) {
    const {secrets = null, returnOriginal = false} = config || {}
    try {
      EngineClient.#validateRequest(requestData)

      const tokenInfo = await this.#tokenProvider.getToken(secrets)
      const originalResponse = await this.transformPostRequest(requestData, tokenInfo)

      this.#secondAttempt = false

      return (this.#returnOriginalResponse || returnOriginal)
        ? originalResponse
        : EngineClient.#processResponse(originalResponse, requestData)
    } catch (error) {
      return this.#handleErrors(error, requestData)
    }
  }

  #handleErrors (error, requestData) {
    if (error.status === 401 && !this.#secondAttempt) {
      this.#secondAttempt = true
      return this.transform(requestData)
    } else {
      this.#secondAttempt = false
      return Promise.reject(error)
    }
  }

  static #validateClient ({tokenProvider, config, authorizationParams}) {
    const validator = new Validator([
      {
        rule: !!config?.baseURL,
        message: `"config.baseURL" is required field, must be defined`
      },
      {
        rule: tokenProvider instanceof TokenProvider || !!authorizationParams?.engineAuthEndpoint,
        message: `For external TokenProvider "tokenProvider" must be defined as instance of TokenProvider;
        For build-in TokenProvider "authorizationParams.engineAuthEndpoint" is required field.`
      }
    ])

    validator.validateWithThrowError()
  }

  static #validateReferences (requestData) {
    const {requests = [], processingContexts = [], rightsContexts = []} = requestData || {}
    const checkReference = (contexts, guid) => contexts.find(c => c.guid === guid)

    const isValid = requests.every(({processingContext, rightsContext}) => {
      return (typeof processingContext === 'undefined' || checkReference(processingContexts, processingContext)) &&
        checkReference(rightsContexts, rightsContext)
    })

    const validator = new Validator([{
      rule: isValid,
      message: `"requestData" contains requests with invalid processing/rights context references`
    }])
    validator.validateWithThrowError()
  }

  static #validateSchema (requestData) {
    const result = schemaValidator.validate(requestData, {$ref: '/RequestData'})

    const validator = new Validator([
      {
        rule: result.valid,
        message: `Invalid "requestData" format/structure`
      }
    ])

    validator.validateWithThrowError()
  }

  static #validateRequest (requestData) {
    EngineClient.#validateSchema(requestData)
    EngineClient.#validateReferences(requestData)
  }

  static #genHeaders ({tokenType, token}) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `${tokenType} ${token}`
    }
  }

  static #processResponse (originalResponse, requestData) {
    const {responses = []} = originalResponse?.data || {}
    const processedResponses = responses.map((response) => {
      const request = requestData.requests.find(({guid}) => guid === response.request)
      return {
        ...response,
        instances: response.instances.map(({className, propertyName, value: transformed, error}, instanceIndex) => {
          const baseInstance = {className, propertyName, transformed, original: request.instances[instanceIndex].value}
          return !!error ? {...baseInstance, error} : baseInstance
        })
      }
    })

    return {
      ...originalResponse,
      data: {
        responses: processedResponses
      }
    }
  }
}

export default EngineClient

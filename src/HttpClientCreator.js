import axios from 'axios'

class HttpClientCreator {
  /**
   * Generates new axios client with interceptors
   *
   * @param {object} config - axios config
   * @param {function} errorHandler - custom error handler
   *
   */
  constructor ({config = {}, errorHandler = () => {}}) {
    this.config = config
    this.axiosClient = null
    this.errorHandler = errorHandler
  }

  create () {
    this.axiosClient = axios.create(this.config)

    this.#setInterceptors(this.axiosClient)
    return this.axiosClient
  }

  #setInterceptors = httpClient => {
    httpClient.interceptors.request.use(HttpClientCreator.#startTimeInterceptor)
    httpClient.interceptors.request.use(HttpClientCreator.#loggerInterceptor)
    httpClient.interceptors.response.use(
      response => HttpClientCreator.#addDurationInterceptor(response, 'success'),
      error => HttpClientCreator.#addDurationInterceptor(error, 'error')
    )

    httpClient.interceptors.request.use(config => config, this.#errorHandlerInterceptor)
    httpClient.interceptors.response.use(response => response, this.#errorHandlerInterceptor)
  }

  #errorHandlerInterceptor = error => {
    const errorFullInfo = error || {}
    const errorResponse = errorFullInfo.response || {}
    const errorData = {...errorFullInfo, ...errorResponse.data, status: errorResponse.status}

    this.errorHandler(errorData)

    return Promise.reject(errorData)
  }

  static #startTimeInterceptor = config => ({...config, metadata: {startTime: new Date()}})

  static #addDurationInterceptor = (resOrErr, type = 'success') => {
    resOrErr.config.metadata.endTime = new Date()
    resOrErr.duration = resOrErr.config.metadata.endTime - resOrErr.config.metadata.startTime

    return type === 'success' ? resOrErr : Promise.reject(resOrErr)
  }

  static #loggerInterceptor = config => config
}

export default HttpClientCreator

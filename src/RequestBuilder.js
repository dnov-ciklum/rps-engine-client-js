import {v4 as uuidv4} from 'uuid'
import Validator from './Validator'
import RPSValue from './RpsValue'
import {deepEqual, isObject, makeArrayFromDictionary, makeDictionary} from './utils'
import schemaValidator from './schemes'

class RequestBuilder {
  constructor () {
    this.rightsContextsDictionary = {}
    this.processingContextsDictionary = {}
    this.requests = []
  }

  get rightsContexts () {
    return RequestBuilder.#buildContextsStructure(this.rightsContextsDictionary)
  }

  get processingContexts () {
    return RequestBuilder.#buildContextsStructure(this.processingContextsDictionary)
  }

  /**
   * Generates a Request
   *
   * @param {object[]} instances - Array of instances: [{className: 'className', propertyName: 'propertyName', value: 'value', dependencies(optional): {name: 'value'}}]
   * @param {object} rightsContext - Object of rightsContext with evidences: {evidences: {name: 'value'}}]
   * @param {object|undefined} processingContext - Object of processingContext with evidences: {evidences: {name: 'value'}}]
   *
   */
  addRequest ({instances, rightsContext, processingContext}) {
    RequestBuilder.#validateRequest({instances, rightsContext, processingContext})

    const rightsContextKey = this.#getOrAddContextKey('rights', rightsContext)
    const processingContextKey = processingContext ? this.#getOrAddContextKey('processing', processingContext) : undefined
    const processedInstances = RequestBuilder.#processInstances(instances)

    const existingRequest = this.requests.find(r => {
      return r.rightsContext === rightsContextKey && r.processingContext === processingContextKey
    })

    if (!existingRequest) {
      this.requests.push({
        guid: uuidv4(),
        rightsContext: rightsContextKey,
        processingContext: processingContextKey,
        instances: processedInstances
      })
    } else {
      existingRequest.instances = [...existingRequest.instances, ...processedInstances]
    }

    return this
  }

  build () {
    RequestBuilder.#validateBuild(this)

    const {rightsContexts, processingContexts, requests} = this
    return {rightsContexts, processingContexts, requests}
  }

  #getOrAddContextKey (type, context) {
    const processedEvidences = RequestBuilder.#processEvidences(type, context?.evidences)
    const contexts = this[`${type}ContextsDictionary`]

    const existingContext = Object
      .entries(contexts)
      .find(([guid, evidences]) => deepEqual(processedEvidences, evidences))

    const guid = !existingContext ? uuidv4() : existingContext[0]

    if (!existingContext) contexts[guid] = processedEvidences

    return guid
  }

  static #buildEvidencesStructure (evidences) {
    return makeArrayFromDictionary(evidences)
  }

  static #buildContextsStructure (contextsDictionary) {
    return Object.entries(contextsDictionary).reduce((acc, [guid, evidences]) => {
      return [...acc, {guid, evidences: RequestBuilder.#buildEvidencesStructure(evidences)}]
    }, [])
  }

  static #processEvidences (type, evidences) {
    if (Array.isArray(evidences) && evidences.length > 0) {
      return makeDictionary(evidences, 'name', 'value')
    } else if (isObject(evidences) && Object.keys(evidences).length > 0) {
      return evidences
    } else {
      throw new Error(`Empty evidences or invalid evidences structure in "${type}Context"`)
    }
  }

  static #getDependencyContext ({dependencyContext: context, evidences, dependencies}) {
    const trueContext = context || evidences || dependencies

    if (!trueContext) {
      return null
    } else if (Array.isArray(trueContext) && trueContext.length > 0) {
      return {evidences: trueContext}
    } else if (isObject(trueContext) && Object.keys(trueContext).length > 0) {
      if (!!trueContext.evidences && (Array.isArray(trueContext.evidences) || isObject(trueContext.evidences))) {
        return RequestBuilder.#getDependencyContext(trueContext)
      } else {
        return {evidences: makeArrayFromDictionary(trueContext)}
      }
    } else {
      return null
    }
  }

  static #validateRequest (requestInputData) {
    const result = schemaValidator.validate(requestInputData, {$ref: '/RequestInputData'})

    const validator = new Validator([
      {
        rule: result.valid,
        message: `Invalid format/structure of input params`
      }
    ])

    validator.validateWithThrowError()
  }

  static #processInstances (instances) {
    RequestBuilder.#validateInstances(instances)

    return instances
      .filter(({value}) => typeof value !== 'undefined')
      .map(instance => {
        const {className, propertyName, value} = instance
        const dependencyContext = RequestBuilder.#getDependencyContext(instance)
        const baseInstance = {className, propertyName, value}
        const instanceWithDependencyContext = {...baseInstance, dependencyContext}

        return dependencyContext ? instanceWithDependencyContext : baseInstance
      })
  }

  static #validateInstances (instances) {
    const validator = new Validator([
      {
        rule: instances.some(instance => RPSValue.validateValue(instance)),
        message: `Must be at least one valid instance object in "instances"`
      }
    ])
    validator.validateWithThrowError()
  }

  static #validateBuild ({rightsContexts, requests}) {
    const validator = new Validator([
      {
        rule: requests.length > 0,
        message: `Use "addRequest" method for generating request`
      },
      {
        rule: rightsContexts.length > 0,
        message: `"rightsContexts" is empty`
      }
    ])

    validator.validateWithThrowError()
  }
}

export default RequestBuilder

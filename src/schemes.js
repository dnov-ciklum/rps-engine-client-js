import {Validator} from 'jsonschema'

const schemaValidator = new Validator()
export const evidenceSchema = {
  id: '/Evidence',
  type: 'object',
  properties: {
    name: {type: 'string'},
    value: {type: 'string'}
  },
  required: ['name', 'value']
}
schemaValidator.addSchema(evidenceSchema, '/Evidence')

export const evidencesSchema = {
  id: '/Evidences',
  type: 'array',
  items: {'$ref': '/Evidence'},
  minItems: 1
}
schemaValidator.addSchema(evidencesSchema, '/Evidences')

export const extendedEvidencesSchema = {
  id: '/ExtendedEvidences',
  oneOf: [
    {'$ref': '/Evidences'},
    {
      type: 'object',
      patternProperties: {
        '.+': {type: 'String'}
      },
      minProperties: 1
    }
  ]
}
schemaValidator.addSchema(extendedEvidencesSchema, '/ExtendedEvidences')

export const instanceSchema = {
  id: '/Instance',
  type: 'object',
  properties: {
    className: {type: 'string'},
    propertyName: {type: 'string'},
    value: {type: 'any'},
    dependencyContext: {
      type: 'object',
      properties: {
        evidences: {'$ref': '/Evidences'}
      }
    }
  },
  required: ['className', 'propertyName', 'value']
}
schemaValidator.addSchema(instanceSchema, '/Instance')

export const inputInstancesSchema = {
  id: '/InputInstances',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      className: {type: 'string'},
      propertyName: {type: 'string'},
      value: {type: 'any'}
    },
    required: ['className', 'propertyName'],
    minItems: 1
  }
}
schemaValidator.addSchema(inputInstancesSchema, '/InputInstances')

export const instancesSchema = {
  id: '/Instances',
  type: 'array',
  items: {'$ref': '/Instance'},
  minItems: 1
}
schemaValidator.addSchema(instancesSchema, '/Instances')

export const contextSchema = {
  id: '/Context',
  type: 'object',
  properties: {
    guid: {type: 'string'},
    evidences: {'$ref': '/Evidences'}
  },
  required: ['guid', 'evidences']
}
schemaValidator.addSchema(contextSchema, '/Context')

export const inputContextSchema = {
  id: '/InputContext',
  type: 'object',
  properties: {
    evidences: {'$ref': '/ExtendedEvidences'}
  },
  required: ['evidences']
}
schemaValidator.addSchema(inputContextSchema, '/InputContext')


export const rightsContextsSchema = {
  id: '/RightsContexts',
  type: 'Array',
  items: {'$ref': '/Context'},
  minItems: 1
}
schemaValidator.addSchema(rightsContextsSchema, '/RightsContexts')

export const processingContextsSchema = {
  id: '/ProcessingContexts',
  type: 'Array',
  items: {'$ref': '/Context'},
  minItems: 0
}
schemaValidator.addSchema(processingContextsSchema, '/ProcessingContexts')

export const requestsSchema = {
  id: '/Requests',
  type: 'Array',
  items: {
    type: 'object',
    properties: {
      guid: {type: 'string'},
      rightsContext: {type: 'string'},
      processingContext: {type: 'string'},
      instances: {'$ref': '/Instances'}
    },
    required: ['guid', 'rightsContext', 'instances']
  },
  minItems: 1
}
schemaValidator.addSchema(requestsSchema, '/Requests')

export const requestDataSchema = {
  id: 'RequestData',
  type: 'object',
  properties: {
    processingContexts: {'$ref': '/ProcessingContexts'},
    rightsContexts: {'$ref': '/RightsContexts'},
    requests: {'$ref': '/Requests'}
  },
  required: ['rightsContexts', 'requests']
}
schemaValidator.addSchema(requestDataSchema, '/RequestData')

export const requestInputDataSchema = {
  id: 'RequestInputData',
  type: 'object',
  properties: {
    processingContext: {'$ref': '/InputContext'},
    rightsContext: {'$ref': '/InputContext'},
    instances: {'$ref': 'InputInstances'}
  },
  required: ['rightsContext', 'instances']
}
schemaValidator.addSchema(requestInputDataSchema, '/RequestInputData')

export default schemaValidator

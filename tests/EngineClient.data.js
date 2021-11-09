import TokenProvider from '../src/TokenProvider'
import EngineClient from '../src/EngineClient'

const requestGuid = 'a10fb3ec-f61b-4755-bcf7-07b91cef39f6'
const processingContextGuid = '701cb23d-3f48-4273-a18b-07ab1aa0f70a'
const rightsContextGuid = '701cb23d-3f48-4273-a18b-07ab1aa0f70a'
const validEvidences = [{name: 'name', value: 'value'}]
const validRightsContexts = [{guid: rightsContextGuid, evidences: validEvidences}]
const validProcessingContexts = [{guid: processingContextGuid, evidences: validEvidences}]
const validInstance = {className: 'className', propertyName: 'propertyName', value: 'value'}
const validInstances = [validInstance]
const validRequest = {
  guid: requestGuid,
  rightsContext: rightsContextGuid,
  processingContext: processingContextGuid,
  instances: validInstances
}
const validRequests = [validRequest]

export const invalidRequestsStructures = {
  empty: {},
  emptyProperties: {
    rightsContexts: [],
    processingContexts: [],
    requests: []
  },
  invalidPropertiesFormat: {
    rightsContexts: null,
    processingContexts: null,
    requests: null
  },
  emptyRequests: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: []
  },
  emptyContexts: {
    rightsContexts: [],
    processingContexts: [],
    requests: validRequests
  },
  emptyContextsInstances: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{...validRequest, instances: []}]
  },
  requestWithoutGuid: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{...validRequest, guid: undefined}]
  },
  requestWithInvalidInstances: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{
      ...validRequest,
      instances: [{...validInstance, value: undefined}]
    }]
  },
  requestWithInvalidDependencyContext: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{
      ...validRequest,
      instances: [{
        ...validInstance,
        dependencyContext: {evidences: [{value: 'value'}]}
      }]
    }]
  },
  invalidContextReference: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{...validRequest, rightsContext: 'UNDEFINED_GUID'}]
  },
  emptyProcessingContextReference: {
    rightsContexts: validRightsContexts,
    processingContexts: validProcessingContexts,
    requests: [{...validRequest, processingContext: ''}]
  }
}

export const validRequestData = {
  rightsContexts: validRightsContexts,
  processingContexts: validProcessingContexts,
  requests: validRequests
}

const metaInfo = {
  'status': 200,
  'statusText': 'OK',
  'duration': 353
}
const requestData = {
  'request': requestGuid,
  'rightsContext': rightsContextGuid,
  'processingContext': processingContextGuid
}

export const validOriginalResponse = {
  'data': {
    'responses': [{
      ...requestData,
      'instances': [{
        'className': 'className',
        'propertyName': 'propertyName',
        'value': 'null',
        'error': {
          'code': '3f567979-e5b7-4725-8b93-9363ceaa5604',
          'message': 'Undefined Rights context'
        }
      }]
    }]
  },
  ...metaInfo
}
export const validProcessedResponse = {
  'data': {
    'responses': [{
      ...requestData,
      'instances': [{
        'className': 'className',
        'propertyName': 'propertyName',
        'transformed': 'null',
        'original': 'value',
        'error': {
          'code': '3f567979-e5b7-4725-8b93-9363ceaa5604',
          'message': 'Undefined Rights context'
        }
      }]
    }]
  },
  ...metaInfo
}

export const engineBaseURL = 'engine'
export const engineAuthEndpoint = 'engine/auth'
export const secrets = {
  clientId: '97346080-5b5e-4abe-b2ba-266a8dc78928',
  clientSecret: 'b60cec45756a472dba64d858d74abc662c019305e4f64ace83336a4115dc3186'
}
export const tokenProvider = new TokenProvider({engineAuthEndpoint})

export const createEngine = (params = {}) => () => new EngineClient(params)
const defaultParams = {config: {baseURL: engineBaseURL}, tokenProvider}
export const quickCreateEngine = (params = {}) => createEngine({...defaultParams, ...params})()

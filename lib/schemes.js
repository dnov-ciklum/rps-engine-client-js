"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rightsContextsSchema = exports.requestsSchema = exports.requestInputDataSchema = exports.requestDataSchema = exports.processingContextsSchema = exports.instancesSchema = exports.instanceSchema = exports.inputInstancesSchema = exports.inputContextSchema = exports.extendedEvidencesSchema = exports.evidencesSchema = exports.evidenceSchema = exports["default"] = exports.contextSchema = void 0;

var _jsonschema = require("jsonschema");

var schemaValidator = new _jsonschema.Validator();
var evidenceSchema = {
  id: '/Evidence',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    value: {
      type: 'string'
    }
  },
  required: ['name', 'value']
};
exports.evidenceSchema = evidenceSchema;
schemaValidator.addSchema(evidenceSchema, '/Evidence');
var evidencesSchema = {
  id: '/Evidences',
  type: 'array',
  items: {
    '$ref': '/Evidence'
  },
  minItems: 1
};
exports.evidencesSchema = evidencesSchema;
schemaValidator.addSchema(evidencesSchema, '/Evidences');
var extendedEvidencesSchema = {
  id: '/ExtendedEvidences',
  oneOf: [{
    '$ref': '/Evidences'
  }, {
    type: 'object',
    patternProperties: {
      '.+': {
        type: 'String'
      }
    },
    minProperties: 1
  }]
};
exports.extendedEvidencesSchema = extendedEvidencesSchema;
schemaValidator.addSchema(extendedEvidencesSchema, '/ExtendedEvidences');
var instanceSchema = {
  id: '/Instance',
  type: 'object',
  properties: {
    className: {
      type: 'string'
    },
    propertyName: {
      type: 'string'
    },
    value: {
      type: 'any'
    },
    dependencyContext: {
      type: 'object',
      properties: {
        evidences: {
          '$ref': '/Evidences'
        }
      }
    }
  },
  required: ['className', 'propertyName', 'value']
};
exports.instanceSchema = instanceSchema;
schemaValidator.addSchema(instanceSchema, '/Instance');
var inputInstancesSchema = {
  id: '/InputInstances',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      className: {
        type: 'string'
      },
      propertyName: {
        type: 'string'
      },
      value: {
        type: 'any'
      }
    },
    required: ['className', 'propertyName'],
    minItems: 1
  }
};
exports.inputInstancesSchema = inputInstancesSchema;
schemaValidator.addSchema(inputInstancesSchema, '/InputInstances');
var instancesSchema = {
  id: '/Instances',
  type: 'array',
  items: {
    '$ref': '/Instance'
  },
  minItems: 1
};
exports.instancesSchema = instancesSchema;
schemaValidator.addSchema(instancesSchema, '/Instances');
var contextSchema = {
  id: '/Context',
  type: 'object',
  properties: {
    guid: {
      type: 'string'
    },
    evidences: {
      '$ref': '/Evidences'
    }
  },
  required: ['guid', 'evidences']
};
exports.contextSchema = contextSchema;
schemaValidator.addSchema(contextSchema, '/Context');
var inputContextSchema = {
  id: '/InputContext',
  type: 'object',
  properties: {
    evidences: {
      '$ref': '/ExtendedEvidences'
    }
  },
  required: ['evidences']
};
exports.inputContextSchema = inputContextSchema;
schemaValidator.addSchema(inputContextSchema, '/InputContext');
var rightsContextsSchema = {
  id: '/RightsContexts',
  type: 'Array',
  items: {
    '$ref': '/Context'
  },
  minItems: 1
};
exports.rightsContextsSchema = rightsContextsSchema;
schemaValidator.addSchema(rightsContextsSchema, '/RightsContexts');
var processingContextsSchema = {
  id: '/ProcessingContexts',
  type: 'Array',
  items: {
    '$ref': '/Context'
  },
  minItems: 0
};
exports.processingContextsSchema = processingContextsSchema;
schemaValidator.addSchema(processingContextsSchema, '/ProcessingContexts');
var requestsSchema = {
  id: '/Requests',
  type: 'Array',
  items: {
    type: 'object',
    properties: {
      guid: {
        type: 'string'
      },
      rightsContext: {
        type: 'string'
      },
      processingContext: {
        type: 'string'
      },
      instances: {
        '$ref': '/Instances'
      }
    },
    required: ['guid', 'rightsContext', 'instances']
  },
  minItems: 1
};
exports.requestsSchema = requestsSchema;
schemaValidator.addSchema(requestsSchema, '/Requests');
var requestDataSchema = {
  id: 'RequestData',
  type: 'object',
  properties: {
    processingContexts: {
      '$ref': '/ProcessingContexts'
    },
    rightsContexts: {
      '$ref': '/RightsContexts'
    },
    requests: {
      '$ref': '/Requests'
    }
  },
  required: ['rightsContexts', 'requests']
};
exports.requestDataSchema = requestDataSchema;
schemaValidator.addSchema(requestDataSchema, '/RequestData');
var requestInputDataSchema = {
  id: 'RequestInputData',
  type: 'object',
  properties: {
    processingContext: {
      '$ref': '/InputContext'
    },
    rightsContext: {
      '$ref': '/InputContext'
    },
    instances: {
      '$ref': 'InputInstances'
    }
  },
  required: ['rightsContext', 'instances']
};
exports.requestInputDataSchema = requestInputDataSchema;
schemaValidator.addSchema(requestInputDataSchema, '/RequestInputData');
var _default = schemaValidator;
exports["default"] = _default;
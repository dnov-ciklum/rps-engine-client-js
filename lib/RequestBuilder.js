"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = require("uuid");

var _Validator = _interopRequireDefault(require("./Validator"));

var _RpsValue = _interopRequireDefault(require("./RpsValue"));

var _utils = require("./utils");

var _schemes = _interopRequireDefault(require("./schemes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

var _getOrAddContextKey = /*#__PURE__*/new WeakSet();

var RequestBuilder = /*#__PURE__*/function () {
  function RequestBuilder() {
    _classCallCheck(this, RequestBuilder);

    _classPrivateMethodInitSpec(this, _getOrAddContextKey);

    this.rightsContextsDictionary = {};
    this.processingContextsDictionary = {};
    this.requests = [];
  }

  _createClass(RequestBuilder, [{
    key: "rightsContexts",
    get: function get() {
      return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildContextsStructure).call(RequestBuilder, this.rightsContextsDictionary);
    }
  }, {
    key: "processingContexts",
    get: function get() {
      return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildContextsStructure).call(RequestBuilder, this.processingContextsDictionary);
    }
    /**
     * Generates a Request
     *
     * @param {object[]} instances - Array of instances: [{className: 'className', propertyName: 'propertyName', value: 'value', dependencies(optional): {name: 'value'}}]
     * @param {object} rightsContext - Object of rightsContext with evidences: {evidences: {name: 'value'}}]
     * @param {object|undefined} processingContext - Object of processingContext with evidences: {evidences: {name: 'value'}}]
     *
     */

  }, {
    key: "addRequest",
    value: function addRequest(_ref) {
      var instances = _ref.instances,
          rightsContext = _ref.rightsContext,
          processingContext = _ref.processingContext;

      _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateRequest).call(RequestBuilder, {
        instances: instances,
        rightsContext: rightsContext,
        processingContext: processingContext
      });

      var rightsContextKey = _classPrivateMethodGet(this, _getOrAddContextKey, _getOrAddContextKey2).call(this, 'rights', rightsContext);

      var processingContextKey = processingContext ? _classPrivateMethodGet(this, _getOrAddContextKey, _getOrAddContextKey2).call(this, 'processing', processingContext) : undefined;

      var processedInstances = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _processInstances).call(RequestBuilder, instances);

      var existingRequest = this.requests.find(function (r) {
        return r.rightsContext === rightsContextKey && r.processingContext === processingContextKey;
      });

      if (!existingRequest) {
        this.requests.push({
          guid: (0, _uuid.v4)(),
          rightsContext: rightsContextKey,
          processingContext: processingContextKey,
          instances: processedInstances
        });
      } else {
        existingRequest.instances = [].concat(_toConsumableArray(existingRequest.instances), _toConsumableArray(processedInstances));
      }

      return this;
    }
  }, {
    key: "build",
    value: function build() {
      _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateBuild).call(RequestBuilder, this);

      var rightsContexts = this.rightsContexts,
          processingContexts = this.processingContexts,
          requests = this.requests;
      return {
        rightsContexts: rightsContexts,
        processingContexts: processingContexts,
        requests: requests
      };
    }
  }]);

  return RequestBuilder;
}();

function _getOrAddContextKey2(type, context) {
  var processedEvidences = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _processEvidences).call(RequestBuilder, type, context === null || context === void 0 ? void 0 : context.evidences);

  var contexts = this["".concat(type, "ContextsDictionary")];
  var existingContext = Object.entries(contexts).find(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        guid = _ref3[0],
        evidences = _ref3[1];

    return (0, _utils.deepEqual)(processedEvidences, evidences);
  });
  var guid = !existingContext ? (0, _uuid.v4)() : existingContext[0];
  if (!existingContext) contexts[guid] = processedEvidences;
  return guid;
}

function _buildEvidencesStructure(evidences) {
  return (0, _utils.makeArrayFromDictionary)(evidences);
}

function _buildContextsStructure(contextsDictionary) {
  return Object.entries(contextsDictionary).reduce(function (acc, _ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        guid = _ref5[0],
        evidences = _ref5[1];

    return [].concat(_toConsumableArray(acc), [{
      guid: guid,
      evidences: _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildEvidencesStructure).call(RequestBuilder, evidences)
    }]);
  }, []);
}

function _processEvidences(type, evidences) {
  if (Array.isArray(evidences) && evidences.length > 0) {
    return (0, _utils.makeDictionary)(evidences, 'name', 'value');
  } else if ((0, _utils.isObject)(evidences) && Object.keys(evidences).length > 0) {
    return evidences;
  } else {
    throw new Error("Empty evidences or invalid evidences structure in \"".concat(type, "Context\""));
  }
}

function _getDependencyContext(_ref6) {
  var context = _ref6.dependencyContext,
      evidences = _ref6.evidences,
      dependencies = _ref6.dependencies;
  var trueContext = context || evidences || dependencies;

  if (!trueContext) {
    return null;
  } else if (Array.isArray(trueContext) && trueContext.length > 0) {
    return {
      evidences: trueContext
    };
  } else if ((0, _utils.isObject)(trueContext) && Object.keys(trueContext).length > 0) {
    if (!!trueContext.evidences && (Array.isArray(trueContext.evidences) || (0, _utils.isObject)(trueContext.evidences))) {
      return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _getDependencyContext).call(RequestBuilder, trueContext);
    } else {
      return {
        evidences: (0, _utils.makeArrayFromDictionary)(trueContext)
      };
    }
  } else {
    return null;
  }
}

function _validateRequest(requestInputData) {
  var result = _schemes["default"].validate(requestInputData, {
    $ref: '/RequestInputData'
  });

  var validator = new _Validator["default"]([{
    rule: result.valid,
    message: "Invalid format/structure of input params"
  }]);
  validator.validateWithThrowError();
}

function _processInstances(instances) {
  _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateInstances).call(RequestBuilder, instances);

  return instances.filter(function (_ref7) {
    var value = _ref7.value;
    return typeof value !== 'undefined';
  }).map(function (instance) {
    var className = instance.className,
        propertyName = instance.propertyName,
        value = instance.value;

    var dependencyContext = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _getDependencyContext).call(RequestBuilder, instance);

    var baseInstance = {
      className: className,
      propertyName: propertyName,
      value: value
    };

    var instanceWithDependencyContext = _objectSpread(_objectSpread({}, baseInstance), {}, {
      dependencyContext: dependencyContext
    });

    return dependencyContext ? instanceWithDependencyContext : baseInstance;
  });
}

function _validateInstances(instances) {
  var validator = new _Validator["default"]([{
    rule: instances.some(function (instance) {
      return _RpsValue["default"].validateValue(instance);
    }),
    message: "Must be at least one valid instance object in \"instances\""
  }]);
  validator.validateWithThrowError();
}

function _validateBuild(_ref8) {
  var rightsContexts = _ref8.rightsContexts,
      requests = _ref8.requests;
  var validator = new _Validator["default"]([{
    rule: requests.length > 0,
    message: "Use \"addRequest\" method for generating request"
  }, {
    rule: rightsContexts.length > 0,
    message: "\"rightsContexts\" is empty"
  }]);
  validator.validateWithThrowError();
}

var _default = RequestBuilder;
exports["default"] = _default;
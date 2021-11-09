"use strict";

var _HttpClientCreator = _interopRequireDefault(require("./HttpClientCreator"));

var _Validator = _interopRequireDefault(require("./Validator"));

var _schemes = _interopRequireDefault(require("./schemes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

var TokenProvider = require('./TokenProvider');

var _httpClient = /*#__PURE__*/new WeakMap();

var _tokenProvider = /*#__PURE__*/new WeakMap();

var _returnOriginalResponse = /*#__PURE__*/new WeakMap();

var _secondAttempt = /*#__PURE__*/new WeakMap();

var _handleErrors = /*#__PURE__*/new WeakSet();

var EngineClient = /*#__PURE__*/function () {
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
  function EngineClient() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$config = _ref.config,
        config = _ref$config === void 0 ? {
      baseURL: '',
      json: true
    } : _ref$config,
        _ref$returnOriginalRe = _ref.returnOriginalResponse,
        returnOriginalResponse = _ref$returnOriginalRe === void 0 ? false : _ref$returnOriginalRe,
        _ref$errorHandler = _ref.errorHandler,
        errorHandler = _ref$errorHandler === void 0 ? function () {} : _ref$errorHandler,
        tokenProvider = _ref.tokenProvider,
        authorizationParams = _ref.authorizationParams;

    _classCallCheck(this, EngineClient);

    _classPrivateMethodInitSpec(this, _handleErrors);

    _classPrivateFieldInitSpec(this, _httpClient, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _tokenProvider, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _returnOriginalResponse, {
      writable: true,
      value: false
    });

    _classPrivateFieldInitSpec(this, _secondAttempt, {
      writable: true,
      value: false
    });

    _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateClient).call(EngineClient, {
      config: config,
      tokenProvider: tokenProvider,
      authorizationParams: authorizationParams
    });

    _classPrivateFieldSet(this, _returnOriginalResponse, returnOriginalResponse);

    _classPrivateFieldSet(this, _tokenProvider, tokenProvider instanceof TokenProvider ? tokenProvider : new TokenProvider(authorizationParams));

    _classPrivateFieldSet(this, _httpClient, new _HttpClientCreator["default"]({
      config: config,
      errorHandler: errorHandler
    }).create());
  }

  _createClass(EngineClient, [{
    key: "transformPostRequest",
    value: function () {
      var _transformPostRequest = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(requestData, tokenInfo) {
        var headers;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                headers = _classStaticPrivateMethodGet(EngineClient, EngineClient, _genHeaders).call(EngineClient, tokenInfo);
                return _context.abrupt("return", _classPrivateFieldGet(this, _httpClient).post('transform', requestData, {
                  headers: headers
                }));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function transformPostRequest(_x, _x2) {
        return _transformPostRequest.apply(this, arguments);
      }

      return transformPostRequest;
    }()
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

  }, {
    key: "transform",
    value: function () {
      var _transform = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(requestData) {
        var config,
            _ref2,
            _ref2$secrets,
            secrets,
            _ref2$returnOriginal,
            returnOriginal,
            tokenInfo,
            originalResponse,
            _args2 = arguments;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                config = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
                _ref2 = config || {}, _ref2$secrets = _ref2.secrets, secrets = _ref2$secrets === void 0 ? null : _ref2$secrets, _ref2$returnOriginal = _ref2.returnOriginal, returnOriginal = _ref2$returnOriginal === void 0 ? false : _ref2$returnOriginal;
                _context2.prev = 2;

                _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateRequest).call(EngineClient, requestData);

                _context2.next = 6;
                return _classPrivateFieldGet(this, _tokenProvider).getToken(secrets);

              case 6:
                tokenInfo = _context2.sent;
                _context2.next = 9;
                return this.transformPostRequest(requestData, tokenInfo);

              case 9:
                originalResponse = _context2.sent;

                _classPrivateFieldSet(this, _secondAttempt, false);

                return _context2.abrupt("return", _classPrivateFieldGet(this, _returnOriginalResponse) || returnOriginal ? originalResponse : _classStaticPrivateMethodGet(EngineClient, EngineClient, _processResponse).call(EngineClient, originalResponse, requestData));

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](2);
                return _context2.abrupt("return", _classPrivateMethodGet(this, _handleErrors, _handleErrors2).call(this, _context2.t0, requestData));

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 14]]);
      }));

      function transform(_x3) {
        return _transform.apply(this, arguments);
      }

      return transform;
    }()
  }]);

  return EngineClient;
}();

function _handleErrors2(error, requestData) {
  if (error.status === 401 && !_classPrivateFieldGet(this, _secondAttempt)) {
    _classPrivateFieldSet(this, _secondAttempt, true);

    return this.transform(requestData);
  } else {
    _classPrivateFieldSet(this, _secondAttempt, false);

    return Promise.reject(error);
  }
}

function _validateClient(_ref3) {
  var tokenProvider = _ref3.tokenProvider,
      config = _ref3.config,
      authorizationParams = _ref3.authorizationParams;
  var validator = new _Validator["default"]([{
    rule: !!(config !== null && config !== void 0 && config.baseURL),
    message: "\"config.baseURL\" is required field, must be defined"
  }, {
    rule: tokenProvider instanceof TokenProvider || !!(authorizationParams !== null && authorizationParams !== void 0 && authorizationParams.engineAuthEndpoint),
    message: "For external TokenProvider \"tokenProvider\" must be defined as instance of TokenProvider;\n        For build-in TokenProvider \"authorizationParams.engineAuthEndpoint\" is required field."
  }]);
  validator.validateWithThrowError();
}

function _validateReferences(requestData) {
  var _ref4 = requestData || {},
      _ref4$requests = _ref4.requests,
      requests = _ref4$requests === void 0 ? [] : _ref4$requests,
      _ref4$processingConte = _ref4.processingContexts,
      processingContexts = _ref4$processingConte === void 0 ? [] : _ref4$processingConte,
      _ref4$rightsContexts = _ref4.rightsContexts,
      rightsContexts = _ref4$rightsContexts === void 0 ? [] : _ref4$rightsContexts;

  var checkReference = function checkReference(contexts, guid) {
    return contexts.find(function (c) {
      return c.guid === guid;
    });
  };

  var isValid = requests.every(function (_ref5) {
    var processingContext = _ref5.processingContext,
        rightsContext = _ref5.rightsContext;
    return (typeof processingContext === 'undefined' || checkReference(processingContexts, processingContext)) && checkReference(rightsContexts, rightsContext);
  });
  var validator = new _Validator["default"]([{
    rule: isValid,
    message: "\"requestData\" contains requests with invalid processing/rights context references"
  }]);
  validator.validateWithThrowError();
}

function _validateSchema(requestData) {
  var result = _schemes["default"].validate(requestData, {
    $ref: '/RequestData'
  });

  var validator = new _Validator["default"]([{
    rule: result.valid,
    message: "Invalid \"requestData\" format/structure"
  }]);
  validator.validateWithThrowError();
}

function _validateRequest(requestData) {
  _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateSchema).call(EngineClient, requestData);

  _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateReferences).call(EngineClient, requestData);
}

function _genHeaders(_ref6) {
  var tokenType = _ref6.tokenType,
      token = _ref6.token;
  return {
    'Content-Type': 'application/json',
    'Authorization': "".concat(tokenType, " ").concat(token)
  };
}

function _processResponse(originalResponse, requestData) {
  var _ref7 = (originalResponse === null || originalResponse === void 0 ? void 0 : originalResponse.data) || {},
      _ref7$responses = _ref7.responses,
      responses = _ref7$responses === void 0 ? [] : _ref7$responses;

  var processedResponses = responses.map(function (response) {
    var request = requestData.requests.find(function (_ref8) {
      var guid = _ref8.guid;
      return guid === response.request;
    });
    return _objectSpread(_objectSpread({}, response), {}, {
      instances: response.instances.map(function (_ref9, instanceIndex) {
        var className = _ref9.className,
            propertyName = _ref9.propertyName,
            transformed = _ref9.value,
            error = _ref9.error;
        var baseInstance = {
          className: className,
          propertyName: propertyName,
          transformed: transformed,
          original: request.instances[instanceIndex].value
        };
        return !!error ? _objectSpread(_objectSpread({}, baseInstance), {}, {
          error: error
        }) : baseInstance;
      })
    });
  });
  return _objectSpread(_objectSpread({}, originalResponse), {}, {
    data: {
      responses: processedResponses
    }
  });
}

module.exports = {
  EngineClient: EngineClient
};
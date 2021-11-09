"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var _setInterceptors = /*#__PURE__*/new WeakMap();

var _errorHandlerInterceptor = /*#__PURE__*/new WeakMap();

var HttpClientCreator = /*#__PURE__*/function () {
  /**
   * Generates new axios client with interceptors
   *
   * @param {object} config - axios config
   * @param {function} errorHandler - custom error handler
   *
   */
  function HttpClientCreator(_ref) {
    var _this = this;

    var _ref$config = _ref.config,
        _config = _ref$config === void 0 ? {} : _ref$config,
        _ref$errorHandler = _ref.errorHandler,
        errorHandler = _ref$errorHandler === void 0 ? function () {} : _ref$errorHandler;

    _classCallCheck(this, HttpClientCreator);

    _classPrivateFieldInitSpec(this, _setInterceptors, {
      writable: true,
      value: function value(httpClient) {
        httpClient.interceptors.request.use(_classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _startTimeInterceptor));
        httpClient.interceptors.request.use(_classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _loggerInterceptor));
        httpClient.interceptors.response.use(function (response) {
          return _classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _addDurationInterceptor).call(HttpClientCreator, response, 'success');
        }, function (error) {
          return _classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _addDurationInterceptor).call(HttpClientCreator, error, 'error');
        });
        httpClient.interceptors.request.use(function (config) {
          return config;
        }, _classPrivateFieldGet(_this, _errorHandlerInterceptor));
        httpClient.interceptors.response.use(function (response) {
          return response;
        }, _classPrivateFieldGet(_this, _errorHandlerInterceptor));
      }
    });

    _classPrivateFieldInitSpec(this, _errorHandlerInterceptor, {
      writable: true,
      value: function value(error) {
        var errorResponse = (error === null || error === void 0 ? void 0 : error.response) || {};

        var errorData = _objectSpread(_objectSpread({}, errorResponse.data), {}, {
          status: errorResponse.status
        });

        _this.errorHandler(errorData);

        return Promise.reject(errorData);
      }
    });

    this.config = _config;
    this.axiosClient = null;
    this.errorHandler = errorHandler;
  }

  _createClass(HttpClientCreator, [{
    key: "create",
    value: function create() {
      this.axiosClient = _axios["default"].create(this.config);

      _classPrivateFieldGet(this, _setInterceptors).call(this, this.axiosClient);

      return this.axiosClient;
    }
  }]);

  return HttpClientCreator;
}();

var _startTimeInterceptor = {
  writable: true,
  value: function value(config) {
    return _objectSpread(_objectSpread({}, config), {}, {
      metadata: {
        startTime: new Date()
      }
    });
  }
};
var _addDurationInterceptor = {
  writable: true,
  value: function value(resOrErr) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
    resOrErr.config.metadata.endTime = new Date();
    resOrErr.duration = resOrErr.config.metadata.endTime - resOrErr.config.metadata.startTime;
    return type === 'success' ? resOrErr : Promise.reject(resOrErr);
  }
};
var _loggerInterceptor = {
  writable: true,
  value: function value(config) {
    return config;
  }
};
var _default = HttpClientCreator;
exports["default"] = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _HttpClientCreator = _interopRequireDefault(require("./HttpClientCreator"));

var _Validator = _interopRequireDefault(require("./Validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var _httpClient = /*#__PURE__*/new WeakMap();

var _clientSecret = /*#__PURE__*/new WeakMap();

var _data = /*#__PURE__*/new WeakMap();

var _setSecrets = /*#__PURE__*/new WeakSet();

var TokenProvider = /*#__PURE__*/function () {
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
  function TokenProvider() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        engineAuthEndpoint = _ref.engineAuthEndpoint,
        _clientId = _ref.clientId,
        _clientSecret2 = _ref.clientSecret,
        token = _ref.token,
        tokenType = _ref.tokenType;

    _classCallCheck(this, TokenProvider);

    _classPrivateMethodInitSpec(this, _setSecrets);

    _classPrivateFieldInitSpec(this, _data, {
      get: _get_data,
      set: void 0
    });

    _classPrivateFieldInitSpec(this, _httpClient, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _clientSecret, {
      writable: true,
      value: void 0
    });

    var config = {
      baseURL: engineAuthEndpoint,
      json: true
    };

    _classStaticPrivateMethodGet(TokenProvider, TokenProvider, _validateTokenProvider).call(TokenProvider, engineAuthEndpoint);

    this.token = token;
    this.tokenType = tokenType;

    _classPrivateFieldSet(this, _httpClient, new _HttpClientCreator["default"]({
      config: config
    }).create());

    this.clientId = _clientId;

    _classPrivateFieldSet(this, _clientSecret, _clientSecret2);
  }

  _createClass(TokenProvider, [{
    key: "isAuthorized",
    get: function get() {
      var tokenType = this.tokenType,
          token = this.token;
      return tokenType && token;
    }
  }, {
    key: "getToken",
    value: function () {
      var _getToken = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(secrets) {
        var tokenType, token;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isAuthorized) {
                  _context.next = 5;
                  break;
                }

                tokenType = this.tokenType, token = this.token;
                return _context.abrupt("return", {
                  tokenType: tokenType,
                  token: token
                });

              case 5:
                return _context.abrupt("return", this.generateToken(secrets));

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getToken(_x) {
        return _getToken.apply(this, arguments);
      }

      return getToken;
    }()
  }, {
    key: "generateToken",
    value: function () {
      var _generateToken = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(secrets) {
        var response, _ref2, token, expiresIn, tokenType, scope;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!!secrets) _classPrivateMethodGet(this, _setSecrets, _setSecrets2).call(this, secrets);
                _context2.prev = 1;

                _classStaticPrivateMethodGet(TokenProvider, TokenProvider, _validateGenerateToken).call(TokenProvider, this);

                _context2.next = 5;
                return _classPrivateFieldGet(this, _httpClient).call(this, {
                  method: 'post',
                  data: _classPrivateFieldGet(this, _data)
                });

              case 5:
                response = _context2.sent;
                _ref2 = (response === null || response === void 0 ? void 0 : response.data) || {}, token = _ref2.access_token, expiresIn = _ref2.expires_in, tokenType = _ref2.token_type, scope = _ref2.scope;
                return _context2.abrupt("return", {
                  token: token,
                  expiresIn: expiresIn,
                  tokenType: tokenType,
                  scope: scope
                });

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](1);
                return _context2.abrupt("return", Promise.reject(_context2.t0));

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 10]]);
      }));

      function generateToken(_x2) {
        return _generateToken.apply(this, arguments);
      }

      return generateToken;
    }()
  }]);

  return TokenProvider;
}();

function _get_data() {
  return "grant_type=client_credentials&client_id=".concat(this.clientId, "&client_secret=").concat(_classPrivateFieldGet(this, _clientSecret));
}

function _setSecrets2() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      clientSecret = _ref3.clientSecret,
      clientId = _ref3.clientId;

  if (clientId) this.clientId = clientId;
  if (clientSecret) _classPrivateFieldSet(this, _clientSecret, clientSecret);
}

function _validateTokenProvider(engineAuthEndpoint) {
  var validator = new _Validator["default"]([{
    rule: !!engineAuthEndpoint,
    message: "\"engineAuthEndpoint\" is required field, must be defined"
  }]);
  validator.validateWithThrowError();
}

function _validateGenerateToken(secrets) {
  var validator = new _Validator["default"]([{
    rule: !!secrets.clientId,
    message: "\"clientId\" is required field, must be defined"
  }, {
    rule: !!_classPrivateFieldGet(secrets, _clientSecret),
    message: "\"clientSecret\" is required field, must be defined"
  }]);
  validator.validateWithThrowError();
}

var _default = TokenProvider;
exports["default"] = _default;
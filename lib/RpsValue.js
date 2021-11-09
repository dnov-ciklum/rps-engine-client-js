"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("./utils");

var _Validator = _interopRequireDefault(require("./Validator"));

var _schemes = _interopRequireDefault(require("./schemes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RPSValue = /*#__PURE__*/function () {
  /**
   * RPSValue class
   *
   * @param {string} className - required
   * @param {string} propertyName - required
   * @param {*} value - required, can be empty, but undefined is not valid
   * @param {object} dependencies - not required, e.g. {name: 'value', name2: 'value2'}
   *
   */
  function RPSValue() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        className = _ref.className,
        propertyName = _ref.propertyName,
        value = _ref.value,
        _ref$dependencies = _ref.dependencies,
        dependencies = _ref$dependencies === void 0 ? null : _ref$dependencies;

    _classCallCheck(this, RPSValue);

    RPSValue.validateValue({
      className: className,
      propertyName: propertyName,
      value: value
    });
    this.className = className;
    this.propertyName = propertyName;
    this.value = value;
    this.dependencies = (0, _utils.isObject)(dependencies) ? dependencies : null;
    this.error = null;
    this.transformed = null;
  }

  _createClass(RPSValue, [{
    key: "original",
    get: function get() {
      return this.value;
    }
  }, {
    key: "setError",
    value: function setError(error) {
      this.error = error;
    }
  }, {
    key: "setTransformedValue",
    value: function setTransformedValue(transformedValue) {
      this.transformed = transformedValue;
    }
  }], [{
    key: "validateValue",
    value: function validateValue(params) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var className = params.className,
          propertyName = params.propertyName,
          value = params.value;

      var result = _schemes["default"].validate(params, {
        $ref: '/Instance'
      });

      var validator = new _Validator["default"]([{
        rule: !!className,
        message: "Required property \"className\" is missing or empty"
      }, {
        rule: !!propertyName,
        message: "Required property \"propertyName\" is missing or empty"
      }, {
        rule: typeof value !== 'undefined',
        message: "Required property \"value\" is undefined"
      }, {
        rule: result.valid,
        message: "Invalid \"requestData\" format/structure"
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }
  }]);

  return RPSValue;
}();

var _default = RPSValue;
exports["default"] = _default;
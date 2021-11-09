"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Validator = /*#__PURE__*/function () {
  function Validator(rules) {
    _classCallCheck(this, Validator);

    this.rules = rules;
    this.errors = [];
  }

  _createClass(Validator, [{
    key: "validate",
    value: function validate() {
      this.errors = this.rules.filter(function (_ref) {
        var rule = _ref.rule;
        return !rule;
      }).map(function (_ref2) {
        var message = _ref2.message;
        return message;
      });
      return this.errors.length === 0;
    }
  }, {
    key: "validateWithThrowError",
    value: function validateWithThrowError() {
      var isValid = this.validate();
      var error = this.errors.join('\r\n');

      if (!isValid) {
        throw new Error(error);
      } else {
        return isValid;
      }
    }
  }]);

  return Validator;
}();

var _default = Validator;
exports["default"] = _default;
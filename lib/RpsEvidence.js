"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _schemes = _interopRequireDefault(require(".schemes"));

var _Validator = _interopRequireDefault(require("./Validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RPSEvidence = /*#__PURE__*/function () {
  /**
   * Evidence class
   *
   * @param {object} evidence - {name: 'name', value: 'value}
   * @param {string} evidence.name - evidence name
   * @param {string} evidence.value - evidence value
   */
  function RPSEvidence(_ref) {
    var name = _ref.name,
        value = _ref.value;

    _classCallCheck(this, RPSEvidence);

    RPSEvidence.validateEvidence({
      name: name,
      value: value
    });
    this.name = name;
    this.value = value;
  }

  _createClass(RPSEvidence, null, [{
    key: "validateEvidence",
    value: function validateEvidence(evidence) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var result = _schemes["default"].validate(evidence, {
        $ref: '/Evidence'
      });

      var validator = new _Validator["default"]([{
        rule: result.valid,
        message: "Invalid \"evidence\" format/structure"
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }
  }]);

  return RPSEvidence;
}();

var _default = RPSEvidence;
exports["default"] = _default;
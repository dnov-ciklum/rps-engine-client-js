"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _schemes = _interopRequireDefault(require("./schemes"));

var _Validator = _interopRequireDefault(require("./Validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RPSContext = /*#__PURE__*/function () {
  /**
   * Context class with evidences as dictionary or list
   *
   * @param {object|object[]} evidences - Array of evidences like [{name: 'name', value: 'value}] or dictionary like {name: value}
   */
  function RPSContext(evidences) {
    _classCallCheck(this, RPSContext);

    RPSContext.validateEvidences(evidences);
    this.evidences = evidences;
  }

  _createClass(RPSContext, null, [{
    key: "validateEvidences",
    value: function validateEvidences(evidences) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var result = _schemes["default"].validate(evidences, {
        $ref: '/ExtendedEvidences'
      });

      var validator = new _Validator["default"]([{
        rule: !!evidences,
        message: "Required parameter \"evidences\" is missing"
      }, {
        rule: result.valid,
        message: "Invalid \"evidences\" format/structure"
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }
  }]);

  return RPSContext;
}();

var _default = RPSContext;
exports["default"] = _default;
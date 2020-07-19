"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The App Error class
 */
class AppError extends Error {
  /**
   * @param {String} message The error message
   * @param {Number} code The status code of the error
   * @param {Object} messages The optional error messages
   */
  constructor(message, code, messages = null) {
    super(message);
    this._code = code;

    if (messages) {
      this._messages = messages;
    } // Error.captureStackTrace(this, AppError);

  }
  /**
   * @return {Number}
   */


  get code() {
    return this._code;
  }
  /**
   * @return {Array}
   */


  get messages() {
    return this._messages;
  }
  /**
   * @return {Object} The instance of AppError
   */


  format() {
    const obj = {
      code: this._code,
      message: this.message
    };

    if (this.messages) {
      obj.messages = this.validationErrorsToArray(this._messages);
    }

    return obj;
  }
  /**
   * @param {Object} error The error object
   * @return {Object} The errors array
   */


  validationErrorsToArray(error) {
    const errorsArray = [];

    if (!_underscore.default.isEmpty(error)) {
      for (const prop in error) {
        if (error.hasOwnProperty(prop)) {
          _underscore.default.forEach(error[prop], errorMessage => {
            errorsArray.push(errorMessage);
          });
        }
      }
    }

    return errorsArray;
  }

}

var _default = AppError;
exports.default = _default;
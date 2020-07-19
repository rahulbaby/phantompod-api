"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Otp", {
  enumerable: true,
  get: function () {
    return _otp.default;
  }
});
Object.defineProperty(exports, "sendSms", {
  enumerable: true,
  get: function () {
    return _sendSms.default;
  }
});

var _otp = _interopRequireDefault(require("./otp"));

var _sendSms = _interopRequireDefault(require("./sendSms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
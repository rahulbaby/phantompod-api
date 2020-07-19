"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.validateOtp = void 0;

var _helpers = require("../helpers");

const validateOtp = callback => {
  let checkOtp = (req, res) => {
    if (!_helpers.Otp.verifyOtp(req.body.otp, req.body.code)) return res.status(500).send({
      msg: 'Wrong OTP!'
    });
    callback(req, res);
  };

  return checkOtp;
};

exports.validateOtp = validateOtp;
var _default = validateOtp;
exports.default = _default;
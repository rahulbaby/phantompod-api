"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.verifyOtp = exports.generateOtp = void 0;

var _speakeasy = _interopRequireDefault(require("speakeasy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const encoding = 'base32';
const timeDefault = 60 * 5;

const generateOtp = () => {
  let secret = _speakeasy.default.generateSecret();

  let token = _speakeasy.default.totp({
    secret: secret.base32,
    encoding,
    time: timeDefault // specified in seconds

  });

  console.log({
    token
  });
  return {
    otp: token,
    code: secret.base32
  };
};

exports.generateOtp = generateOtp;

const verifyOtp = (otp, code) => {
  let verified = _speakeasy.default.totp.verify({
    secret: code,
    encoding,
    token: otp,
    time: timeDefault
  });

  return verified;
};

exports.verifyOtp = verifyOtp;
var _default = {
  generateOtp,
  verifyOtp
};
exports.default = _default;
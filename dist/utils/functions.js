"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomPassword = void 0;

const randomPassword = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';

  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  return retVal;
};

exports.randomPassword = randomPassword;
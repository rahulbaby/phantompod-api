"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "userAccountStatus", {
  enumerable: true,
  get: function () {
    return _constants.userAccountStatus;
  }
});
exports.paymentCredentials = exports.podMemeberStatus = exports.comments = void 0;

var _config = _interopRequireDefault(require("config"));

var _constants = require("../base/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const comments = ['Great post {{firstName}}!', 'Thanks for sharing {{firstName}}!', 'Love it {{firstName}}!', 'What a great post', 'Always great reading your posts!'];
exports.comments = comments;
const podMemeberStatus = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  BANNED: 'banned'
};
exports.podMemeberStatus = podMemeberStatus;

const PUBLIC_KEY = _config.default.get('stripe.PUBLIC_KEY');

const PRODUCT_PRICE_ID = _config.default.get('stripe.PRODUCT_PRICE_ID');

const apiVersion = _config.default.get('stripe.apiVersion');

const PRODUCT_NAME = _config.default.get('stripe.PRODUCT_NAME');

const paymentCredentials = {
  PUBLIC_KEY,
  PRODUCT_PRICE_ID,
  apiVersion,
  PRODUCT_NAME
};
exports.paymentCredentials = paymentCredentials;
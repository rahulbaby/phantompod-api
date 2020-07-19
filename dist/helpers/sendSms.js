"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _superagent = _interopRequireDefault(require("superagent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const username = 'arisetothink';
const password = 'ScienceHub';
const sendername = 'AARISE';
const routetype = 1;

var _default = async (mobile, message) => {
  console.log(mobile, message);

  _superagent.default.post('http://sapteleservices.com/SMS_API/sendsms.php').query({
    username,
    password,
    mobile,
    message,
    sendername,
    routetype
  }).set('accept', 'json').end((err, result) => {
    return result.status === 200;
  });
};

exports.default = _default;
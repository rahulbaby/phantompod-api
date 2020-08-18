"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _user = _interopRequireDefault(require("../controllers/user"));

var _payments = _interopRequireDefault(require("../controllers/payments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/user').get(_user.default.index);
router.route('/payments').get(_payments.default.index);
var _default = router;
exports.default = _default;
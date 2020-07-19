"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _notification = _interopRequireDefault(require("../controllers/notification"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/').get(_notification.default.index);
router.route('/read/:_id').get(_notification.default.read);
router.route('/read-all').get(_notification.default.readAll);
var _default = router;
exports.default = _default;
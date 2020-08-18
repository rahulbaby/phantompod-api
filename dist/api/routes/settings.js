"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _settings = _interopRequireDefault(require("../controllers/settings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/').get(_settings.default.index);
router.route('/update').put(_settings.default.update);
var _default = router;
exports.default = _default;
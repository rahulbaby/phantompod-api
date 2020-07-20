"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _post = _interopRequireDefault(require("../controllers/post"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/').get(_post.default.index);
router.route('/').post(_post.default.create);
router.route('/approve').put(_post.default.approve);
router.route('/').delete(_post.default.destroy);
var _default = router;
exports.default = _default;
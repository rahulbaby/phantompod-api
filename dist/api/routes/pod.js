"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _pod = _interopRequireDefault(require("../controllers/pod"));

var _middlewares = require("../../middlewares");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/').get(_pod.default.index);
router.route('/').post(_pod.default.create);
router.route('/').put(_pod.default.update);
router.route('/').delete(_pod.default.destroy);
router.route('/marketplace').get(_pod.default.marketplace);
router.route('/alter-members').put(_pod.default.allterMembers);
router.route('/request-member-access').put(_pod.default.allterMembers);
router.route('/alter-member-access').put(_pod.default.allterMemberAcccess);
router.route('/remove-member').put(_pod.default.removeMemberAcccess);
router.route('/active-members').get(_pod.default.getActiveMembers);
var _default = router;
exports.default = _default;
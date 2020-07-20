"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _user = _interopRequireDefault(require("../controllers/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/').post(_user.default.create);
router.route('/verifyUser').post(_user.default.verifyHash);
router.route('/update-billing-details').post(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.updateBillingDetails);
router.route('/update-linkedinid').post(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.updateLinkeinid);
router.route('/reset-user').get(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.resetPaymentDetails);
router.route('/create-trial-subscription').post(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.createTrialSubscription);
router.route('/reset-password').post(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.resetPassword);
router.route('/update-profile-image').post(_passport.default.authenticate('jwt', {
  session: false
}), _user.default.updateProfileImage);
var _default = router;
exports.default = _default;
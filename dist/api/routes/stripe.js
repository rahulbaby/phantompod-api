"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _stripe = _interopRequireDefault(require("../controllers/stripe"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/cancel-subscription').post(_passport.default.authenticate('jwt', {
  session: false
}), _stripe.default.cancelSubscription);
router.route('/create-customer').get(_passport.default.authenticate('jwt', {
  session: false
}), _stripe.default.createCustomer);
router.route('/create-subscription').post(_passport.default.authenticate('jwt', {
  session: false
}), _stripe.default.createSubscription);
router.route('/create-subscription--bkup').post(_stripe.default.createSubscription);
router.route('/subscription-list').post(_stripe.default.subscriptionList);
router.route('/webhooks').post(_stripe.default.webhooks);
var _default = router;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const requireSubscription = (trialAllowed = true) => {
  return (req, res, next) => {
    if (req.user.isActive || trialAllowed && req.user.onTrial) {
      next();
    } else {
      return res.status(400).send({
        message: "You don't have any active subscription"
      });
    }
  };
};

var _default = requireSubscription;
exports.default = _default;
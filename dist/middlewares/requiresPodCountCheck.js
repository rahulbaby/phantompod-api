"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("config"));

var _pod = _interopRequireDefault(require("../api/models/pod"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const POD_COUNT = _config.default.get('trialSubscription.POD_COUNT');

const middleWareFun = () => {
  return async (req, res, next) => {
    if (req.user.isActive) {
      next();
    } else {
      let query = [{
        'members.userId': req.user._id
      }, {
        userId: req.user._id
      }];
      let podCount = await _pod.default.count(query);
      if (podCount >= POD_COUNT) return res.status(400).send({
        message: `No more than ${POD_COUNT} pods allowded for trial account`
      });else next();
    }
  };
};

var _default = middleWareFun;
exports.default = _default;
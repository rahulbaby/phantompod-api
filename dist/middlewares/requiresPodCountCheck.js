"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("config"));

var _pod = _interopRequireDefault(require("../api/models/pod"));

var _settings = require("../api/models/settings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const middleWareFun = () => {
  return async (req, res, next) => {
    if (req.user.isActive) {
      next();
    } else {
      const POD_COUNT = await (0, _settings.getRow)('trialPodCount');
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
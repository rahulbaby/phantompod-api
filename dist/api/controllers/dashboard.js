"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pod = _interopRequireDefault(require("../models/pod"));

var _post = _interopRequireDefault(require("../models/post"));

var _user = _interopRequireDefault(require("../models/user"));

var _constants = require("../../base/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BlockController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        const userId = req.user.id;
        const profileViews = req.user.profileViews;
        const podsOwn = await _pod.default.where({
          userId
        }).countDocuments();
        const podsImIn = await _pod.default.where({
          members: {
            $elemMatch: {
              userId: userId,
              status: _constants.podMemeberStatus.ACCEPTED
            }
          }
        }).countDocuments();
        const postLikes = await _post.default.aggregate([{
          $group: {
            _id: null,
            count: {
              $sum: 'postLikes'
            }
          }
        }]);
        return res.send({
          podsOwn,
          podsImIn,
          profileViews,
          postLikes: postLikes.count
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "postsByLike", async (req, res, next) => {
      try {
        const userId = req.user.id;
        const posts = await _post.default.where({
          userId
        });
        return res.send({
          posts
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });
  }

}

var _default = new BlockController();

exports.default = _default;
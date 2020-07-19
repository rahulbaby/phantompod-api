"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pod = _interopRequireDefault(require("../models/pod"));

var _post = _interopRequireDefault(require("../models/post"));

var _notification = require("../models/notification");

var _underscore = require("underscore");

var _db = require("../../db");

var _constants = require("../../base/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PostController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
        paginateOptions.populate = {
          path: 'userId',
          select: ['_id', 'name']
        };
        let query = req.query.query ? JSON.parse(req.query.query) : {};
        query.$or = [{
          'members.userId': req.user._id
        }, {
          userId: req.user._id
        }];
        let ret = await _post.default.paginate(query, paginateOptions);
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "create", async (req, res, next) => {
      let _id = req.body._id;
      let podId = req.body.podId;

      let data = _underscore._.pick(req.body, 'podId', 'url', 'name', 'comments', 'autoShare', 'autoLike', 'autoComment', 'autoValidate');

      try {
        const pod = await _pod.default.getPodRow(podId);
        if (!pod) return res.status(500).send({
          message: "Pod doesn't exists!"
        });
        data.approved = pod.autoValidate;
        data.userId = req.user._id;
        let record = new _post.default(data);
        let ret = await record.save();
        return res.send({
          ret
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "destroy", async (req, res, next) => {
      const _id = req.body.id;
      const userId = req.user._id;

      try {
        let ret = await _post.default.findOneAndDelete({
          _id: (0, _db.toMongoObjectId)(_id),
          userId
        });
        return res.send({
          message: 'Deleted',
          ret
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

var _default = new PostController();

exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _notification = _interopRequireDefault(require("../models/notification"));

var _db = require("../../db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class NotificationController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {
          sort: {
            seen: 1
          }
        };
        let query = {
          receiver: req.user._id
        };
        let ret = await _notification.default.paginate(query, paginateOptions);
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "read", async (req, res, next) => {
      const _id = req.params._id;

      try {
        let ret = await _notification.default.findOneAndUpdate({
          _id: (0, _db.toMongoObjectId)(_id)
        }, {
          seen: true
        });
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "readAll", async (req, res, next) => {
      const userId = req.user.id;

      try {
        let ret = await _notification.default.updateMany({
          receiver: userId
        }, {
          seen: true
        });
        return res.send(ret);
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

var _default = new NotificationController();

exports.default = _default;
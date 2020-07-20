"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pod = _interopRequireDefault(require("../models/pod"));

var _user = _interopRequireDefault(require("../models/user"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

var _config = _interopRequireDefault(require("config"));

var _notification = require("../models/notification");

var _underscore = require("underscore");

var _constants = require("../../base/constants");

var _db = require("../../db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const POD_COUNT = _config.default.get('trialSubscription.POD_COUNT');

const uid = new _shortUniqueId.default({
  length: 8
});

class PodController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
        let query = req.query.query ? JSON.parse(req.query.query) : {};
        query.$or = [{
          userId: req.user._id
        }, {
          members: {
            $elemMatch: {
              userId: req.user._id,
              status: _constants.podMemeberStatus.ACCEPTED
            }
          }
        }];
        let ret = await _pod.default.paginate(query, paginateOptions);
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "marketplace", async (req, res, next) => {
      try {
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
        let query = req.query.query ? JSON.parse(req.query.query) : {};
        query.$and = [{
          isPrivate: false
        }, {
          userId: {
            $ne: req.user._id
          }
        }, {
          'members.userId': {
            $ne: req.user._id
          }
        }];
        let ret = await _pod.default.paginate(query, paginateOptions);
        return res.send(ret);
      } catch (error) {
        x;
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "create", async (req, res, next) => {
      let _id = req.body._id;
      const userId = req.user._id;

      let data = _underscore._.pick(req.body, 'isPrivate', 'name', 'description', 'comments', 'autoShare', 'autoLike', 'autoComment', 'autoValidate');

      try {
        const activePods = await _pod.default.paginate({
          $or: [{
            userId
          }, {
            members: {
              $elemMatch: {
                userId,
                status: _constants.podMemeberStatus.ACCEPTED
              }
            }
          }]
        });
        if (activePods.total >= POD_COUNT && req.user.onTrial) return res.status(400).send({
          message: `No more than ${POD_COUNT} pods allowded for trial account`
        });
        if (!req.user.isActive && !req.user.onTrial) return res.status(400).send({
          message: `You don't have any active plans!`
        });
        data.userId = userId;
        data.podKey = uid();
        data.members = [{
          userId,
          name: req.user.name,
          status: _constants.podMemeberStatus.ACCEPTED
        }];
        let record = new _pod.default(data);
        let ret = await record.save();
        _id = ret._id;
        return res.send({
          _id
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "update", async (req, res, next) => {
      let _id = req.body._id;
      const userId = req.user._id;

      let data = _underscore._.pick(req.body, 'isPrivate', 'name', 'description', 'comments', 'autoShare', 'autoLike', 'autoComment', 'autoValidate');

      try {
        await _pod.default.findByIdAndUpdate(_id, data);
        return res.send({
          _id
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "allterMembers", async (req, res, next) => {
      const podKey = req.body.id;
      const remove = req.body.remove;
      const userId = req.user._id;
      const userName = req.user.name;
      let record = await _pod.default.findOne({
        podKey
      });
      if (!record) return res.status(500).send({
        message: "Pod doesn't exists"
      });
      if (record.userId === userId) return res.status(500).send({
        message: 'You own this pod.'
      });
      let existing = record.members.find(x => x.userId.toString() == userId.toString());

      if (remove && existing) {
        record.members.id(existing._id).remove();
      } else if (!existing && !remove) {
        let notificationLabel = `${userName} requested to join your pod <strong>${record.name}</strong>`;
        await (0, _notification.createNotification)(userId, record.userId, notificationLabel, {
          id: record._id
        });
        record.members.push({
          userId,
          name: userName,
          status: _constants.podMemeberStatus.REQUESTED
        });
      } else if (existing && !remove) {
        return res.status(400).send({
          message: 'You already requested for this pod.'
        });
      }

      try {
        await record.save();
        return res.send({
          record,
          message: 'Success'
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "allterMemberAcccess", async (req, res, next) => {
      const {
        _id,
        podId,
        memberId,
        status
      } = req.body;
      const userId = req.user._id;
      const userName = req.user.name;
      let record = await _pod.default.findOne({
        _id: podId
      });
      if (!record) return res.status(500).send({
        message: "Pod doesn't exists"
      });
      if (record.userId.toString() !== userId.toString()) return res.status(500).send({
        message: "You don' have permission"
      });
      let existing = record.members.findIndex(x => x.userId.toString() == memberId.toString());
      if (existing < 0) return res.status(500).send({
        message: "Member doesn't exists"
      });
      record.members[existing].status = status;

      try {
        if (status === _constants.podMemeberStatus.ACCEPTED) {
          const member = await _user.default.findOne({
            _id: memberId
          });
          const activePods = await _pod.default.paginate({
            $or: [{
              userId: memberId
            }, {
              members: {
                $elemMatch: {
                  userId: memberId,
                  status: _constants.podMemeberStatus.ACCEPTED
                }
              }
            }]
          });
          if (activePods.total >= POD_COUNT && member.onTrial) return res.status(400).send({
            message: `No more than ${POD_COUNT} pods allowded for trial account`
          });
          if (!member.isActive && !member.onTrial) return res.status(400).send({
            message: `User doesn't have any active plans!`
          });
        }

        let notificationLabel = `${userName} ${status} for your pod request <strong>${record.name}</strong>`;
        await (0, _notification.createNotification)(record.userId, memberId, notificationLabel, {
          id: record._id
        });
        await record.save();
        return res.send({
          record,
          message: 'Success'
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "removeMemberAcccess", async (req, res, next) => {
      const {
        _id,
        podId,
        memberId
      } = req.body;
      const userId = req.user._id;
      const userName = req.user.name;
      let record = await _pod.default.findOne({
        _id: podId
      });
      if (!record) return res.status(500).send({
        message: "Pod doesn't exists"
      });
      if (record.userId.toString() !== userId.toString()) return res.status(500).send({
        message: "You don' have permission"
      });
      let existing = record.members.findIndex(x => x.userId.toString() == memberId.toString());
      if (existing < 0) return res.status(500).send({
        message: "Member doesn't exists"
      });
      record.members = record.members.filter(x => x.userId.toString() != memberId.toString());

      try {
        let notificationLabel = `${userName} removed from pod - <strong>${record.name}</strong>`;
        await (0, _notification.createNotification)(record.userId, memberId, notificationLabel, {
          id: record._id
        });
        await record.save();
        return res.send({
          record,
          message: 'Success'
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
        let ret = await _pod.default.findOneAndDelete({
          _id: (0, _db.toMongoObjectId)(_id),
          userId
        });
        return res.send({
          message: 'deleted',
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

var _default = new PodController();

exports.default = _default;
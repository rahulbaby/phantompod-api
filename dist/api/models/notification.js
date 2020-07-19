"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNotification = exports.default = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _db = require("../../db");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const notificationSchema = new _mongoose.Schema({
  sender: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  label: String,
  seen: {
    type: Boolean,
    default: false
  },
  meta: {
    id: _mongoose.Schema.Types.ObjectId,
    url: String
  }
}, {
  timestamps: true
});
notificationSchema.plugin(_db.paginatePlugin);

const Notification = _mongoose.default.model('Notification', notificationSchema);

var _default = Notification;
exports.default = _default;

const createNotification = async (sender, receiver, label, meta = {}) => {
  let record = new Notification({
    sender,
    receiver,
    label,
    meta
  });
  let ret = await record.save();
  return ret;
};

exports.createNotification = createNotification;
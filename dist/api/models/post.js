"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseUniqueValidator = _interopRequireDefault(require("mongoose-unique-validator"));

var _db = require("../../db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const postSchema = new _mongoose.Schema({
  userId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  podId: {
    type: _mongoose.Schema.Types.ObjectId,
    //ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  url: {
    type: String,
    required: [true, "can't be blank"] //unique: [true, 'already exists'],

  },
  comments: [String],
  autoShare: Boolean,
  autoLike: Boolean,
  autoComment: Boolean,
  approved: Boolean,
  postLikes: Number
}, {
  timestamps: true
});
postSchema.plugin(_mongooseUniqueValidator.default, {
  message: 'is already taken.'
});
postSchema.plugin(_db.paginatePlugin);

var _default = _mongoose.default.model('Post', postSchema);

exports.default = _default;
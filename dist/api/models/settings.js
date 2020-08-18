"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRow = exports.default = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const settingsSchema = new _mongoose.Schema({
  trialDayCount: Number,
  trialPodCount: Number,
  productPriceId: String,
  productName: String,
  productPeriod: Number
}, {
  timestamps: true
});

const Settings = _mongoose.default.model('Settings', settingsSchema);

var _default = Settings;
exports.default = _default;

const getRow = async (key = null) => {
  let ret = await Settings.findOne();
  return key ? ret[key] : ret;
};

exports.getRow = getRow;
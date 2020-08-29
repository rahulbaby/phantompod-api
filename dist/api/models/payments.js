"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPayment = exports.default = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _db = require("../../db");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const paymentsSchema = new _mongoose.Schema({
  user: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount_paid: String,
  currency: String,
  meta: _mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});
paymentsSchema.plugin(_db.paginatePlugin);

const Payments = _mongoose.default.model('Payments', paymentsSchema);

var _default = Payments;
exports.default = _default;

const createPayment = async (user, amount_paid, currency, meta = {}) => {
  console.log({
    user,
    amount_paid,
    currency
  });
  let record = new Payments({
    user,
    amount_paid,
    currency,
    meta
  });
  let ret = await record.save();
  return ret;
};

exports.createPayment = createPayment;
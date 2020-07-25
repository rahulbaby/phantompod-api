"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseUniqueValidator = _interopRequireDefault(require("mongoose-unique-validator"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _moment = _interopRequireDefault(require("moment"));

var _constants = require("../../base/constants");

var _utils = require("../../utils");

var _user = require("../controllers/user");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SALT_WORK_FACTOR = 10;
const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const billingDetailsSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  streetAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  vatNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(_constants.userRoles),
    required: true,
    default: _constants.userRoles.USER
  }
}, {
  timestamps: true
});
const userSchema = new _mongoose.default.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  image: {
    type: String,
    required: false,
    default: null
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [emailReg, 'is invalid'],
    minlength: 5,
    maxlength: 255
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: [true, 'Password cannot be left blank'],
    minlength: 5,
    maxlength: 1024
  },
  encryptedString: {
    type: String
  },
  status: {
    type: String,
    //enum: Object.values(userAccountStatus),
    //required: true,
    default: null
  },
  linkedinCookiId: {
    type: String,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeProductId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  paymentExpiresAt: {
    type: String,
    default: null
  },
  stripeObj: Object,
  billingDetails: billingDetailsSchema,
  trialDetails: {
    expiresAt: String,
    podCount: Number
  }
}, {
  timestamps: true
});
userSchema.virtual('onTrial').get(function () {
  return (this.status === null || this.status === _constants.userAccountStatus.TRIAL) && _moment.default.unix(this.trialDetails.expiresAt).isAfter((0, _moment.default)());
});
userSchema.virtual('isActive').get(function () {
  return this.status !== _constants.userAccountStatus.TRIAL && this.paymentExpiresAt !== null && _moment.default.unix(this.paymentExpiresAt).isAfter((0, _moment.default)());
});
userSchema.virtual('isBillingAdded').get(function () {
  return this.billingDetails && this.billingDetails.name && this.billingDetails.name !== '';
});
userSchema.set('toObject', {
  virtuals: true
});
userSchema.set('toJSON', {
  virtuals: true
});
userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next();

  _bcrypt.default.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    _bcrypt.default.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
/*
userSchema.pre('findOneAndUpdate', async function (next) {
  const user = this;
  if (user.isModified('password'))
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        return next();
      });
    });
  //if (user.isModified('image')) deleteFile(`${UPLOAD_PATH}/${user.image}`);
  return next();
});
*/

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  _bcrypt.default.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(_mongooseUniqueValidator.default, {
  message: 'is already taken.'
});

var _default = _mongoose.default.model('User', userSchema);

exports.default = _default;
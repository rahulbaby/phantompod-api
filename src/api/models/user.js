import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import moment from 'moment';
import { userAccountStatus, userRoles } from 'base/constants';
import { deleteFile } from 'utils';
import { UPLOAD_PATH } from 'controllers/user';
import { paginatePlugin } from 'db';

const SALT_WORK_FACTOR = 10;
const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const billingDetailsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    vatNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [emailReg, 'is invalid'],
      minlength: 5,
      maxlength: 255,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Password cannot be left blank'],
      minlength: 5,
      maxlength: 1024,
    },
    encryptedString: {
      type: String,
    },
    status: {
      type: String,
      //enum: Object.values(userAccountStatus),
      //required: true,
      default: null,
    },
    role: {
      type: String,
      //enum: Object.values(userRoles),
      required: true,
      default: userRoles.USER,
    },
    linkedinCookiId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeProductId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    paymentExpiresAt: { type: String, default: null },
    stripeObj: Object,
    billingDetails: billingDetailsSchema,
    trialDetails: {
      expiresAt: String,
      podCount: Number,
    },
  },
  { timestamps: true },
);

userSchema.virtual('onTrial').get(function () {
  return (
    (this.status === null || this.status === userAccountStatus.TRIAL) &&
    moment.unix(this.trialDetails.expiresAt).isAfter(moment())
  );
});
userSchema.virtual('isActive').get(function () {
  return (
    this.status !== userAccountStatus.TRIAL &&
    this.paymentExpiresAt !== null &&
    moment.unix(this.paymentExpiresAt).isAfter(moment())
  );
});

userSchema.virtual('isBillingAdded').get(function () {
  return this.billingDetails && this.billingDetails.name && this.billingDetails.name !== '';
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
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
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(paginatePlugin);
userSchema.plugin(uniqueValidator, { message: 'is already taken.' });

export default mongoose.model('User', userSchema);

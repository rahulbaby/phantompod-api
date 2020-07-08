import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import { userAccountStatus } from 'base/constants';

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
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [emailReg, 'is invalid'],
      minlength: 5,
      maxlength: 255,
    },
    password: {
      type: String,
      required: [true, 'Password cannot be left blank'],
      minlength: 5,
      maxlength: 1024,
    },
    status: {
      type: String,
      enum: Object.values(userAccountStatus),
      required: true,
      default: userAccountStatus.TRIAL,
    },
    stripeCustomerId: { type: String, default: null },
    paymentExpiresAt: { type: String, default: null },
    stripeObj: Object,
    billingDetails: billingDetailsSchema,
  },
  { timestamps: true },
);

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

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(uniqueValidator, { message: 'is already taken.' });

export default mongoose.model('User', userSchema);

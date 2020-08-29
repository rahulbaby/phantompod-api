"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _user = _interopRequireDefault(require("../api/models/user"));

var _passport = _interopRequireDefault(require("passport"));

var _nodemailerSesTransport = _interopRequireDefault(require("nodemailer-ses-transport"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _cryptr = _interopRequireDefault(require("cryptr"));

var _auth = _interopRequireDefault(require("../api/routes/auth"));

var _notification = _interopRequireDefault(require("../api/routes/notification"));

var _stripe = _interopRequireDefault(require("../api/routes/stripe"));

var _user2 = _interopRequireDefault(require("../api/routes/user"));

var _pod = _interopRequireDefault(require("../api/routes/pod"));

var _post = _interopRequireDefault(require("../api/routes/post"));

var _admin = _interopRequireDefault(require("../api/routes/admin"));

var _settings = _interopRequireDefault(require("../api/routes/settings"));

var _cron = _interopRequireDefault(require("./cron"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cryptr = new _cryptr.default('pass123');
const router = (0, _express.Router)();
router.use('/auth', _auth.default);
router.use('/user', _user2.default);
router.use('/stripe', _stripe.default);
router.use('/cron', _cron.default);
router.use('/pod', _passport.default.authenticate('jwt', {
  session: false
}), _pod.default);
router.use('/post', _passport.default.authenticate('jwt', {
  session: false
}), _post.default);
router.use('/notification', _passport.default.authenticate('jwt', {
  session: false
}), _notification.default);
router.use('/admin', _passport.default.authenticate('jwt', {
  session: false
}), _admin.default);
router.use('/settings', _passport.default.authenticate('jwt', {
  session: false
}), _settings.default);
router.route('/items').get((req, res, next) => {
  const items = require("../enums/items");

  res.send(items);
});
router.route('/verify-email').post(async (req, res, next) => {
  try {
    const decryptedString = cryptr.decrypt(req.body.hash);
    await _user.default.findOneAndUpdate({
      email: decryptedString
    }, {
      emailVerified: true
    });
    let record = await _user.default.findOne({
      email: decryptedString
    });
    return res.send({
      verified: record.emailVerified
    });
  } catch (error) {
    let message = error.message || `Something went wrong!`;
    return res.status(400).send({
      message,
      error
    });
  }
});
router.route('/create-admin').get(async (req, res, next) => {
  let admin = {
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin',
    role: 'admin'
  };
  let record = new _user.default(admin);
  let ret = await record.save();
  res.send(ret);
});
var _default = router;
exports.default = _default;
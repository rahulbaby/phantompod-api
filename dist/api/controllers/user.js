"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _underscore = _interopRequireDefault(require("underscore"));

var _user = _interopRequireDefault(require("../models/user"));

var _constants = require("../../base/constants");

var _config = _interopRequireDefault(require("config"));

var _nodemailerSesTransport = _interopRequireDefault(require("nodemailer-ses-transport"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _cryptr = _interopRequireDefault(require("cryptr"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const cryptr = new _cryptr.default('pass123');

const sgMail = require('@sendgrid/mail');

const trialSubscriptionDetails = _config.default.get('trialSubscription');

class UserController {
  constructor() {
    _defineProperty(this, "create", async (req, res, next) => {
      let {
        name,
        email,
        password
      } = req.body;
      const encryptedString = cryptr.encrypt(email);
      let record = new _user.default({
        name,
        email,
        password,
        encryptedString
      });

      try {
        let ret = await record.save();
        var newRes = res;
        const APIEMAIL = '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';
        sgMail.setApiKey(APIEMAIL);
        const msg = {
          to: 'tdanoop19@gmail.com',
          from: 'developer@phantompod.co',
          // Use the email address or domain you verified above
          subject: 'Sending with Twilio SendGrid is Fun',
          text: 'and easy to do anywhere, even with Node.js',
          html: '<strong>and easy to do anywhere, even with Node.js</strong>'
        };
        sgMail.send(msg).then(() => {}, error => {
          console.error(error);
          return res.send(ret);

          if (error.response) {
            console.error('check error response : ', error.response.body);
          }
        }); //sgMail.send(msg)
        // var client = nodemailer.createTransport(sgTransport(options));
        //   const mailOptions = {
        //     from: `hello@phantompod.co`,
        //     to: 'developer@phantompod.co',
        //     subject: `${name}`,
        //     text: `http://localhost:3000/verify-email?hash=${encryptedString}`,
        //     replyTo: `hello@phantompod.co`
        //   }
        //   sesTransporter.sendMail(mailOptions, function(err, resp) {
        //     if (err) {
        //       console.error('there was an error: ', err);
        //     } else {
        //       console.log('here is the res: ', resp);
        //       return newRes.send('Saved');
        //     }
        //   })

        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "updateBillingDetails", async (req, res, next) => {
      const userId = req.user._id;

      let billingDetails = _underscore.default.pick(req.body, 'name', 'companyName', 'country', 'state', 'streetAddress', 'city', 'zip', 'vatNumber');

      try {
        const result = await _user.default.findByIdAndUpdate(userId, {
          billingDetails
        });
        return res.send(result);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "updateLinkeinid", async (req, res, next) => {
      const userId = req.user._id;
      let linkedinCookiId = req.body.linkedinCookiId;

      try {
        const result = await _user.default.findByIdAndUpdate(userId, {
          linkedinCookiId
        });
        return res.send(result);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "verifyHash", async (req, res, next) => {
      try {
        const decryptedString = cryptr.decrypt(req.body.hash);
        let record = await _user.default.findOneAndUpdate({
          email: decryptedString
        }, {
          emailVerified: true
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

    _defineProperty(this, "resetPaymentDetails", async (req, res, next) => {
      const userId = req.user._id;
      let userData = {
        billingDetails: {},
        linkedinCookiId: null,
        stripeCustomerId: null,
        paymentExpiresAt: null,
        status: null
      };

      try {
        const result = await _user.default.findByIdAndUpdate(userId, userData);
        return res.send(result);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "createTrialSubscription", async (req, res, next) => {
      if (req.user.status !== null) return res.send(500);
      const userId = req.user._id;
      let userData = {
        status: _constants.userAccountStatus.TRIAL,
        trialDetails: {
          expiresAt: (0, _moment.default)(new Date()).add('days', trialSubscriptionDetails.TRIAL_PERIOD).unix(),
          podCount: trialSubscriptionDetails.TRIAL_PERIOD
        }
      };

      try {
        const result = await _user.default.findByIdAndUpdate(userId, userData);
        return res.send(result);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "resetPassword", async (req, res, next) => {
      const userId = req.user._id;
      const {
        oldPassword,
        newPassword
      } = req.body;
      req.user.comparePassword(oldPassword, async (err, isMatch) => {
        if (!isMatch) return res.status(400).send({
          message: 'Wrong password'
        });

        try {
          const result = await _user.default.findByIdAndUpdate(userId, {
            password: newPassword
          });
          return res.send(result);
        } catch (error) {
          let message = error.message || `Something went wrong!`;
          return res.status(400).send({
            message,
            error
          });
        }
      });
    });
  }

}

var _default = new UserController();

exports.default = _default;
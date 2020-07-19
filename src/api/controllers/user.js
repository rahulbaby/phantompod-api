import moment from 'moment';
import _ from 'underscore';

import User from 'models/user';
import { userAccountStatus } from 'base/constants';
import config from 'config';
import sesTransport from 'nodemailer-ses-transport';
import nodemailer from 'nodemailer';
import Cryptr from 'cryptr';
import multer from 'multer';
import { deleteFile } from 'utils';

export const UPLOAD_PATH = './uploads/user';
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_PATH);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '.png');
  },
});

const upload = multer({ storage }).single('image');

const cryptr = new Cryptr('pass123');
const sgMail = require('@sendgrid/mail');

const trialSubscriptionDetails = config.get('trialSubscription');

class UserController {
  create = async (req, res, next) => {
    let { name, email, password } = req.body;
    const encryptedString = cryptr.encrypt(email);
    let record = new User({ name, email, password, encryptedString });
    try {
      let ret = await record.save();
      var newRes = res;
      const APIEMAIL = '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';
      sgMail.setApiKey(APIEMAIL);
      const msg = {
        to: 'tdanoop19@gmail.com',
        from: 'developer@phantompod.co', // Use the email address or domain you verified above
        subject: 'Sending with Twilio SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };

      sgMail.send(msg).then(
        () => {},
        error => {
          console.error(error);

          return res.send(ret);

          if (error.response) {
            console.error('check error response : ', error.response.body);
          }
        },
      );

      //sgMail.send(msg)

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
      return res.status(400).send({ message, error });
    }
  };

  updateBillingDetails = async (req, res, next) => {
    const userId = req.user._id;
    let billingDetails = _.pick(
      req.body,
      'name',
      'companyName',
      'country',
      'state',
      'streetAddress',
      'city',
      'zip',
      'vatNumber',
    );

    try {
      const result = await User.findByIdAndUpdate(userId, { billingDetails });
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  updateLinkeinid = async (req, res, next) => {
    const userId = req.user._id;
    let linkedinCookiId = req.body.linkedinCookiId;
    try {
      const result = await User.findByIdAndUpdate(userId, { linkedinCookiId });
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  verifyHash = async (req, res, next) => {
    try {
      const decryptedString = cryptr.decrypt(req.body.hash);
      let record = await User.findOneAndUpdate({ email: decryptedString }, { emailVerified: true });
      return res.send({ verified: record.emailVerified });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  resetPaymentDetails = async (req, res, next) => {
    const userId = req.user._id;
    let userData = {
      billingDetails: {},
      linkedinCookiId: null,
      stripeCustomerId: null,
      paymentExpiresAt: null,
      status: null,
    };

    try {
      const result = await User.findByIdAndUpdate(userId, userData);
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  createTrialSubscription = async (req, res, next) => {
    if (req.user.status !== null) return res.send(500);
    const userId = req.user._id;
    let userData = {
      status: userAccountStatus.TRIAL,
      trialDetails: {
        expiresAt: moment(new Date()).add('days', trialSubscriptionDetails.TRIAL_PERIOD).unix(),
        podCount: trialSubscriptionDetails.TRIAL_PERIOD,
      },
    };

    try {
      const result = await User.findByIdAndUpdate(userId, userData);
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  resetPassword = async (req, res, next) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    req.user.comparePassword(oldPassword, async (err, isMatch) => {
      if (!isMatch) return res.status(400).send({ message: 'Wrong password' });
      try {
        const user = await User.findOne({ _id: userId });
        user.password = newPassword;
        let ret = await user.save();
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({ message, error });
      }
    });
  };

  updateProfileImage = async (req, res, next) => {
    const userId = req.user._id;

    upload(req, res, async err => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ msg: 'File upload error', err });
      } else if (err) {
        return res.status(400).send({ msg: 'UNKNOWN File upload error', err });
      }
      let record = await User.findOne({ _id: userId });
      const imagePre = record.image;
      if (req.file) record.image = req.file.filename;

      try {
        let ret = await User.findOneAndUpdate({ _id: userId }, record);
        if (imagePre && req.file.filename) deleteFile(`${UPLOAD_PATH}/${imagePre}`);
        return res.send({ message: 'Profile image updated' });
      } catch (error) {
        if (req.file) deleteFile(`${UPLOAD_PATH}/${req.file.filename}`);
        let message = `Something went wrong!`;
        return res.status(400).send({ message, error });
      }
    });
  };
}

export default new UserController();

import moment from 'moment';
import _ from 'underscore';

import User from 'models/user';
import { userAccountStatus, userRoles } from 'base/constants';
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
const webUrl = config.get('app.webUrl');

class UserController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.role = { $ne: userRoles.ADMIN };
      /* query.$and = [
        { userId: req.user._id },
        { members: { $elemMatch: { userId: req.user._id, status: podMemeberStatus.ACCEPTED } } },
      ];*/
      let ret = await User.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  create = async (req, res, next) => {
    let { name, email, password } = req.body;
    const encryptedString = cryptr.encrypt(email);
    let record = new User({ name, email, password, encryptedString });
    try {
      let emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).send({ message: 'Email address already exists.' });
      let ret = await record.save();
      const APIEMAIL = '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';
      sgMail.setApiKey(APIEMAIL);
      const msg = {
        to: `${email}`,
        from: 'developer@phantompod.co', // Use the email address or domain you verified above
        subject: 'Activate your Phantompod account!',
        text: `Hello ${name}`,
        html: `<strong>Hello ${name},</strong><br/><br/>
        You are one step away from activating your Phantompod account.<br/><br/>
        Follow this link to verify your account.<br/><br/>
        https://app.phantompod.co/verify-email?hash=${encryptedString}<br/><br/>
        If you didn’t create an account on Phantompod, you can ignore this email.<br/><br/>
        Thanks,<br/><br/>
        Team Phantompod!`,
      };

      sgMail.send(msg).then(
        () => {},
        error => {
          console.error(error);

          console.log('error : ', error);

          if (error.response) {
            console.error('check error response : ', error.response.body);
          }

          return res.send(ret);
        },
      );

      //sgMail.send(msg)

      // var client = nodemailer.createTransport(sgTransport(options));
      //   const mailOptions = {
      //     from: `hello@phantompod.co`,
      //     to: 'developer@phantompod.co',
      //     subject: `${name}`,
      //     text: `${webUrl}/verify-email?hash=${encryptedString}`,
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

  updateProfile = async (req, res, next) => {
    const userId = req.user._id;
    let record = _.pick(req.body, 'name', 'email');

    try {
      const result = await User.findByIdAndUpdate(userId, record);
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  updateLinkeinid = async (req, res, next) => {
    const userId = req.user._id;
    let ok = JSON.stringify(req.body);
    let a = ok.replace(/['"]+/g, '');
    let b = a.replace(':', '');
    let c = b.replace('{', '');
    const linkedinCookiId = c.replace('}', '');

    console.log('req.body - rxd', req.body);
    console.log('linkedinCookiId - rxd', linkedinCookiId);
    try {
      const result = await User.findByIdAndUpdate(userId, { linkedinCookiId });
      console.log('result', result);
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
      if (!isMatch) return res.status(400).send({ message: "Password doesn't match" });
      try {
        const user = await User.findOne({ _id: userId });
        user.password = newPassword;
        user.billingDetails = undefined;
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

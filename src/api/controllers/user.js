import moment from 'moment';
import _ from 'underscore';
import User from 'models/user';
import { userAccountStatus } from 'base/constants';
import config from 'config';
import sesTransport from 'nodemailer-ses-transport';
import nodemailer from 'nodemailer';
import Cryptr from 'cryptr';
const cryptr = new Cryptr('pass123');

const trialSubscriptionDetails = config.get('trialSubscription');

class UserController {
  create = async (req, res, next) => {
    let { name, email, password } = req.body;
    const encryptedString = cryptr.encrypt(email);
    let record = new User({ name, email, password ,encryptedString });
    try {
      let ret = await record.save();
      var newRes = res;
      var sesTransporter = nodemailer.createTransport(sesTransport({
        accessKeyId: 'AKIA2XCCQ6NIKLEFZTHJ',
        secretAccessKey: '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',
        region:'us-east-2'
      }));
        const mailOptions = {
          from: `hello@phantompod.co`,
          to: 'developer@phantompod.co',
          subject: `${name}`,
          text: `http://localhost:3000/verify-email?hash=${encryptedString}`,
          replyTo: `hello@phantompod.co`
        }
        
        sesTransporter.sendMail(mailOptions, function(err, resp) {
          if (err) {
            console.error('there was an error: ', err);
          } else {
            console.log('here is the res: ', resp);
            
            return newRes.send('Saved');
          }
        })
      //return res.send(ret);
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
    let record = await User.findOneAndUpdate({ email:decryptedString },{emailVerified:true});
    return res.send({verified:record.emailVerified});
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
        const result = await User.findByIdAndUpdate(userId, { password: newPassword });
        return res.send(result);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({ message, error });
      }
    });
  };
}

export default new UserController();

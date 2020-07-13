import moment from 'moment';
import _ from 'underscore';
import User from 'models/user';
import { userAccountStatus } from 'base/constants';
import config from 'config';

const trialSubscriptionDetails = config.get('trialSubscription');

class UserController {
  create = async (req, res, next) => {
    let { name, email, password } = req.body;
    let record = new User({ name, email, password });
    try {
      let ret = await record.save();
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

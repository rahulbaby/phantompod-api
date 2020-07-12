import _ from 'underscore';
import User from 'models/user';
import { userAccountStatus } from 'base/constants';

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
    };

    try {
      const result = await User.findByIdAndUpdate(userId, userData);
      return res.send(result);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new UserController();

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _config = _interopRequireDefault(require("config"));

var _user = _interopRequireDefault(require("../models/user"));

var _constants = require("../../base/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const STRIPE_SECRET_KEY = _config.default.get('stripe.SECRET_KEY');

const PRODUCT_PRICE_ID = _config.default.get('stripe.PRODUCT_PRICE_ID');

const PRODUCT_PERIOD = _config.default.get('stripe.PRODUCT_PERIOD');

const apiVersion = _config.default.get('stripe.apiVersion');

const stripe = require('stripe')(STRIPE_SECRET_KEY, {
  apiVersion
});

class StripeController {
  constructor() {
    _defineProperty(this, "createCustomer", async (req, res, next) => {
      // Create a new customer object
      const customer = await stripe.customers.create({
        email: req.user.email
      });
      const stripeCustomerId = customer.id;
      const userId = req.user._id;
      await _user.default.findByIdAndUpdate(userId, {
        stripeCustomerId
      });
      res.send({
        customer
      });
    });

    _defineProperty(this, "cancelSubscription", async (req, res, next) => {
      const userId = req.user._id;
      const stripeSubscriptionId = req.user.stripeSubscriptionId;

      try {
        //stripe.subscriptions.del(stripeSubscriptionId);
        await _user.default.findOneAndUpdate({
          _id: userId
        }, {
          status: _constants.userAccountStatus.CANCELLED,
          paymentExpiresAt: null,
          stripeSubscriptionId: null
        });
        return res.status(200);
      } catch (error) {
        return res.status('402').send({
          error: {
            message: error.message
          }
        });
      }
    });

    _defineProperty(this, "createSubscription", async (req, res, next) => {
      const stripeCustomerId = req.user.stripeCustomerId;

      try {
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
          customer: stripeCustomerId
        });
      } catch (error) {
        return res.status('402').send({
          error: {
            message: error.message
          }
        });
      }

      let updateCustomerDefaultPaymentMethod = await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: req.body.paymentMethodId
        }
      }); // Create the subscription

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: PRODUCT_PRICE_ID
        }],
        expand: ['latest_invoice.payment_intent']
      }); //console.log(subscription);

      res.status(401).send(subscription);
    });

    _defineProperty(this, "subscriptionList", async (req, res, next) => {
      try {
        const rows = await stripe.subscriptions.list({
          customer: req.body.customerId,
          plan: PRODUCT_PRICE_ID
        });
        res.send({
          rows
        });
      } catch (error) {
        return res.status('402').send({
          error: {
            message: error.message
          }
        });
      }
    });

    _defineProperty(this, "webhooks", async (req, res, next) => {
      let {
        data,
        type
      } = req.body;
      if (!type) return res.status('400').send({
        message: 'Error in payment_intent'
      });
      data = data.object; //console.log('type', type);

      if (type == 'invoice.paid') console.log('/webhooks POST route hit! ::::::::: ', type, data);
      const stripeCustomerId = data.customer;
      if (!stripeCustomerId) return res.status('400').send({
        message: 'Stripe - customerId not found'
      });
      const eventsArr = type.split('.');

      if (eventsArr[0] === 'invoice' && eventsArr[1] === 'paid') {
        await _user.default.findOneAndUpdate({
          stripeCustomerId
        }, {
          status: data.paid ? _constants.userAccountStatus.ACTIVE : _constants.userAccountStatus.ERROR,
          paymentExpiresAt: data.paid ? (0, _moment.default)(new Date()).add('days', PRODUCT_PERIOD).unix() : null,
          stripeSubscriptionId: data.subscription
        });
        return res.status(200).send({
          type,
          data
        });
      }

      return res.status(200);
      if (eventsArr[0] !== 'payment_intent') return res.status(200).send({
        type,
        data
      });

      try {
        const stripeCustomerId = data.customer;
        const paymentSuccess = eventsArr[1] === 'succeeded';
        const paymentCanceled = eventsArr[1] === 'canceled';
        let userObj = {
          status: paymentCanceled ? _constants.userAccountStatus.CANCELLED : paymentSuccess ? _constants.userAccountStatus.ACTIVE : _constants.userAccountStatus.ERROR
        };
        await _user.default.findOneAndUpdate({
          stripeCustomerId
        }, userObj);
        return res.status(200).send({
          type,
          data
        });
      } catch (err) {
        console.log('webhooks error ', err);
        return res.status(400).send({
          err
        });
      }
    });
  }

}

var _default = new StripeController();

exports.default = _default;
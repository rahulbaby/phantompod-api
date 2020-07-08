import config from 'config';
import User from 'models/user';
import { userAccountStatus } from 'base/constants';
const STRIPE_SECRET_KEY = config.get('stripe.SECRET_KEY');
const PRODUCT_PRICE_ID = config.get('stripe.PRODUCT_PRICE_ID');
const apiVersion = config.get('stripe.apiVersion');

const stripe = require('stripe')(STRIPE_SECRET_KEY, { apiVersion });

class StripeController {
  createCustomer = async (req, res, next) => {
    // Create a new customer object
    const customer = await stripe.customers.create({
      email: req.body.email,
    });
    const stripeCustomerId = customer.id;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId });
    res.send({ customer });
  };

  createSubscription = async (req, res, next) => {
    const stripeCustomerId = req.body.customerId; //req.user.stripeCustomerId;
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: stripeCustomerId,
      });
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }

    let updateCustomerDefaultPaymentMethod = await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: PRODUCT_PRICE_ID }],
      expand: ['latest_invoice.payment_intent'],
    });

    //console.log(subscription);

    res.status(401).send(subscription);
  };

  subscriptionList = async (req, res, next) => {
    try {
      const rows = await stripe.subscriptions.list({
        customer: req.body.customerId,
        plan: PRODUCT_PRICE_ID,
      });
      res.send({ rows });
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }
  };

  webhooks = async (req, res, next) => {
    const { data, type } = req.body;

    if (!type) return res.status('400').send({ message: 'Error in payment_intent' });
    const eventsArr = type.split('.');
    if (eventsArr[0] !== 'payment_intent') return res.status(200).send({ type, data });
    console.log('/webhooks POST route hit! ::::::::: ', type);

    try {
      const customerId = data.customer;
      if (!customerId) return res.status('400').send({ message: 'Stripe - customerId not found' });
      const paymentSuccess = eventsArr[1] === 'succeeded';
      const paymentCanceled = eventsArr[1] === 'canceled';
      let userObj = {
        status: paymentCanceled
          ? userAccountStatus.CANCELLED
          : paymentSuccess
          ? userAccountStatus.ACTIVE
          : userAccountStatus.ERROR,
        paymentExpiresAt: paymentSuccess ? data.period_end : null,
      };
      await User.findOneAndUpdate({ stripeCustomerId }, userObj);
      return res.status(200).send({ type, data });
    } catch (err) {
      return res.status(400).send({ err });
    }
  };
}

export default new StripeController();

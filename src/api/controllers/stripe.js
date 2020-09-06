import moment from 'moment';
import config from 'config';
import User from 'models/user';
import { createPayment } from 'models/payments';
import { userAccountStatus } from 'base/constants';
const STRIPE_SECRET_KEY = config.get('stripe.SECRET_KEY');
const PRODUCT_PRICE_ID = config.get('stripe.PRODUCT_PRICE_ID');
const PRODUCT_PERIOD = config.get('stripe.PRODUCT_PERIOD');

const apiVersion = config.get('stripe.apiVersion');

const stripe = require('stripe')(STRIPE_SECRET_KEY, { apiVersion });
const sgMail = require('@sendgrid/mail');

class StripeController {
  createCustomer = async (req, res, next) => {
    // Create a new customer object
    const customer = await stripe.customers.create({
      email: req.user.email,
    });
    const stripeCustomerId = customer.id;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId });
    res.send({ customer });
  };

  cancelSubscription = async (req, res, next) => {
    const userId = req.user._id;
    const stripeSubscriptionId = req.user.stripeSubscriptionId;

    try {
      await stripe.subscriptions.del(stripeSubscriptionId);
      await User.findOneAndUpdate(
        { _id: userId },
        { status: userAccountStatus.CANCELLED, paymentExpiresAt: null, stripeSubscriptionId: null },
      );
      // send mail
      let cancellationDate = new Date(Date.now()).toLocaleString();
      const APIEMAIL = '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';
      sgMail.setApiKey(APIEMAIL);
      const msg = {
        to: `${req.user.email}`,
        from: 'developer@phantompod.co', // Use the email address or domain you verified above
        subject: 'Your Subscription has been cancelled!',
        text: `Hello ${req.user.name}`,
        html: `Hello ${req.user.name}<br/><br/>We are sorry to see you go!<br/><br/>
        Per your request your subscription to Phantompod premium has been canceled on ${cancellationDate}.<br/><br/>
        If you did not request cancellation and this email is being received in error, please contact us to reactivate. <br/><br/>
        You can also login to phantompod your account at anytime and reactivate the subscription.<br/>
        <br/><br/>
        Thanks,<br/><br/>
        Team Phantompod!`,
      };

      sgMail.send(msg);
      //send mail end

      return res.status(200);
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }
  };

  createSubscription = async (req, res, next) => {
    const stripeCustomerId = req.user.stripeCustomerId;
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
    let { data, type } = req.body;
    if (!type) return res.status('400').send({ message: 'Error in payment_intent' });
    data = data.object;
    console.log('type', type);
    if (type == 'invoice.paid') console.log('/webhooks POST route hit! ::::::::: ', type, data);
    const stripeCustomerId = data.customer;
    if (!stripeCustomerId)
      return res.status('400').send({ message: 'Stripe - customerId not found' });

    const eventsArr = type.split('.');
    if (eventsArr[0] === 'invoice' && eventsArr[1] === 'paid') {
      const user = await User.findOne({ stripeCustomerId });
      await createPayment(user.id, data.amount_paid / 100, data.currency, data);
      // invoice start
      const APIEMAIL = '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';
      sgMail.setApiKey(APIEMAIL);
      const msg = {
        to: `${user.email}`,
        from: 'developer@phantompod.co', // Use the email address or domain you verified above
        subject: 'Payment Successful!',
        text: `Hello ${user.name}`,
        html: `<strong>Hello ${user.name},</strong><br/><br/>
        Thank you for subscribing to Phantompod.
        Your payment method has been charged ${data.amount_paid / 100} ${data.currency}
        and your subscription has been activated. <br/>
        You\'ll be charged ${data.amount_paid / 100} ${data.currency} of every month.
        To update your payment method, please login to your Phantompod account.
        <br/><br/>
        Thanks,<br/><br/>
        Team Phantompod!`,
      };

      sgMail.send(msg);
      //invoice end
      await User.findOneAndUpdate(
        { stripeCustomerId },
        {
          status: data.paid ? userAccountStatus.ACTIVE : userAccountStatus.ERROR,
          paymentExpiresAt: data.paid
            ? moment(new Date()).add('days', PRODUCT_PERIOD).unix()
            : null,
          stripeSubscriptionId: data.subscription,
        },
      );
      return res.status(200).send({ type, data });
    }
    return res.status(200);

    if (eventsArr[0] !== 'payment_intent') return res.status(200).send({ type, data });

    try {
      const stripeCustomerId = data.customer;

      const paymentSuccess = eventsArr[1] === 'succeeded';
      const paymentCanceled = eventsArr[1] === 'canceled';
      let userObj = {
        status: paymentCanceled
          ? userAccountStatus.CANCELLED
          : paymentSuccess
          ? userAccountStatus.ACTIVE
          : userAccountStatus.ERROR,
      };
      await User.findOneAndUpdate({ stripeCustomerId }, userObj);
      return res.status(200).send({ type, data });
    } catch (err) {
      console.log('webhooks error ', err);
      return res.status(400).send({ err });
    }
  };
}

export default new StripeController();

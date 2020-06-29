import config from 'config';
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

    // Recommendation: save the customer.id in your database.
    res.send({ customer });
  };

  createSubscription = async (req, res, next) => {
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
      });
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }

    let updateCustomerDefaultPaymentMethod = await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: PRODUCT_PRICE_ID }],
      expand: ['latest_invoice.payment_intent'],
    });

    console.log(subscription);

    res.send(subscription);
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
    try {
      console.log('/webhooks POST route hit! req.body: ', req.body);
      res.send(200);
    } catch (err) {
      console.log('/webhooks route error: ', err);
      res.send(200);
    }
  };
}

export default new StripeController();

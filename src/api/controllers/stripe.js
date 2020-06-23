import config from 'config';
const STRIPE_SECRET_KEY = config.get('stripe.SECRET_KEY');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

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

      let updateCustomerDefaultPaymentMethod = await stripe.customers.update(req.body.customerId, {
        invoice_settings: {
          default_payment_method: req.body.paymentMethodId,
        },
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: req.body.customerId,
        items: [{ price: 'price_1GwA8xBrW3Gw5uscGm2NEJlE' }],
        expand: ['latest_invoice.payment_intent'],
      });

      res.send(subscription);
    } catch (error) {
      return res.status('402').send(error);
    }
  };
}

export default new StripeController();

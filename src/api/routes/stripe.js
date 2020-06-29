import { Router } from 'express';
import Stripe from 'controllers/stripe';
const router = Router();

router.route('/create-customer').post(Stripe.createCustomer);
router.route('/create-subscription').post(Stripe.createSubscription);
router.route('/subscription-list').post(Stripe.subscriptionList);
router.route('/webhooks').post(Stripe.webhooks);

export default router;

import { Router } from 'express';
import Stripe from 'controllers/stripe';
const router = Router();

router.route('/create-customer').post(Stripe.createCustomer);
router.route('/create-subscription').post(Stripe.createSubscription);

export default router;

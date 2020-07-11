import { Router } from 'express';
import passport from 'passport';

import Stripe from 'controllers/stripe';
const router = Router();

router
	.route('/create-customer')
	.get(passport.authenticate('jwt', { session: false }), Stripe.createCustomer);
router
	.route('/create-subscription')
	.post(passport.authenticate('jwt', { session: false }), Stripe.createSubscription);
router.route('/create-subscription--bkup').post(Stripe.createSubscription);
router.route('/subscription-list').post(Stripe.subscriptionList);
router.route('/webhooks').post(Stripe.webhooks);

export default router;

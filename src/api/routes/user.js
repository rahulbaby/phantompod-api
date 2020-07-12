import { Router } from 'express';
import passport from 'passport';

import User from 'controllers/user';
const router = Router();

router.route('/').post(User.create);

router
	.route('/update-billing-details')
	.post(passport.authenticate('jwt', { session: false }), User.updateBillingDetails);
router
	.route('/update-linkedinid')
	.post(passport.authenticate('jwt', { session: false }), User.updateLinkeinid);
router
	.route('/reset-user')
	.get(passport.authenticate('jwt', { session: false }), User.resetPaymentDetails);

router
	.route('/create-trial-subscription')
	.post(passport.authenticate('jwt', { session: false }), User.createTrialSubscription);

export default router;

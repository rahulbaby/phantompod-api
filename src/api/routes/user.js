import { Router } from 'express';
import passport from 'passport';

import User from 'controllers/user';
import Dashboard from 'controllers/dashboard';
const router = Router();

router.route('/').post(User.create);

router.route('/verifyUser').post(User.verifyHash);

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

router
	.route('/reset-password')
	.post(passport.authenticate('jwt', { session: false }), User.resetPassword);

router
	.route('/update-profile-image')
	.post(passport.authenticate('jwt', { session: false }), User.updateProfileImage);

router
	.route('/update-profile')
	.put(passport.authenticate('jwt', { session: false }), User.updateProfile);

router.route('/dashboard').get(passport.authenticate('jwt', { session: false }), Dashboard.index);
router
	.route('/dashboard-posts')
	.get(passport.authenticate('jwt', { session: false }), Dashboard.postsByLike);

export default router;

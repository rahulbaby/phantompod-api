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

export default router;

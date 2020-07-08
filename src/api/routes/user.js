import { Router } from 'express';
import passport from 'passport';

import User from 'controllers/user';
const router = Router();

router.route('/').post(User.create);

router
	.route('/update-billing-details')
	.post(passport.authenticate('jwt', { session: false }), User.updateBillingDetails);

export default router;

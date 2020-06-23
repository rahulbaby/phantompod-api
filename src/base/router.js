import { Router } from 'express';
import passport from 'passport';

import auth from 'routes/auth';
import notification from 'routes/notification';
import stripe from 'routes/stripe';
import user from 'routes/user';
import pod from 'routes/pod';
import post from 'routes/post';

const router = Router();

router.use('/auth', auth);
router.use('/user', user);
router.use('/stripe', stripe);
router.use('/pod', passport.authenticate('jwt', { session: false }), pod);
router.use('/post', passport.authenticate('jwt', { session: false }), post);
router.use('/notification', passport.authenticate('jwt', { session: false }), notification);

router.route('/items').get((req, res, next) => {
	const items = require('../enums/items');
	res.send(items);
});

export default router;

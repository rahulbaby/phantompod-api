import { Router } from 'express';
import passport from 'passport';

import auth from 'routes/auth';
import user from 'routes/user';
import pod from 'routes/pod';

const router = Router();

router.use('/auth', auth);
router.use('/user', passport.authenticate('jwt', { session: false }), user);
router.use('/pod', passport.authenticate('jwt', { session: false }), pod);

router.route('/items').get((req, res, next) => {
	const items = require('../enums/items');
	res.send(items);
});

export default router;

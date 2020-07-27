import { Router } from 'express';
import passport from 'passport';

import User from 'controllers/user';
import Payments from 'controllers/payments';
const router = Router();

router.route('/user').get(User.index);
router.route('/payments').get(Payments.index);

export default router;

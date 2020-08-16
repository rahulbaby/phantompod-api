import { Router } from 'express';
import passport from 'passport';

import Settings from 'controllers/settings';
const router = Router();

router.route('/').get(Settings.index);
router.route('/update').put(Settings.update);

export default router;

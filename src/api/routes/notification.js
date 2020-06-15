import { Router } from 'express';
import Notification from 'controllers/notification';
const router = Router();

router.route('/').get(Notification.index);
router.route('/read/:_id').get(Notification.read);

export default router;

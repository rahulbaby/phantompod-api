import { Router } from 'express';
import Notification from 'controllers/notification';
const router = Router();

router.route('/').get(Notification.index);
router.route('/read/:_id').get(Notification.read);
router.route('/read-all').get(Notification.readAll);

export default router;

import { Router } from 'express';
import Pod from 'controllers/pod';
const router = Router();

router.route('/').get(Pod.index);
router.route('/').post(Pod.create);
router.route('/alter-members').get(Pod.allterMembers);

export default router;

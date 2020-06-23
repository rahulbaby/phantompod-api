import { Router } from 'express';
import Pod from 'controllers/pod';
const router = Router();

router.route('/').get(Pod.index);
router.route('/').post(Pod.create);
router.route('/').delete(Pod.destroy);
router.route('/marketplace').get(Pod.marketplace);
router.route('/alter-members').put(Pod.allterMembers);
router.route('/alter-member-access').put(Pod.allterMemberAcccess);

export default router;

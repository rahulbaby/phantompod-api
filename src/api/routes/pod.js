import { Router } from 'express';
import Pod from 'controllers/pod';
import { requiresSubscription, requiresPodCountCheck } from 'middlewares';
const router = Router();

router.route('/').get(Pod.index);
router.route('/').post(Pod.create);
router.route('/').put(Pod.update);
router.route('/').delete(Pod.destroy);
router.route('/marketplace').get(Pod.marketplace);
router.route('/alter-members').put(Pod.allterMembers);
router.route('/request-member-access').put(Pod.allterMembers);
router.route('/alter-member-access').put(Pod.allterMemberAcccess);
router.route('/remove-member').put(Pod.removeMemberAcccess);
router.route('/active-members').get(Pod.getActiveMembers);

export default router;

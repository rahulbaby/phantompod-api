import { Router } from 'express';
import Post from 'controllers/post';
const router = Router();

router.route('/').get(Post.index);
router.route('/').post(Post.create);
router.route('/approve').put(Post.approve);
router.route('/').delete(Post.destroy);
router.route('/trigger-bot').get(Post.triggerBot);

export default router;

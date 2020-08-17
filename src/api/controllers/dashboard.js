import Pod from 'models/pod';
import Post from 'models/post';
import User from 'models/user';
import { podMemeberStatus } from 'base/constants';

class BlockController {
	index = async (req, res, next) => {
		try {
			const userId = req.user.id;
			const profileViews = req.user.profileViews;
			const podsOwn = await Pod.where({ userId }).countDocuments();
			const podsImIn = await Pod.where({
				members: { $elemMatch: { userId: userId, status: podMemeberStatus.ACCEPTED } },
			}).countDocuments();
			const postLikes = await Post.aggregate([
				{
					$group: {
						_id: null,
						count: { $sum: 'postLikes' },
					},
				},
			]);

			return res.send({ podsOwn, podsImIn, profileViews, postLikes: postLikes.count });
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};

	postsByLike = async (req, res, next) => {
		try {
			const userId = req.user.id;
			const posts = await Post.where({ userId });

			return res.send({ posts });
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};
}
export default new BlockController();

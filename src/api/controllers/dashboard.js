import Pod from 'models/pod';
import User from 'models/user';
class BlockController {
	index = async (req, res, next) => {
		try {
			const userId = req.user.id;
			const profileViews = req.user.profileViews;
			const podsOwn = await Pod.where({ userId }).countDocuments();
			const podsImIn = await Pod.where({
				members: { $elemMatch: { userId: userId, status: podMemeberStatus.ACCEPTED } },
			}).countDocuments();

			return res.send({ podsOwn });
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};
}
export default new BlockController();

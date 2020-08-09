import Pod from 'models/pod';
class BlockController {
	index = async (req, res, next) => {
		try {
			const userId = req.user.id;
			const podsOwn = await Pod.where({ userId }).countDocuments();
			return res.send({ podsOwn });
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};
}
export default new BlockController();

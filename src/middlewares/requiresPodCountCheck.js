import config from 'config';
import Pod from 'models/pod';

const POD_COUNT = config.get('trialSubscription.POD_COUNT');

const middleWareFun = () => {
	return async (req, res, next) => {
		if (req.user.isActive) {
			next();
		} else {
			let query = [{ 'members.userId': req.user._id }, { userId: req.user._id }];
			let podCount = await Pod.count(query);
			if (podCount >= POD_COUNT)
				return res
					.status(400)
					.send({ message: `No more than ${POD_COUNT} pods allowded for trial account` });
			else next();
		}
	};
};

export default middleWareFun;

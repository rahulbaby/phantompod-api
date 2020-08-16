import config from 'config';
import Pod from 'models/pod';
import { getRow } from 'models/settings';

const middleWareFun = () => {
	return async (req, res, next) => {
		if (req.user.isActive) {
			next();
		} else {
			const POD_COUNT = await getRow('trialPodCount');
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

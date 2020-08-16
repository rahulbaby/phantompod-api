import Settings from 'models/settings';
import _ from 'underscore';

class BlockController {
	index = async (req, res, next) => {
		try {
			const row = await Settings.findOne({});

			return res.send(row || {});
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};
	update = async (req, res, next) => {
		try {
			let data = _.pick(req.body, 'trialPodCount', 'trialDayCount');

			const record = await Settings.findOne({});
			if (record) {
				['trialPodCount', 'trialDayCount', 'productPriceId', 'productName', 'productPeriod'].map(
					x => {
						if (req.body[x]) record[x] = req.body[x];
					},
				);
				console.log(record);
				await Settings.findByIdAndUpdate(record._id, record);
			} else {
				let newSettings = new Settings(data);
				await newSettings.save();
			}
			return res.status(200).send({ message: 'Success' });
		} catch (error) {
			let message = error.message || `Something went wrong!`;
			return res.status(400).send({ message, error });
		}
	};
}
export default new BlockController();

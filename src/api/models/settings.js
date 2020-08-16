import mongoose, { Schema } from 'mongoose';

const settingsSchema = new Schema(
	{
		trialDayCount: Number,
		trialPodCount: Number,
		productPriceId: String,
		productName: String,
		productPeriod: Number,
	},
	{ timestamps: true },
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;

export const getRow = async (key = null) => {
	let ret = await Settings.findOne();
	return key ? ret[key] : ret;
};

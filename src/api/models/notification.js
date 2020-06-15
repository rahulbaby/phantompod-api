import mongoose, { Schema } from 'mongoose';
import { paginatePlugin } from 'db';

const notificationSchema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: 'User' },
		receiver: { type: Schema.Types.ObjectId, ref: 'User' },
		label: String,
		seen: {
			type: Boolean,
			default: false,
		},
		meta: {
			id: Schema.Types.ObjectId,
			url: String,
		},
	},
	{ timestamps: true },
);
notificationSchema.plugin(paginatePlugin);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

export const createNotification = async (sender, receiver, label, meta = {}) => {
	let record = new Notification({ sender, receiver, label, meta });
	let ret = await record.save();
	return ret;
};

import mongoose, { Schema } from 'mongoose';
import { paginatePlugin } from 'db';

const paymentsSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		amount_paid: String,
		currency: String,
		meta: Schema.Types.Mixed,
	},
	{ timestamps: true },
);
paymentsSchema.plugin(paginatePlugin);

const Payments = mongoose.model('Payments', paymentsSchema);
export default Payments;

export const createPayment = async (user, amount_paid, currency, meta = {}) => {
	console.log({ user, amount_paid, currency });
	let record = new Payments({ user, amount_paid, currency, meta });
	let ret = await record.save();
	return ret;
};

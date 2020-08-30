import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { paginatePlugin } from 'db';
import { podMemeberStatus } from 'base/constants';

const memberSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		name: String,
		image: String,
		status: {
			type: String,
			enum: Object.values(podMemeberStatus),
			required: true,
			default: podMemeberStatus.REQUESTED,
		},
	},
	{ timestamps: true },
);

const podSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 500,
			unique: [true, 'already exists'],
		},
		podKey: {
			type: String,
			unique: true,
			required: [true, "can't be blank"],
		},
		description: {
			type: String,
			required: [true, "can't be blank"],
		},
		comments: [String],
		isPrivate: Boolean,
		autoShare: Boolean,
		autoLike: Boolean,
		autoComment: Boolean,
		autoValidate: Boolean,
		members: [memberSchema],
	},
	{ timestamps: true },
);

podSchema.plugin(uniqueValidator, { message: 'This podname already registered!' });
podSchema.plugin(paginatePlugin);

podSchema.statics.getPodRow = function (query) {
	if (typeof query === 'string') query = { _id: query };
	return this.findOne(query);
};

podSchema.statics.getActivePods = async userId => {
	let query = {};
	query.$or = [
		{ userId },
		{ members: { $elemMatch: { userId, status: podMemeberStatus.ACCEPTED } } },
	];
	let ret = await this.paginate(query);
	return ret;
};

export default mongoose.model('Pod', podSchema);

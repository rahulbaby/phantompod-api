import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { paginatePlugin } from 'db';
import { podMemeberStatus } from 'base/constants';

const memberSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		name: String,
		status: {
			type: String,
			enum: Object.values(podMemeberStatus),
			required: podMemeberStatus.REQUESTED,
			default: 2,
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

podSchema.plugin(uniqueValidator, { message: 'is already taken.' });
podSchema.plugin(paginatePlugin);

export default mongoose.model('Pod', podSchema);

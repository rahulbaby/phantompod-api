import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { paginatePlugin } from 'db';

const postSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		podId: {
			type: Schema.Types.ObjectId,
			//ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 500,
		},
		url: {
			type: String,
			required: [true, "can't be blank"],
			//unique: [true, 'already exists'],
		},
		comments: [String],
		autoShare: Boolean,
		autoLike: Boolean,
		autoComment: Boolean,
		approved: Boolean,
		postLikes: Number,
	},
	{ timestamps: true },
);

postSchema.plugin(uniqueValidator, { message: 'is already taken.' });
postSchema.plugin(paginatePlugin);

export default mongoose.model('Post', postSchema);

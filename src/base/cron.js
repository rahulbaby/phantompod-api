import { Router } from 'express';
import Pod from 'models/pod';
import Post from 'models/post';
import User from 'models/user';
const router = Router();

const updateAnalytics = async (req, res, next) => {
	const id = req.query.id;
	let obj = {
		domain: '.www.linkedin.com',
		expirationDate: 1619110812.023159,
		hostOnly: false,
		httpOnly: true,
		name: 'li_at',
		path: '/',
		sameSite: 'no_restriction',
		secure: true,
		session: false,
		storeId: '1',
		id: 16,
	};
	try {
		let usersArr = await User.find({}); // last 30 days filtering nt done for now
		let users = {};
		usersArr.map(user => {
			if (user.linkedinCookiId) users[user._id] = user.linkedinCookiId;
		});
		let ret = [];
		Object.keys(users).map(async userId => {
			let posts = await Post.find({ userId });
			// loops through each post of the user selected
			posts.map(async post => {
				const linkedInPostUrl = post.url; // current post
				let pod = await Pod.findOne({ _id: post.podId });
				let comments = post.comments;
				let commentsLength = comments.length;
				let commentRef = 0;
				let postLikes = 0;
				let profileViews = 0;
				// loops through each member of the pod against the post
				pod.members.map(async memberUserId => {
					commentRef = commentRef > comments.length ? (commentRef = 0) : commentRef + 1;
					let commentSelected = comments[commentRef]; // comment be done for this round.
					const linkedinCookiId = users[memberUserId]; //linkedinCookiId for the user from post members
					/*
						at this state we have linkedinCookiId ,comment ,  linkedInPostUrl
						everything needed to trigger bot is available here
						now run the bot here to feed the values to postLikes and profileViews
					*/
					obj['value'] = linkedinCookiId;
					//============= bot runs here for each user agains a partical post ============//
				});
				await Post.findOneAndUpdate({ _id: post._id }, { postLikes });
				await User.findOneAndUpdate({ _id: userId }, { profileViews });
			});
		});
		return res.send({ message: 'done' });
	} catch (error) {
		let message = error.message || `Something went wrong!`;
		return res.status(400).send({ message, error });
	}
};

router.route('/bot-update-analytics').get(updateAnalytics);

export default router;

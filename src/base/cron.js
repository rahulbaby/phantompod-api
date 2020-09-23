import { Router } from 'express';
import Pod from 'models/pod';
import Post from 'models/post';
import User from 'models/user';
import puppeteer from 'puppeteer';
const router = Router();

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
let prof = 'https://www.linkedin.com/me/profile-views/urn:li:wvmp:summary/';
const updateAnalytics = async (req, res, next) => {
	try {
		let users = await User.find({}); // last 30 days filtering nt done for now
		let cookies = [];
		let postUrls = [];
		let postIds = [];
		let userIds = [];

		for (const user of users) {
			const userId = user._id;
			const linkedinCookiId = user.linkedinCookiId;
			if (!linkedinCookiId) continue;
			let posts = await Post.find({ userId });
			if (!posts.length) continue;
			for (const post of posts) {
				const linkedInPostUrl = post.url;
				let postLikes = 0;
				let profileViews = 0;

				cookies.push(linkedinCookiId);
				postUrls.push(linkedInPostUrl);
				postIds.push(post._id);
				userIds.push(userId);
				//await Post.findOneAndUpdate({ _id: post._id }, { postLikes });
				//await User.findOneAndUpdate({ _id: userId }, { profileViews });
			}
		}
		triggerBotPromise(cookies, postUrls, postIds, userIds);
		return res.send({ message: 'done' });
	} catch (error) {
		let message = error.message || `Something went wrong!`;
		return res.status(400).send({ message, error });
	}
};

router.route('/bot-update-analytics').get(updateAnalytics);

export default router;


function triggerBotPromise(cookies, postUrls, postIds, userIds) {
	console.log(cookies, postUrls);

	//==============================Bot starts here======================================================
	if(cookies!=null)
	{
		console.log("Crone bot is running");
		console.log(cookies);
	//bote code here------------------------------------------------------------
	(async () => {
		const browser = await puppeteer.launch({
			headless: true,
		});
		const page = await browser.newPage();
		function delay(time) {
			return new Promise(function (resolve) {
				setTimeout(resolve, time);
			});
		}
		for (var i = 0; i < cookies.length; i++) {
			let postLikes = 0;
			let profileViews = 0;
			obj['value'] = cookies[i]; // sarath here we add index of i cookies to obj array
			await page.setCookie(obj);

			try {
				await page.goto(prof, { waitUntil: 'load', timeout: 0 });
			} catch (e) {
				if (e instanceof puppeteer.errors.TimeoutError) {
					await page.setDefaultNavigationTimeout(0);
				}
			}

			try {
				await page.waitForSelector('[class="me-wvmp-views__90-days-views t-20 t-black t-bold"]');
			} catch (e) {
				if (e instanceof puppeteer.errors.TimeoutError) {
					await page.setDefaultNavigationTimeout(0);
				}
			}
			const view = await page.evaluate(
				() =>
					document.querySelector('[class="me-wvmp-views__90-days-views t-20 t-black t-bold"]')
						.textContent,
			);
			profileViews = profileViews + view;
			console.log('Profile views = ' + view);

			try {
				await page.goto(postUrls[i], { waitUntil: 'load', timeout: 0 }); // sarath here  we pass i index post url
			} catch (e) {
				if (e instanceof puppeteer.errors.TimeoutError) {
					await page.setDefaultNavigationTimeout(0);
				}
			}
			// here we read post likes
			if(postUrls!=null)
			{
			try {
				await page.waitForSelector(
					'[class="v-align-middle social-details-social-counts__reactions-count"]',
				);
			} catch (e) {
				if (e instanceof puppeteer.errors.TimeoutError) {
					await page.setDefaultNavigationTimeout(0);
				}
			}
			try{
			const textContent = await page.evaluate(
				() =>
					document.querySelector(
						'[class="v-align-middle social-details-social-counts__reactions-count"]',
					).textContent,
			);
			postLikes = postLikes + textContent;
			console.log('Post likes = ' + textContent);
					}catch{
						postLikes = postLikes + 0;
					}
				}
			/----------------------DB UPDATION-----------------------/;
			try {                                                  
				await Post.findOneAndUpdate({ _id: postIds[i] }, { postLikes : parseInt( postLikes.split(',').join('') )});
				await User.findOneAndUpdate({ _id: userIds[i] }, { profileViews });
			} catch (e) {
				console.log('BOT BD ERRO ', e);
			}
			/----------------------DB UPDATION END-------------------/;
			await delay(4000);
		}
		await browser.close();
	})();
}
else{
	console.log("No cookies found in data base");
}

	//bote code here-----------------------------end----------------------------
}

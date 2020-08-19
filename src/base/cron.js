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

const updateAnalytics = async (req, res, next) => {
	try {
		let users = await User.find({}); // last 30 days filtering nt done for now
		let ret = [];

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
				/*
					at this state we have userId ,linkedInPostUrl ,  linkedInPostUrl
					everything needed to trigger bot is available here
					now run the bot here to feed the values to postLikes and profileViews
				*/
				//==============================Bot starts here======================================================
				const browser = await puppeteer.launch({ headless: false });
				const page = await browser.newPage();
				function delay(time) {
					return new Promise(function (resolve) {
						setTimeout(resolve, time);
					});
				}
				obj['value'] = linkedinCookiId;
				await page.setCookie(obj);

				try {
					await page.goto(linkedInPostUrl, { waitUntil: 'load', timeout: 0 });
				} catch (e) {
					if (e instanceof puppeteer.errors.TimeoutError) {
						await page.setDefaultNavigationTimeout(0);
					}
				}

				try {
					await page.waitForSelector(
						'[class="v-align-middle social-details-social-counts__reactions-count"]',
					);
				} catch (e) {
					if (e instanceof puppeteer.errors.TimeoutError) {
						await page.setDefaultNavigationTimeout(0);
					}
				}
				const textContent = await page.evaluate(
					() =>
						document.querySelector(
							'[class="v-align-middle social-details-social-counts__reactions-count"]',
						).textContent,
				);
				postLikes = postLikes + textContent;
				console.log('Post likes = ' + textContent);

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

				await delay(4000);
				await browser.close();

				//==============================Bot ends here========================================================

				ret.push({
					userId,
					linkedinCookiId,
					linkedInPostUrl,
				});
				await Post.findOneAndUpdate({ _id: post._id }, { postLikes });
				await User.findOneAndUpdate({ _id: userId }, { profileViews });
			}
		}

		return res.send(ret);
	} catch (error) {
		let message = error.message || `Something went wrong!`;
		return res.status(400).send({ message, error });
	}
};

router.route('/bot-update-analytics').get(updateAnalytics);

export default router;

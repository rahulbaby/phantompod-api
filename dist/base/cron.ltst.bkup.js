"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _pod = _interopRequireDefault(require("../api/models/pod"));

var _post = _interopRequireDefault(require("../api/models/post"));

var _user = _interopRequireDefault(require("../api/models/user"));

var _puppeteer = _interopRequireDefault(require("puppeteer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
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
  id: 16
};

const updateAnalytics = async (req, res, next) => {
  try {
    let users = await _user.default.find({}); // last 30 days filtering nt done for now

    let ret = [];

    for (const user of users) {
      const userId = user._id;
      const linkedinCookiId = user.linkedinCookiId;
      let posts = await _post.default.find({
        userId
      });
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

        if (linkedinCookiId !== null) {
          (async () => {
            const browser = await _puppeteer.default.launch({
              headless: false
            });
            const page = await browser.newPage();

            function delay(time) {
              return new Promise(function (resolve) {
                setTimeout(resolve, time);
              });
            }

            obj['value'] = linkedinCookiId;
            await page.setCookie(obj);

            try {
              await page.goto(linkedInPostUrl, {
                waitUntil: 'load',
                timeout: 0
              });
            } catch (e) {
              if (e instanceof _puppeteer.default.errors.TimeoutError) {
                await page.setDefaultNavigationTimeout(0);
              }
            }

            try {
              await page.waitForSelector('[class="v-align-middle social-details-social-counts__reactions-count"]');
            } catch (e) {
              if (e instanceof _puppeteer.default.errors.TimeoutError) {
                await page.setDefaultNavigationTimeout(0);
              }
            }

            const textContent = await page.evaluate(() => document.querySelector('[class="v-align-middle social-details-social-counts__reactions-count"]').textContent);
            postLikes = postLikes + textContent;
            console.log('Post likes = ' + textContent);

            try {
              await page.goto(prof, {
                waitUntil: 'load',
                timeout: 0
              });
            } catch (e) {
              if (e instanceof _puppeteer.default.errors.TimeoutError) {
                await page.setDefaultNavigationTimeout(0);
              }
            }

            try {
              await page.waitForSelector('[class="me-wvmp-views__90-days-views t-20 t-black t-bold"]');
            } catch (e) {
              if (e instanceof _puppeteer.default.errors.TimeoutError) {
                await page.setDefaultNavigationTimeout(0);
              }
            }

            const view = await page.evaluate(() => document.querySelector('[class="me-wvmp-views__90-days-views t-20 t-black t-bold"]').textContent);
            profileViews = profileViews + view;
            console.log('Profile views = ' + view);
            await delay(4000);
            await browser.close();
          })();
        } //==============================Bot ends here========================================================


        ret.push({
          userId,
          linkedinCookiId,
          linkedInPostUrl
        });
        await _post.default.findOneAndUpdate({
          _id: post._id
        }, {
          postLikes
        });
        await _user.default.findOneAndUpdate({
          _id: userId
        }, {
          profileViews
        });
      }
    }

    return res.send(ret);
  } catch (error) {
    let message = error.message || `Something went wrong!`;
    return res.status(400).send({
      message,
      error
    });
  }
};

router.route('/bot-update-analytics').get(updateAnalytics);
var _default = router;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _pod = _interopRequireDefault(require("../api/models/pod"));

var _post = _interopRequireDefault(require("../api/models/post"));

var _user = _interopRequireDefault(require("../api/models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();

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
    id: 16
  };

  try {
    let usersArr = await _user.default.find({}); // last 30 days filtering nt done for now

    let users = {};
    usersArr.map(user => {
      users[user._id] = user.linkedinCookiId;
    });
    let ret = [];
    Object.keys(users).map(async userId => {
      let posts = await _post.default.find({
        userId
      });
      if (!posts.length) return false;
      const linkedinCookiId = users[userId]; //linkedinCookiId for the user selected
      // loops through each post of the user selected

      console.log(`<========USER-START -${userId}==========>`);
      posts.map(async post => {
        const linkedInPostUrl = post.url; // current post

        let postLikes = 0;
        let profileViews = 0; // loops through each member of the pod against the post

        /*
        		at this state we have linkedinCookiId ,comment ,  linkedInPostUrl
        		everything needed to trigger bot is available here
        		now run the bot here to feed the values to postLikes and profileViews
        	*/

        if (!linkedinCookiId) return false;
        obj['value'] = linkedinCookiId; //============= bot runs here for each user agains a partical post ============//

        console.log(linkedInPostUrl);
        console.log(userId);
        console.log(`<-------------->`);
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
      });
      console.log(`<========USER-END -${userId}==========>`);
    });
    return res.send({
      message: 'done'
    });
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
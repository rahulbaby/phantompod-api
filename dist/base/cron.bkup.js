"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pod = _interopRequireDefault(require("../api/models/pod"));

var _post = _interopRequireDefault(require("../api/models/post"));

var _notification = require("../api/models/notification");

var _underscore = require("underscore");

var _db = require("../db");

var _constants = require("./constants");

var _puppeteer = _interopRequireDefault(require("puppeteer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PostController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        const userId = req.user._id;
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
        paginateOptions.populate = {
          path: 'userId',
          select: ['_id', 'name']
        };
        let query = req.query.query ? JSON.parse(req.query.query) : {};
        /*query.$or = [
             { userId: req.user._id },
             { members: { $elemMatch: { userId: req.user._id, status: podMemeberStatus.ACCEPTED } } },
           ];*/

        let ret = await _post.default.paginate(query, paginateOptions);
        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "create", async (req, res, next) => {
      let _id = req.body._id;
      let podId = req.body.podId;

      let data = _underscore._.pick(req.body, 'podId', 'url', 'name', 'comments', 'autoShare', 'autoLike', 'autoComment', 'autoValidate');

      try {
        //if (!req.user.isActive && !req.user.onTrial)
        //return res.status(400).send({ message: `You don't have any active plans!` });
        const pod = await _pod.default.getPodRow(podId);
        if (!pod) return res.status(500).send({
          message: "Pod doesn't exists!"
        });
        const ownPod = req.user._id.toString() == pod.userId.toString();
        data.approved = ownPod ? true : pod.autoValidate;
        data.userId = req.user._id;
        let record = new _post.default(data);
        let ret = await record.save();

        if (!pod.autoValidate && !ownPod) {
          let notificationLabel = `${req.user.name} added new post in your pod <strong>${pod.name}</strong>`;
          console.log('notificationLabel', notificationLabel);
          await (0, _notification.createNotification)(req.user._id, pod.userId, notificationLabel, {
            id: pod._id,
            url: `pod/details/${pod._id}`
          });
        }

        return res.send(ret);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "destroy", async (req, res, next) => {
      const _id = req.body.id;
      const userId = req.user._id;

      try {
        let ret = await _post.default.findOneAndDelete({
          _id: (0, _db.toMongoObjectId)(_id)
        });
        return res.send({
          message: 'Deleted',
          ret
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "approve", async (req, res, next) => {
      const id = req.body.id;
      const userId = req.user._id;

      try {
        let ret = await _post.default.findOneAndUpdate({
          _id: (0, _db.toMongoObjectId)(id)
        }, {
          approved: true
        });
        return res.send({
          message: 'Approved',
          ret
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "triggerBot", async (req, res, next) => {
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
        let post = await _post.default.findOne({
          _id: id
        });
        let record = await _pod.default.findOne({
          _id: post.podId
        }).populate('members.userId');
        let comments = post.comments;
        let commentsLength = comments.length;
        let commentRef = 0;
        let botArr = [];
        record.members.map(async ({
          userId: user
        }) => {
          let botSingleObj = {};
          commentRef = commentRef > comments.length ? commentRef = 0 : commentRef + 1;
          botSingleObj.linkedinCookiId = user.linkedinCookiId;
          botSingleObj.autoComment = post.autoComment;
          botSingleObj.autoLike = post.autoLike;
          botSingleObj.autoShare = post.autoShare;
          botSingleObj.comment = comments[commentRef];
          botSingleObj.url = post.url;
          botArr.push(botSingleObj);
        });
        triggerBotPromise(botArr);
        return res.send(record);
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });
  }

}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function triggerBotPromise(botArr) {
  console.log('triggerBotPromise called');

  for (let i = 0; i < botArr.length; i++) {
    let botObj = botArr[i];
    if (!botObj.linkedinCookiId || botObj.linkedinCookiId === '' || botObj.linkedinCookiId === null) continue;
    const browser = await _puppeteer.default.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.setCookie({
      value: botObj.linkedinCookiId
    });

    try {
      await page.goto(botObj.url, {
        waitUntil: 'load',
        timeout: 0
      });
    } catch (e) {
      if (e instanceof _puppeteer.default.errors.TimeoutError) {
        await page.setDefaultNavigationTimeout(0);
      }
    } //COMMENT


    if (botObj.autoComment === true) {
      try {
        await page.type("[class='ql-editor ql-blank']", botObj.comment);
      } catch (e) {
        if (e instanceof _puppeteer.default.errors.TimeoutError) {
          await page.setDefaultNavigationTimeout(0);
        }
      }

      await delay(4000);
      await page.evaluate(() => {
        let elements = document.getElementsByClassName('comments-comment-box__submit-button artdeco-button artdeco-button--1 mt3');

        for (let element of elements) element.click();
      });
    } //LIKE


    if (botObj.autoLike === true) {
      await page.evaluate(() => {
        let elements = document.getElementsByClassName('artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view');

        for (let element of elements) element.click();
      });
    } //SHARE


    if (botObj.autoShare === true) {
      await delay(2000);
      await page.evaluate(() => {
        let elements = document.getElementsByClassName('share-actions__primary-action artdeco-button artdeco-button--2 artdeco-button--primary ember-view');

        for (let element of elements) element.click();
      });
    }

    await delay(4000);
    await browser.close();
  }

  console.log('triggerBotPromise end');
}

var _default = new PostController();

exports.default = _default;
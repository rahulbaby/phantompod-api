import Pod from 'models/pod';
import Post from 'models/post';
import User from 'models/user';
import { createNotification } from 'models/notification';
import { _ } from 'underscore';
import { toMongoObjectId } from 'db';
import { podMemeberStatus } from 'base/constants';
import puppeteer from 'puppeteer';

class PostController {
  index = async (req, res, next) => {
    try {
      const userId = req.user._id;

      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      paginateOptions.populate = { path: 'userId', select: ['_id', 'name'] };
     paginateOptions.populate = [{ path: 'podId', select: ['_id', 'userId'] }, { path: 'userId' }];
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$or = [
        //{ userId: req.user._id },
        { podUserId: req.user._id },
        //{ members: { $elemMatch: { userId: req.user._id, status: podMemeberStatus.ACCEPTED } } },
        { approved: true },
      ];
      let ret = await Post.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  create = async (req, res, next) => {
    let _id = req.body._id;
    let podId = req.body.podId;
    let data = _.pick(
      req.body,
      'podId',
      'url',
      'name',
      'comments',
      'autoShare',
      'autoLike',
      'autoComment',
      'autoValidate',
    );

    try {
      let message = 'Post successfully submitted.';
      if (!req.user.isActive && !req.user.onTrial)
        return res.status(400).send({ message: `You don't have any active plans!` });
      const pod = await Pod.getPodRow(podId);
      if (!pod) return res.status(500).send({ message: "Pod doesn't exists!" });
      const ownPod = req.user._id.toString() == pod.userId.toString();
      data.approved = ownPod ? true : pod.autoValidate;
      data.userId = req.user._id;
      data.podUserId = pod.userId;
      let record = new Post(data);
      let ret = await record.save();
      if (!pod.autoValidate && !ownPod) {
        let notificationLabel = `${req.user.name} added new post in your pod <strong>${pod.name}</strong>`;
        await createNotification(req.user._id, pod.userId, notificationLabel, {
          id: pod._id,
          url: `pod/details/${pod._id}`,
        });
        message = 'Your post has been submitted and is pending admin approval.';
      }
      ret.message = message;
      return res.send({ ...ret._doc, message });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  destroy = async (req, res, next) => {
    const _id = req.body.id;
    const userId = req.user._id;

    try {
      let ret = await Post.findOneAndDelete({ _id: toMongoObjectId(_id) });
      return res.send({ message: 'Deleted', ret });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  approve = async (req, res, next) => {
    const id = req.body.id;
    const userId = req.user._id;
    try {
      let post = await Post.findOne({ _id: toMongoObjectId(id) }).populate('podId');

      let ret = await Post.findOneAndUpdate({ _id: toMongoObjectId(id) }, { approved: true });

      let notificationLabel = `Your recent post on the Pod ${post.podId.name} has been approved by the admin`;
      await createNotification(req.user._id, post.userId, notificationLabel, {
        id: post._id,
        url: `pod/details/${post.podId._id}`,
      });
      return res.send({ message: 'Approved', ret });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  triggerBot = async (req, res, next) => {
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
      let post = await Post.findOne({ _id: id });
      let record = await Pod.findOne({ _id: post.podId }).populate('members.userId');
      let comments = post.comments;
      let commentsLength = comments.length;
      let commentRef = 0;
      let members = record.members.filter(x => x.linkedinCookiId && x.userId !== post.userId);
      let postLikes = 0;
      let profileViews = 0;

      record.members.map(({ userId }) => {
        let user = userId;
        commentRef = commentRef > commentsLength ? (commentRef = 0) : commentRef + 1;
        user.comment = comments[commentRef];
        if (user.linkedinCookiId !== null && user._id.toString() !== post.userId.toString()) {
          (async () => {
            const browser = await puppeteer.launch({ headless: true }); 
            const page = await browser.newPage();
            function delay(time) {
              return new Promise(function (resolve) {
                setTimeout(resolve, time);
              });
            }
            obj['value'] = user.linkedinCookiId;
            await page.setCookie(obj);

            try {
              await page.goto(post.url, { waitUntil: 'load', timeout: 0 });
            } catch (e) {
              if (e instanceof puppeteer.errors.TimeoutError) {
                await page.setDefaultNavigationTimeout(0);
              }
            }
            //COMMENT
            if (post.autoComment === true) {
              try {
                console.log('commting', user.comment);
                await delay(4000);
                await page.type("[class='ql-editor ql-blank']", user.comment);
              } catch (e) {
                if (e instanceof puppeteer.errors.TimeoutError) {
                  await page.setDefaultNavigationTimeout(0);
                }
              }
              await delay(4000);
              await page.evaluate(() => {
                let elements = document.getElementsByClassName(
                  'comments-comment-box__submit-button artdeco-button artdeco-button--1 mt3',
                );
                for (let element of elements) element.click();
              });
            }
            //LIKE
            if (post.autoLike === true) {
              try {
                await page.waitForSelector('[class="artdeco-button__text react-button__text react-button__text--like"]');   
              } catch (e) {
                await page.evaluate(() => {
                  let elements = document.getElementsByClassName(
                    'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view',
                  );
                  for (let element of elements) element.click();
                });
              }
            }

            //SHARE
            if (post.autoShare === true) {
              await delay(2000);
              await page.evaluate(() => {
                let elements = document.getElementsByClassName(
                  'share-actions__primary-action artdeco-button artdeco-button--2 artdeco-button--primary ember-view',
                );
                for (let element of elements) element.click();
              });
            }
            //Reading profile views

            await delay(4000);
            await browser.close();
          })();
        }
        console.log(
          `USER NAME : ${user.name} , linkedinCookiId : ${user.linkedinCookiId} , comment : ${user.comment} `,
        );
      });

      return res.send(record);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new PostController();

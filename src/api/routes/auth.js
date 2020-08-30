import { authToken, app } from 'config';
import { Router } from 'express';
import passport from 'passport';
import Auth from 'controllers/auth';
import UserModel from 'models/user';
import jwt from 'jsonwebtoken';
import { randomPassword } from 'utils/functions';

const fs = require('fs');
const request = require('request');

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

const router = Router();

router.route('/login').post(Auth.login);
router.route('/details').post(Auth.userDetails);

router.route('/google').get(
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
);

router
  .route('/google/signin')
  .get(passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
      const { name, picture, email } = req.user.profile;
      const user = await UserModel.findOne({ email });
      if (user) {
        const token = jwt.sign(user.toJSON(), authToken.jwtSecret, {
          expiresIn: '10h',
        });

        res.redirect(`${app.webUrl}/gauth-response?token=${token}`);
      } else if (email) {
        const UPLOAD_PATH = `./uploads/user/${name}.png`;
        await download(picture, UPLOAD_PATH, () => {});
        const userObject = {
          name,
          email,
          image: `${name}.png`,
          emailVerified: true,
          password: randomPassword(),
        };
        let record = new UserModel(userObject);
        const token = jwt.sign(userObject, authToken.jwtSecret, {
          expiresIn: '10h',
        });

        await record.save();
        res.redirect(`${app.webUrl}/gauth-response?token=${token}`);
      }
      res.redirect(`${app.webUrl}/gauth-response`);
    } catch (error) {
      console.log('error', error);
      let message = error.message || `Something went wrong!`;
      res.redirect(`${app.webUrl}/gauth-response`);
    }
  });

router.route('/pho-uplod-test').get(async (req, res) => {
  try {
    const url = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';
    const UPLOAD_PATH = './uploads/user/aaaa.png';
    await download(url, UPLOAD_PATH, () => {});

    res.send({ message: 'done' });
  } catch (error) {
    console.log('error', error);
    let message = error.message || `Something went wrong!`;
    res.send({ message });
  }
});

export default router;

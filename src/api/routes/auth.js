import { authToken, app } from 'config';
import { Router } from 'express';
import passport from 'passport';
import Auth from 'controllers/auth';
import UserModel from 'models/user';
import jwt from 'jsonwebtoken';
import { randomPassword } from 'utils/functions';

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
        const userObject = { name, email, emailVerified: true, password: randomPassword() };
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

export default router;

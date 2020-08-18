import { authToken, app } from 'config';
import { Router } from 'express';
import passport from 'passport';
import Auth from 'controllers/auth';
import UserModel from 'models/user';
import jwt from 'jsonwebtoken';

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
      let redirectTo = app.webUrl;
      if (user) {
        const token = jwt.sign(user.toJSON(), authToken.jwtSecret, {
          expiresIn: '10h',
        });

        res.redirect(`${redirectTo}/gauth-response?token=${token}`);
      } else if (email) {
        const userObject = { name, email, emailVerified: true };
        let record = new UserModel(userObject);
        const token = jwt.sign(userObject, authToken.jwtSecret, {
          expiresIn: '10h',
        });
        res.redirect(`${redirectTo}/gauth-response?token=${token}`);
      }
      res.redirect(`${redirectTo}/gauth-response`);
    } catch (error) {
      console.log('error', error);
      let message = error.message || `Something went wrong!`;
      res.redirect(`${redirectTo}/gauth-response`);
    }
  });

export default router;

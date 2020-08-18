import { authToken } from 'config';
import { Router } from 'express';
import passport from 'passport';
import { app } from 'config';
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
      const { email } = req.user.profile;
      const user = await UserModel.findOne({ email });

      const token = jwt.sign(user.toJSON(), authToken.jwtSecret, {
        expiresIn: '10h',
      });

      return res.json({ token });
    } catch (error) {
      console.log('error', error);
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  });

export default router;

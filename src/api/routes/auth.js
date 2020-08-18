import { Router } from 'express';
import passport from 'passport';
import { app } from 'config';
import Auth from 'controllers/auth';

const router = Router();

router.route('/login').post(Auth.login);
router.route('/details').post(Auth.userDetails);

router.route('/google').get(
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      //'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
);

/*
router.get(
  '/google/signin',
  (req, res) => {
    console.log(req.user);
    res.send({ req: JSON.stringify(req), kex: 'kex' });
    //res.redirect(`${app.webUrl}/`);
  },
);
*/

router
  .route('/google/signin2')
  .get(passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    try {
      console.log('user', req.user);
      return res.send({ user: req.user, user2: 'hell' });
    } catch (error) {
      console.log('error', error);
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  });

export default router;

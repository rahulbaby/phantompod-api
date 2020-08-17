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
      'https://www.googleapis.com/auth/userinfo.email',
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

router.route('/google/signin').get((req, res) => {
  try {
    console.log('user', req.user);
    return res.send({ gAuth: 'gAuth', email: req.user });
  } catch (error) {
    console.log('error', error);
    let message = error.message || `Something went wrong!`;
    return res.status(400).send({ message, error });
  }
});

export default router;

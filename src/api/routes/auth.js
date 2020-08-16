import { Router } from 'express';
import passport from 'passport';
import { app } from 'config';
import Auth from 'controllers/auth';

const router = Router();

router.route('/login').post(Auth.login);
router.route('/details').post(Auth.userDetails);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
);

router.get(
  '/google/signin',
  //passport.authenticate('google', { failureRedirect: `${app.webUrl}/login` }),
  (req, res) => {
    console.log(req.user);
    res.send({ req: JSON.stringify(req), kex: 'kex' });
    //res.redirect(`${app.webUrl}/`);
  },
);

export default router;

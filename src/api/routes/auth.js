import { Router } from 'express';
import passport from 'passport';
import { app } from 'config';
import Auth from 'controllers/auth';

const router = Router();

router.route('/login').post(Auth.login);
router.route('/details').post(Auth.userDetails);

router.get('/google', (req, res) => {
  return res.status(404);
});

router.get('/google/signin', (req, res) => {
  return res.status(404);
});

export default router;

import BaseController from 'base/controller';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { authToken } from 'config';

class AuthController extends BaseController {
  login = async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user,
          err,
        });
      }

      req.login(user, { session: false }, err => {
        if (err) {
          res.status(401).json({ err, message: 'Auth error' });
        }

        const token = jwt.sign(user.toJSON(), authToken.jwtSecret, {
          expiresIn: '10h',
        });
        return res.json({ user, token });
      });
    })(req, res);
  };

  userDetails = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Not authenticated!',
          user: user,
        });
      }

      req.login(user, { session: false }, err => {
        if (err) {
          res.status(401).json({ err, message: 'Auth error' });
        }

        return res.status(200).json({ user });
      });
    })(req, res);
  };
}

export default new AuthController();

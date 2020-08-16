import { google, authToken, app } from 'config';
import UserModel from 'models/user';
import passport from 'passport';
import passportJWT from 'passport-jwt';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, cb) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) return cb(null, false, { message: 'Invalid email address.' });
        user.comparePassword(password, (err, isMatch) => {
          if (!isMatch) return cb(null, false, { message: 'Wrong Password' });
          return cb(null, user, { message: 'Logged in Successfully' });
        });
      } catch (error) {
        return cb(error, null, { message: 'Token not valid' });
      }
    },
  ),
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: authToken.jwtSecret,
    },
    async (jwtPayload, cb) => {
      try {
        const user = await UserModel.findOne({ email: jwtPayload.email });
        cb(null, user);
      } catch (error) {
        console.log('error in catch');
        cb(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: google.OAuth.GOOGLE_CLIENT_ID,
      clientSecret: google.OAuth.GOOGLE_CLIENT_SECRET,
      callbackURL: `${app.baseUrl}/auth/google/signin`,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log({ accessToken, refreshToken, profil });
      const { name, email } = profile._json;
      try {
        const user = await UserModel.findOne({ email });
        done(null, user);
      } catch (error) {
        console.log('error in catch', error);
        done(error);
      }
    },
  ),
);

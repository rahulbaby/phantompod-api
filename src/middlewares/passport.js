import { google, authToken, app } from 'config';
import UserModel from 'models/user';
import passport from 'passport';
import passportJWT from 'passport-jwt';

//const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

const GoogleStrategy = require('passport-google-oauth2').Strategy;

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

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = google.OAuth;

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: '642915743730-e22s4k165v54g16su0meqq01biiufng4.apps.googleusercontent.com',
      clientSecret: '8nJbidwgtXf7ryIpeS-PmaDj',
      callbackURL: `https://app.phantompod.co/api/auth/google/signin`,
    },
    (token, refreshToken, profile, done) => {
      let user = profile._json;
      console.log('profile @ passport', user);

      return done(null, {
        profile: user,
        token: token,
      });
    },
  ),
);

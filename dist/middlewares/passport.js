"use strict";

var _config = require("config");

var _user = _interopRequireDefault(require("../api/models/user"));

var _passport = _interopRequireDefault(require("passport"));

var _passportJwt = _interopRequireDefault(require("passport-jwt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const ExtractJWT = _passportJwt.default.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;

const JWTStrategy = _passportJwt.default.Strategy;

_passport.default.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, cb) => {
  try {
    const user = await _user.default.findOne({
      email
    });
    if (!user) return cb(null, false, {
      message: 'Invalid email address.'
    });
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) return cb(null, false, {
        message: 'Wrong Password'
      });
      return cb(null, user, {
        message: 'Logged in Successfully'
      });
    });
  } catch (error) {
    return cb(error, null, {
      message: 'Token not valid'
    });
  }
}));

_passport.default.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: _config.authToken.jwtSecret
}, async (jwtPayload, cb) => {
  try {
    const user = await _user.default.findOne({
      email: jwtPayload.email
    });
    cb(null, user);
  } catch (error) {
    console.log('error in catch');
    cb(error);
  }
}));

_passport.default.use(new GoogleStrategy({
  clientID: _config.google.OAuth.GOOGLE_CLIENT_ID,
  clientSecret: _config.google.OAuth.GOOGLE_CLIENT_SECRET,
  callbackURL: `${_config.app.baseUrl}/auth/google/signin`
}, async function (accessToken, refreshToken, profile, done) {
  const {
    name,
    email
  } = profile._json;

  try {
    const user = await _user.default.findOne({
      email
    });
    done(null, user);
  } catch (error) {
    console.log('error in catch', error);
    done(error);
  }
}));
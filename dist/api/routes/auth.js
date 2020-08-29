"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = require("config");

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _auth = _interopRequireDefault(require("../controllers/auth"));

var _user = _interopRequireDefault(require("../models/user"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _functions = require("../../utils/functions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/login').post(_auth.default.login);
router.route('/details').post(_auth.default.userDetails);
router.route('/google').get(_passport.default.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email']
}));
router.route('/google/signin').get(_passport.default.authenticate('google', {
  failureRedirect: '/login'
}), async (req, res) => {
  try {
    const {
      name,
      picture,
      email
    } = req.user.profile;
    const user = await _user.default.findOne({
      email
    });

    if (user) {
      const token = _jsonwebtoken.default.sign(user.toJSON(), _config.authToken.jwtSecret, {
        expiresIn: '10h'
      });

      res.redirect(`${_config.app.webUrl}/gauth-response?token=${token}`);
    } else if (email) {
      const userObject = {
        name,
        email,
        emailVerified: true,
        password: (0, _functions.randomPassword)()
      };
      let record = new _user.default(userObject);

      const token = _jsonwebtoken.default.sign(userObject, _config.authToken.jwtSecret, {
        expiresIn: '10h'
      });

      await record.save();
      res.redirect(`${_config.app.webUrl}/gauth-response?token=${token}`);
    }

    res.redirect(`${_config.app.webUrl}/gauth-response`);
  } catch (error) {
    console.log('error', error);
    let message = error.message || `Something went wrong!`;
    res.redirect(`${_config.app.webUrl}/gauth-response`);
  }
});
var _default = router;
exports.default = _default;
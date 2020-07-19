"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _config = require("config");

var _auth = _interopRequireDefault(require("../controllers/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.route('/login').post(_auth.default.login);
router.route('/details').post(_auth.default.userDetails);
router.get('/google', _passport.default.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email']
}));
router.get('/google/signin', _passport.default.authenticate('google', {
  failureRedirect: `${_config.app.webUrl}/login`
}), (req, res) => {
  console.log(req.user);
  res.redirect(`${_config.app.webUrl}/`);
});
var _default = router;
exports.default = _default;
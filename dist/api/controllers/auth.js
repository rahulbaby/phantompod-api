"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _controller = _interopRequireDefault(require("../../base/controller"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _passport = _interopRequireDefault(require("passport"));

var _config = require("config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AuthController extends _controller.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "login", async (req, res, next) => {
      _passport.default.authenticate('local', {
        session: false
      }, (err, user, info) => {
        if (err || !user) {
          return res.status(400).json({
            message: info ? info.message : 'Login failed',
            user: user,
            err
          });
        }

        req.login(user, {
          session: false
        }, err => {
          if (err) {
            res.status(401).json({
              err,
              message: 'Auth error'
            });
          }

          const token = _jsonwebtoken.default.sign(user.toJSON(), _config.authToken.jwtSecret, {
            expiresIn: '10h'
          });

          return res.json({
            user,
            token
          });
        });
      })(req, res);
    });

    _defineProperty(this, "userDetails", async (req, res, next) => {
      _passport.default.authenticate('jwt', {
        session: false
      }, (err, user, info) => {
        if (err || !user) {
          return res.status(400).json({
            message: info ? info.message : 'Not authenticated!',
            user: user
          });
        }

        req.login(user, {
          session: false
        }, err => {
          if (err) {
            res.status(401).json({
              err,
              message: 'Auth error'
            });
          }

          return res.status(200).json({
            user
          });
        });
      })(req, res);
    });
  }

}

var _default = new AuthController();

exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _cookieSession = _interopRequireDefault(require("cookie-session"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _config = _interopRequireDefault(require("config"));

var _cors = _interopRequireDefault(require("cors"));

var _passport = _interopRequireDefault(require("passport"));

var _fs = _interopRequireDefault(require("fs"));

var _crypto = _interopRequireDefault(require("crypto"));

var _router = _interopRequireDefault(require("./base/router"));

require("./middlewares/passport");

var _db = require("./db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();

var session = require('express-session');

const onProduction = process.env.NODE_ENV === 'production';
app.disable('x-powered-by');
app.set('port', _config.default.get('app.port'));
app.use((0, _morgan.default)('dev'));
app.use(_bodyParser.default.json());
app.use(_bodyParser.default.urlencoded({
  extended: false,
  keepExtensions: true,
  uploadDir: __dirname + '/uploads'
}));
app.use((0, _cookieSession.default)({
  name: 'session',
  keys: ['123']
}));
app.use((0, _cookieParser.default)());
let corsConfig = {};

if (onProduction) {
  corsConfig = {
    origin: function (origin, callback) {
      const allowedOrigins = ['https://www.phantompods.co', 'https://www.admin.phantompods.co'];
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1 && false) {
        let msg = 'The CORS policy for this site does not ' + 'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    }
  };
}

app.use((0, _cors.default)(corsConfig));
/*---------------------------------*/

app.use(_express.default.static('uploads'));
app.use(_passport.default.initialize());
/*
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
  }),
);
app.get(
  '/auth/google/signin',
  passport.authenticate('google', {
    failureRedirect: '/',
  }),
  (req, res) => {
    console.log('profile: req.profile', req.user.profile);
    return res.send({ profile: req.user.profile, token: req.user.token });
  },
);
*/

app.use(_router.default); // catch 404 and forward to error handler

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}); // error handler

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.send(err);
});

const createServer = () => {
  return process.env.NODE_ENV === 'production' && false ? _https.default.createServer({
    key: _config.default.get('ssl.key'),
    cert: _config.default.get('ssl.cert')
  }, app) : _http.default.createServer(app);
};

const server = createServer();
const port = app.get('port');

const run = async () => {
  server.listen(port, () => {
    console.log(`Application listening on ${_config.default.get('app.baseUrl')}`);
    console.log(`Environment => ${_config.default.util.getEnv('NODE_ENV')}`);
  });
};

var _default = (0, _db.connectDb)(run);

exports.default = _default;
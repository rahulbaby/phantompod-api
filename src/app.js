import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import https from 'https';
import config from 'config';
import cors from 'cors';
import passport from 'passport';
import fs from 'fs';
import crypto from 'crypto';

import router from 'base/router';
import 'middlewares/passport';
import { connectDb } from './db';

const app = express();
var session = require('express-session');

const onProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('port', config.get('app.port'));
app.use(
  session({
    secret: 'phantompods_session_SSRR',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10000 },
  }),
);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
    keepExtensions: true,
    uploadDir: __dirname + '/uploads',
  }),
);
app.use(cookieParser());

let corsConfig = {};

if (onProduction) {
  corsConfig = {
    origin: function (origin, callback) {
      const allowedOrigins = ['https://www.phantompods.co', 'https://www.admin.phantompods.co'];
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1 && false) {
        let msg =
          'The CORS policy for this site does not ' + 'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  };
}

app.use(cors(corsConfig));

/*---------------------------------*/
app.use(express.static('uploads'));

app.use(passport.initialize());

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'],
  }),
);

app.get(
  '/auth/google/signin',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  }),
);

app.use(router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

const createServer = () => {
  return process.env.NODE_ENV === 'production' && false
    ? https.createServer(
        {
          key: config.get('ssl.key'),
          cert: config.get('ssl.cert'),
        },
        app,
      )
    : http.createServer(app);
};

const server = createServer();
const port = app.get('port');

const run = async () => {
  server.listen(port, () => {
    console.log(`Application listening on ${config.get('app.baseUrl')}`);
    console.log(`Environment => ${config.util.getEnv('NODE_ENV')}`);
  });
};

export default connectDb(run);

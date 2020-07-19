"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "paginatePlugin", {
  enumerable: true,
  get: function () {
    return _paginatePlugin.default;
  }
});
exports.toMongoObjectId = exports.connectDb = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _config = _interopRequireDefault(require("config"));

var _chalk = _interopRequireDefault(require("chalk"));

var _paginatePlugin = _interopRequireDefault(require("./paginatePlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connected = _chalk.default.bold.cyan;
var error = _chalk.default.bold.yellow;
var disconnected = _chalk.default.bold.red;
var termination = _chalk.default.bold.magenta;

const connectDb = cb => {
  const dbURL = _config.default.get('db.url');

  _mongoose.default.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true
  });

  _mongoose.default.connection.on('connected', function () {
    console.log(connected('Mongoose default connection is open to ', dbURL));
    cb();
  });

  _mongoose.default.connection.on('error', function (err) {
    console.log(error('Mongoose default connection has occured ' + err + ' error'));
  });

  _mongoose.default.connection.on('disconnected', function () {
    console.log(disconnected('Mongoose default connection is disconnected'));
  });
};

exports.connectDb = connectDb;

const toMongoObjectId = id => _mongoose.default.Types.ObjectId(id);

exports.toMongoObjectId = toMongoObjectId;
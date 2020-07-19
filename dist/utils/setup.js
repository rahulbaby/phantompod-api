"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _config = _interopRequireDefault(require("config"));

var _q = _interopRequireDefault(require("q"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The setup class for all the dependencies of the application
 */
class SetUp {
  /**
   * @constructor
   * @param {Object} config The config object
   */
  static initialize() {
    this.setupMongoose();
  }
  /**
   * This will setup mongodb
   */


  static setupMongoose() {
    _mongoose.default.Promise = _q.default.Promise;

    _mongoose.default.connection.on('open', () => {
      console.log('Connected to mongo shell.');
      console.log('mongodb url ', _config.default.get('db.url'));
    });

    _mongoose.default.connection.on('error', err => {
      console.log('Could not connect to mongo server!');
      console.log(err);
    });

    return _mongoose.default.connect(_config.default.get('db.url'), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

}

var _default = SetUp;
exports.default = _default;
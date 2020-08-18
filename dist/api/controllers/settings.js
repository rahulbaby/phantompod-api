"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _settings = _interopRequireDefault(require("../models/settings"));

var _underscore = _interopRequireDefault(require("underscore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BlockController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        const row = await _settings.default.findOne({});
        return res.send(row || {});
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });

    _defineProperty(this, "update", async (req, res, next) => {
      try {
        let data = _underscore.default.pick(req.body, 'trialPodCount', 'trialDayCount');

        const record = await _settings.default.findOne({});

        if (record) {
          ['trialPodCount', 'trialDayCount', 'productPriceId', 'productName', 'productPeriod'].map(x => {
            if (req.body[x]) record[x] = req.body[x];
          });
          console.log(record);
          await _settings.default.findByIdAndUpdate(record._id, record);
        } else {
          let newSettings = new _settings.default(data);
          await newSettings.save();
        }

        return res.status(200).send({
          message: 'Success'
        });
      } catch (error) {
        let message = error.message || `Something went wrong!`;
        return res.status(400).send({
          message,
          error
        });
      }
    });
  }

}

var _default = new BlockController();

exports.default = _default;
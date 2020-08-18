"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _payments = _interopRequireDefault(require("../models/payments"));

var _db = require("../../db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//dummy coment
class PaymentsController {
  constructor() {
    _defineProperty(this, "index", async (req, res, next) => {
      try {
        const userId = req.user.id;
        let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
        paginateOptions.sort = {
          createdAt: -1
        };
        paginateOptions.populate = {
          path: 'user',
          select: ['_id', 'name', 'email']
        };
        let query = req.query.query ? JSON.parse(req.query.query) : {};
        let ret = await _payments.default.paginate(query, paginateOptions);
        return res.send(ret);
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

var _default = new PaymentsController();

exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoosePaginate = _interopRequireDefault(require("mongoose-paginate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoosePaginate.default.paginate.options = {
  lean: true,
  limit: 20,
  sort: {
    createdAt: -1
  }
};
var _default = _mongoosePaginate.default;
/*

var options = {
  select: 'title date author',
  sort: { date: -1 },
  populate: 'author',
  lean: true,
  offset: 20, 
  limit: 10
};
*/

exports.default = _default;
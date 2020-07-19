"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = path => {
  try {
    _fs.default.unlinkSync(path);
  } catch (err) {
    console.error(err);
  }
};

exports.default = _default;
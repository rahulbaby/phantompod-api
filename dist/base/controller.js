"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class BaseController {
  jsonResponse(res, data, code = 200) {
    return res.status(200).json(data);
  }

}

var _default = BaseController;
exports.default = _default;
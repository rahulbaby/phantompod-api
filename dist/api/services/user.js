"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUser = void 0;

var _user = _interopRequireDefault(require("../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createUser = async () => {
  try {
    let saveUser = await newUser.save();
  } catch (err) {
    return err;
  }
};

exports.createUser = createUser;
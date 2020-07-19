"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allowOnly = void 0;

const allowOnly = (accessLevel, callback) => {
  checkUserRole = (req, res) => {
    if (!(accessLevel & req.user.role)) {
      res.sendStatus(403);
      return;
    }

    callback(req, res);
  };

  return checkUserRole;
};

exports.allowOnly = allowOnly;
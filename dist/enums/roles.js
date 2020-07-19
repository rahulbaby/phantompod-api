"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accessLevels = exports.userRoles = void 0;
const userRoles = {
  ADMIN: 1,
  USER: 2
};
exports.userRoles = userRoles;
const accessLevels = {
  USER: userRoles.STUDENT || userRoles.ADMIN,
  ADMIN: userRoles.ADMIN
};
exports.accessLevels = accessLevels;
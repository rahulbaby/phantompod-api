"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userAccountStatus = exports.podMemeberStatus = void 0;
const podMemeberStatus = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  BANNED: 'banned'
};
exports.podMemeberStatus = podMemeberStatus;
const userAccountStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  ERROR: 'error',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};
exports.userAccountStatus = userAccountStatus;
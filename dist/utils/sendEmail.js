"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodemailerSesTransport = _interopRequireDefault(require("nodemailer-ses-transport"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _cryptr = _interopRequireDefault(require("cryptr"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cryptr = new _cryptr.default('pass123');
const mailOptions = {
  from: `hello@phantompod.co`,
  to: 'developer@phantompod.co',
  subject: ``,
  text: `http://localhost:3000/verify-email?hash=`,
  replyTo: `hello@phantompod.co`
};

const sendEmail = () => {
  return async extrConfig => {
    sesTransporter.sendMail({ ...mailOptions,
      ...extrConfig
    }, (err, resp) => {
      if (err) {
        console.error('there was an error: ', err);
      } else {
        console.log('here is the res: ', resp);
        return newRes.send('Saved');
      }
    });
  };
};

var _default = sendEmail;
exports.default = _default;
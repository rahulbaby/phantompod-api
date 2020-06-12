import { Otp } from 'helpers';
export const validateOtp = (callback) => {
  let checkOtp = (req, res) => {
    if (!Otp.verifyOtp(req.body.otp, req.body.code))
      return res.status(500).send({ msg: 'Wrong OTP!' });

    callback(req, res);
  };

  return checkOtp;
};

export default validateOtp;

import speakeasy from 'speakeasy';

const encoding = 'base32';
const timeDefault = 60 * 5;

export const generateOtp = () => {
  let secret = speakeasy.generateSecret();
  let token = speakeasy.totp({
    secret: secret.base32,
    encoding,
    time: timeDefault, // specified in seconds
  });
  console.log({ token });
  return { otp: token, code: secret.base32 };
};

export const verifyOtp = (otp, code) => {
  let verified = speakeasy.totp.verify({
    secret: code,
    encoding,
    token: otp,
    time: timeDefault,
  });
  return verified;
};

export default { generateOtp, verifyOtp };

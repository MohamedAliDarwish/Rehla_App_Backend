const crypto = require("crypto");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(otp)
    .digest("hex");
};

module.exports = {
  generateOTP,
  hashOTP,
};

// const express = require("express");
// const validate = require("../middlewares/validate.middleware");
// const {
//   registerValidator,
//   otpValidator,
//   emailValidator,
//   passwordValidator,
//   loginValidator,
//   ForgetPasswordValidator,
// } = require("../validator/auth.validation");
// const authController = require("../controllers/user.controller");

// const router = express.Router();

// router.post("/signup", validate(registerValidator), authController.signup);
// router.post("/user_verified", validate(otpValidator), authController.verifyOTP);
// router.post("/resend_otp", validate(emailValidator), authController.resendOtp);

// router.post(
//   "/forget_password",
//   validate(emailValidator),
//   authController.forgotPassword,
// );

// router.post(
//   "/forget_password/otp",
//   validate(otpValidator),
//   authController.verifyResetOTP,
// );

// router.post(
//   "/forget_password/change_password",
//   validate(ForgetPasswordValidator),
//   authController.resetPassword,
// );

// router.post("/login", validate(loginValidator), authController.login);

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
  signup,
  login,
} = require("../controllers/user.controller");

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;



/*





Admin

admin@rehla.com

Admin123456


User

ahmed@gmail.com

User123456


User

sara@gmail.com

User123456


User

omar@gmail.com

User123456


*/

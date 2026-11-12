const { z } = require("zod");
const messages = require("../constants/messages");

const registerValidator = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, messages.validation.nameRequired)
    .min(3, "Name must be more than 3 characters"),
  email: z
    .string()
    .trim()
    .min(1, messages.validation.emailRequired)
    .email("enter valid email"),
  password: z.string().min(8, messages.validation.passwordMin),
  phone: z
    .string()
    .trim()
    .min(8, messages.validation.phone)
    .max(20, "phone must be less than 20 characters")
    .regex(/^[0-9]+$/, "Phone must contain numbers only"),

  profileImgPath: z.string().optional(),
});

const otpValidator = z.object({
  otp: z
    .string()
    .trim()
    .min(6, messages.validation.nameRequired)
    .min(6, "Name must be more than 3 characters"),
  email: z
    .string()
    .trim()
    .min(1, messages.validation.emailRequired)
    .email("enter valid email"),
});

const emailValidator = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Email is required"
          : "Email must be a string",
    })
    .trim()
    .min(1, "Email is required")
    .email("Enter valid email"),
});
// const sendOtpValidator = z.object({
//   email: z
//     .string()
//     .trim()
//     .min(1, "Email is required")
//     .email("enter valid email"),
// });

const passwordValidator = z.object({
  password: z.string().min(8, messages.validation.passwordMin),
});
const loginValidator = z.object({
  email: z
    .string()
    .trim()
    .min(1, messages.validation.emailRequired)
    .email("enter valid email"),
  password: z.string().min(8, messages.validation.passwordMin),
});

const ForgetPasswordValidator = z.object({
  newPassword: z.string().min(8, messages.validation.passwordMin),
  resetToken: z.string(),
});
module.exports = {
  registerValidator,
  otpValidator,
  emailValidator,
  passwordValidator,
  loginValidator,
  ForgetPasswordValidator,
};

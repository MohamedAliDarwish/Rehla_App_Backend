const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  console.log("===================================");
  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);
  console.log("===================================");

  await transporter.sendMail({
    from: `"Rehla App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email in Rehla Egypt App",
    html: `
    <h1>This App For NTI (Testing mail)</h1>
      <div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to My App!</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  });
};

module.exports = { sendOTP };

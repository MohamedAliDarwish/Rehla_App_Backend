
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

// ================= SIGNUP =================

const signup = async (req, res) => {
  try {
    const { fullName, email, password, phone, profileImgPath } = req.body;

    // Check required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check existing email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      profileImgPath: profileImgPath || "",
    });

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImgPath: user.profileImgPath,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

// ================= LOGIN =================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePasswordHash(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImgPath: user.profileImgPath,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  signup,
  login,
};

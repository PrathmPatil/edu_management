const User = require("../models/User.model");
const Student = require("../models/Student.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // 2️⃣ Try to find user in User collection
    let account = await User.findOne({ email });
    let accountType = "User";

    // 3️⃣ If not found, check Student collection
    if (!account) {
      account = await Student.findOne({ email });
      accountType = "Student";
    }

    // 4️⃣ If not found in both
    if (!account) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 5️⃣ Compare password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 6️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: account._id,
        role: account.role || accountType,
        email: account.email,
        type: accountType
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 7️⃣ Response
    res.status(200).json({
      token,
      role: account.role || accountType,
      email: account.email,
      type: accountType,
      id: account._id,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error during login"
    });
  }
};

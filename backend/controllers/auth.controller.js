const User = require("../models/User.model");
const Student = require("../models/Student.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {

    const { email, password } = req.decrypted;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    let account = await User.findOne({ email });
    let accountType = "User";

    if (!account) {
      account = await Student.findOne({ email, is_deleted: false });
      accountType = "Student";
    }

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: account._id,
        role: account.role || accountType,
        email: account.email,
        type: accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      role: account.role || accountType,
      email: account.email,
      id: account._id,
      type: accountType,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User.model");

mongoose.connect(process.env.MONGO_URI);

(async () => {
  await User.deleteMany();

  await User.create([
    {
      email: "admin@test.com",
      password: "admin123",
      role: "Admin"
    },
    // student user
    {
      email: "user@test.com",
      password: "user123",
      role: "Student"
    }
  ]);

  console.log("Users seeded");
  process.exit();
})();

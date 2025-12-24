const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: Number,
    course: {
      type: String,
      enum: ["React", "Node", "Java", "Python"],
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
module.exports = mongoose.model("Student", studentSchema);


const Student = require("../models/Student.model");

exports.createStudent = async (req, res) => {
  const existingStudent = await Student.findOne({ email: req.body.email });

  if (existingStudent) {
    return res.status(409).json({
      message: "Student with this email already exists",
    });
  }
  const student = await Student.create(req.body);
  res.status(201).json(student);
};

exports.getStudents = async (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const query = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  };

  const students = await Student.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Student.countDocuments(query);

  res.json({ students, total });
};

exports.getStudentById = async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }
  const student = await Student.findById(req.params.id);
  res.json(student);
};

exports.updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(student);
};

exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted successfully" });
};

const Student = require("../models/Student.model");
const bcrypt = require("bcryptjs");
const express = require("express");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const { studentSchema } = require("../validation/student.validation");

exports.createStudent = async (req, res) => {
  try {
    const data = req.decrypted;

    if (!data?.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if active user exists
    const existingActiveUser = await Student.findOne({
      email: data.email,
      is_deleted: false,
    });

    if (existingActiveUser) {
      return res.status(409).json({
        message: "Student with this email already exists",
      });
    }

    // Check if soft-deleted user exists
    const existingDeletedUser = await Student.findOne({
      email: data.email,
      is_deleted: true,
    });

    if (existingDeletedUser) {
      // Restore soft-deleted user
      existingDeletedUser.is_deleted = false;

      // Update other fields from request
      existingDeletedUser.name = data.name || existingDeletedUser.name;
      existingDeletedUser.age = data.age || existingDeletedUser.age;
      existingDeletedUser.course = data.course || existingDeletedUser.course;
      existingDeletedUser.status = data.status || existingDeletedUser.status;

      // Update password if provided
      if (data.password) existingDeletedUser.password = data.password;

      await existingDeletedUser.save();
      return res.status(200).json(existingDeletedUser);
    }

    // No conflicts, create new user
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (err) {
    console.error("Create Student Error:", err);
    res.status(500).json({ message: "Failed to create student" });
  }
};

exports.getStudents = async (req, res) => {
  const data = req.decrypted;
  const { search = "", page = 1, limit = 10 } = data;
  const query = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  };

  const students = await Student.find({ ...query, is_deleted: false })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .select("-password");

  const total = await Student.countDocuments({ ...query, is_deleted: false });

  res.json({ students, total, totalPages: Math.ceil(total / limit) });
};

exports.getStudentById = async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  const isDeleted = await Student.findById(req.params.id).select("is_deleted");
  if (isDeleted.is_deleted) {
    return res.status(404).json({ message: "Student not found" });
  }
  const student = await Student.findById(req.params.id);
  res.json(student);
};

exports.updateStudent = async (req, res) => {
  try {
    const { id, data } = req.decrypted;

    if (!id) {
      return res.status(400).json({ message: "Student ID required" });
    }

    // ✅ Hash password only if present
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, data, {
      new: true,
      select: "-password",
    });

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Failed to update student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.decrypted;

    if (!id) {
      return res.status(400).json({ message: "Student ID required" });
    }

    await Student.findByIdAndUpdate(id, { is_deleted: true });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.bulkUploadStudents = async (req, res) => {
  let filePath;

  try {
    /* 1️⃣ Check file exists */
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = path.resolve(req.file.path);

    /* 2️⃣ Read Excel safely (corrupted file handling) */
    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or corrupted Excel file",
      });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ message: "Excel sheet not found" });
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    /* 3️⃣ Empty Excel check */
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const validStudents = [];
    const invalidRows = [];
    const emailsInFile = [];

    /* 4️⃣ Joi validation */
    data.forEach((row, index) => {
      const { error } = studentSchema.validate(row, { abortEarly: false });

      if (error) {
        invalidRows.push({
          row: index + 2, // Excel header = row 1
          errors: error.details.map((e) => e.message),
        });
      } else {
        validStudents.push(row);
        emailsInFile.push(row.email);
      }
    });

    if (invalidRows.length) {
      logger.error("Bulk upload validation failed", { invalidRows });
      return res.status(400).json({
        message: "Invalid data found in Excel file",
        invalidRows,
      });
    }

    /* 5️⃣ Check duplicate emails in DB */
    const existingStudents = await Student.find({
      email: { $in: emailsInFile },
      is_deleted: false,
    }).select("email");

    if (existingStudents.length) {
      const duplicateEmails = existingStudents.map((s) => s.email);

      return res.status(400).json({
        message:
          "Some students already exist. Please remove these emails from the sheet.",
        duplicateEmails,
      });
    }

    /* 6️⃣ Insert only if everything is valid */
    const insertedStudents = await Student.insertMany(validStudents);

    res.status(201).json({
      message: "Students uploaded successfully",
      insertedCount: insertedStudents.length,
    });
  } catch (err) {
    logger.error("Bulk upload error", { error: err.message });

    res.status(500).json({
      message: "Bulk upload failed",
      error: err.message,
    });
  } finally {
    /* 7️⃣ Always delete uploaded file */
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error("Failed to delete Excel file", { error: err.message });
        }
      });
    }
  }
};

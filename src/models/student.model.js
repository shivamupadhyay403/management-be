const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    admissionNo: {
      type: String,
      required: true,
    },

    rollNo: String,

    firstName: {
      type: String,
      required: true,
    },

    lastName: String,

    dob: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    phone: String,

    address: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
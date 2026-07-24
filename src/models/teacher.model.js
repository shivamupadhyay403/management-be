const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    employeeId: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },

    qualification: {
      type: String,
    },

    experience: {
      type: Number,
      default: 0,
    },

    subject: {
      type: String,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      required: true,
    },

    passwordChanged: {
      type: Boolean,
      default: false,
    },
    salary: {
      type: Number,
    },

    address: {
      type: String,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });

teacherSchema.index({ schoolId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);

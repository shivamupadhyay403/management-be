const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.index({ schoolId: 1 });
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ role: 1, isActive: 1 });
module.exports = mongoose.model('User', userSchema);

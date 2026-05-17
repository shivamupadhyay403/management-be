/**
 * Model: User  (Base for all roles)
 * PDF Ref §5 — fields: _id, schoolId, name, email, passwordHash, role,
 *              phone, avatar, isActive, refreshTokens, lastLogin,
 *              permissions, createdAt, updatedAt
 *
 * ✦ = enhancement beyond the PDF spec
 */
const mongoose = require('mongoose');

// ── Exported enums ─────────────────────────────────────────────────────────
const ROLES = Object.freeze([
  'SUPER_ADMIN',       // full system control (no schoolId)
  'SCHOOL_ADMIN',      // manages one school
  'PRINCIPAL',
  'TEACHER',
  'STUDENT',
  'PARENT',
  'ACCOUNTANT',
  'LIBRARIAN',
  'HR',
  'TRANSPORT_MANAGER',
]);

const PERMISSIONS = Object.freeze([
  'VIEW_STUDENT',   'ADD_STUDENT',    'EDIT_STUDENT',    'DELETE_STUDENT',
  'VIEW_FEES',      'MANAGE_FEES',
  'VIEW_EXAMS',     'MANAGE_EXAMS',
  'VIEW_ATTENDANCE','MANAGE_ATTENDANCE',
  'MANAGE_LIBRARY', 'MANAGE_TRANSPORT','MANAGE_HOSTEL',
  'VIEW_REPORTS',   'MANAGE_USERS',   'MANAGE_PAYROLL',
]);

// ── Schema ─────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // — Identity —
    // PDF has single `name`; split for sorting/search (virtual `name` re-joins)
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'Min 2 characters'],
      maxlength: [50, 'Max 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Min 2 characters'],
      maxlength: [50, 'Max 50 characters'],
    },

    // PDF: email — unique, lowercase, indexed
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Provide a valid email'],
    },

    // PDF: passwordHash — stored as `password`, bcrypt-hashed before save
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Min 8 characters'],
      select: false,
    },

    // PDF: phone — E.164 format
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, 'Provide a valid phone number (E.164)'],
      default: null,
    },

    gender: {                          // ✦
      type: String,
      enum: { values: ['M', 'F', 'O'], message: 'Must be M, F, or O' },
      required: [true, 'Gender is required'],
    },

    dateOfBirth: { type: Date, default: null }, // ✦

    // PDF: avatar — URL to profile image
    avatar: { type: String, default: null },

    // — School & Role —
    // PDF: schoolId (null for SUPER_ADMIN)
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SCHOOL',
      default: null,
      index: true,
    },

    // PDF: role
    role: {
      type: String,
      enum: { values: ROLES, message: '"{VALUE}" is not a valid role' },
      required: [true, 'Role is required'],
      index: true,
    },

    // PDF: permissions — granular overrides on top of role
    permissions: {
      type: [String],
      enum: { values: PERMISSIONS, message: '"{VALUE}" is not a valid permission' },
      default: [],
    },

    // — Account Status —
    // PDF: isActive (Boolean) — extended to a 4-state enum ✦
    status: {
      type: String,
      enum: { values: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'], message: 'Invalid status' },
      default: 'PENDING',   // verify email before activating
      index: true,
    },

    isEmailVerified: { type: Boolean, default: false },                 // ✦
    emailVerificationToken: { type: String, select: false, default: null }, // ✦
    emailVerificationExpiry: { type: Date,   select: false, default: null }, // ✦

    // — Password Reset — ✦
    passwordResetToken:  { type: String, select: false, default: null },
    passwordResetExpiry: { type: Date,   select: false, default: null },

    // PDF: refreshTokens — array of hashed refresh tokens
    refreshTokens: { type: [String], select: false, default: [] },

    // — Activity —
    // PDF: lastLogin
    lastLogin: { type: Date, default: null },
    lastPasswordChangedAt: { type: Date, default: null }, // ✦

    // — Soft Delete — ✦
    // PDF: isActive (Boolean) mapped to deletedAt/deletedBy pattern
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', default: null },
  },
  {
    timestamps: true, // PDF: createdAt, updatedAt
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpiry;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ───────────────────────────────────────────────────────────────
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual('isActive').get(function () {
  return this.status === 'ACTIVE' && this.deletedAt === null;
});
userSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

// ── Compound indexes ────────────────────────────────────────────────────────
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, status: 1 });
userSchema.index({ deletedAt: 1 }, { sparse: true });

// ── Pre-find: exclude soft-deleted by default ──────────────────────────────
// Opt out: Model.find({}).setOptions({ includeDeleted: true })
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) this.where({ deletedAt: null });
  next();
});

const User = mongoose.model('USER', userSchema);
module.exports = { User, ROLES, PERMISSIONS };
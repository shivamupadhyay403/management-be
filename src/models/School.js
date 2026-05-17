/**
 * Model: School
 * PDF Ref §5 — fields: _id, name, code, address, logo, phone, email,
 *              website, principalId, academicYear, plan, planExpiry,
 *              settings, isActive, createdAt
 *
 * ✦ = enhancement beyond PDF spec
 */
const mongoose = require('mongoose');

// ── Exported enums ─────────────────────────────────────────────────────────
const BOARD_TYPES = Object.freeze(['CBSE','ICSE','STATE_BOARD','IB','IGCSE','OTHER']);

const SUBSCRIPTION_PLANS = Object.freeze(['FREE','STARTER','PRO','ENTERPRISE']);

const FEATURES = Object.freeze([
  'ATTENDANCE','EXAMS','FEES','TRANSPORT',
  'HOSTEL','LIBRARY','PAYROLL',
  'ONLINE_FEES','PARENT_PORTAL','SMS_ALERTS','WHATSAPP_ALERTS',
]);

// ── Sub-schemas (all with _id: false to keep documents lean) ───────────────
const addressSchema = new mongoose.Schema(
  {
    // PDF: {street, city, state, country, pincode}
    line1:   { type: String, trim: true, default: null },
    line2:   { type: String, trim: true, default: null },
    city:    { type: String, trim: true, default: null },
    state:   { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: 'India' },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{4,10}$/, 'Provide a valid pincode'],
      default: null,
    },
  },
  { _id: false }
);

// PDF: academicYear (String e.g. "2024-2025") — extended to object ✦
const academicYearSchema = new mongoose.Schema(
  {
    label:     { type: String, trim: true, default: null }, // "2024-2025"
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },
  },
  { _id: false }
);

// PDF: settings {gradingScale, workingDays, timezone, currency} — extended ✦
const settingsSchema = new mongoose.Schema(
  {
    gradingSystem: {
      type: String,
      enum: ['PERCENTAGE', 'GRADE', 'GPA'],
      default: 'PERCENTAGE',
    },
    workingDays: {
      type: [String],
      enum: ['MON','TUE','WED','THU','FRI','SAT','SUN'],
      default: ['MON','TUE','WED','THU','FRI'],
    },
    periodDurationMinutes: { type: Number, default: 45 },
    allowOnlineFees:       { type: Boolean, default: false },
    allowParentLogin:      { type: Boolean, default: true  },
    enableSMS:             { type: Boolean, default: false },
    enableWhatsApp:        { type: Boolean, default: false },
    enableEmailAlerts:     { type: Boolean, default: true  },
    attendanceType: {
      type: String,
      enum: ['DAILY', 'PERIOD_WISE'],
      default: 'DAILY',
    },
  },
  { _id: false }
);

// ── Main Schema ─────────────────────────────────────────────────────────────
const schoolSchema = new mongoose.Schema(
  {
    // PDF: name
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      minlength: [3, 'Min 3 characters'],
      maxlength: [150, 'Max 150 characters'],
      index: true,
    },

    // PDF: code — unique, e.g. SCH001
    code: {
      type: String,
      required: [true, 'School code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{3,10}$/, 'Code: 3-10 uppercase alphanumeric characters'],
    },

    // PDF: address {street, city, state, country, pincode}
    address: { type: addressSchema, default: () => ({}) },

    // PDF: logo
    logo: { type: String, default: null },

    // PDF: phone
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, 'Provide a valid phone number'],
    },

    // PDF: email
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Provide a valid email'],
    },

    // PDF: website
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Website must start with http:// or https://'],
      default: null,
    },

    // PDF: principalId — Reference → User (admin role)
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      default: null,
    },

    // ✦ Additional school info
    establishedYear: {
      type: Number,
      min: [1800, 'Invalid year'],
      max: [new Date().getFullYear(), 'Cannot be in the future'],
      default: null,
    },

    boardType: {
      type: String,
      enum: { values: BOARD_TYPES, message: '"{VALUE}" is not a valid board type' },
      default: null,
    },

    // PDF: academicYear (String) — promoted to sub-schema ✦
    academicYear: { type: academicYearSchema, default: () => ({}) },

    // PDF: plan — enum: free | basic | pro | enterprise
    // (mapped to FREE | STARTER | PRO | ENTERPRISE to match your original model)
    plan: {
      type: String,
      enum: { values: SUBSCRIPTION_PLANS, message: '"{VALUE}" is not a valid plan' },
      default: 'FREE',
    },

    // PDF: planExpiry
    planExpiry: { type: Date, default: null },

    // ✦ Extended subscription tracking
    subscriptionStartDate: { type: Date, default: null },
    paymentStatus: {
      type: String,
      enum: { values: ['PAID','UNPAID','TRIAL','EXPIRED','CANCELLED'], message: 'Invalid payment status' },
      default: 'TRIAL',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    maxStudents: { type: Number, default: 100, min: [1, 'Must be at least 1'] },
    maxTeachers: { type: Number, default: 20,  min: [1, 'Must be at least 1'] },

    // ✦ Enabled feature flags per school
    features: {
      type: [String],
      enum: { values: FEATURES, message: '"{VALUE}" is not a valid feature' },
      default: ['ATTENDANCE', 'EXAMS', 'FEES'],
    },

    // PDF: settings {gradingScale, workingDays, timezone, currency}
    settings: { type: settingsSchema, default: () => ({}) },

    // PDF: timezone / currency kept at top level (also in settings)
    timezone: { type: String, trim: true, default: 'Asia/Kolkata' },
    currency: { type: String, trim: true, uppercase: true, minlength: 3, maxlength: 3, default: 'INR' },

    // PDF: isActive — extended to status enum ✦
    status: {
      type: String,
      enum: { values: ['ACTIVE','INACTIVE','BLOCKED'], message: '"{VALUE}" is invalid' },
      default: 'ACTIVE',
      index: true,
    },

    // Soft delete ✦
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', default: null },
  },
  {
    timestamps: true, // PDF: createdAt
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ────────────────────────────────────────────────────────────────
schoolSchema.virtual('isSubscriptionActive').get(function () {
  return this.planExpiry ? new Date() < new Date(this.planExpiry) : false;
});
schoolSchema.virtual('isTrialActive').get(function () {
  return this.paymentStatus === 'TRIAL' && this.trialEndsAt
    ? new Date() < new Date(this.trialEndsAt)
    : false;
});
schoolSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

// ── Indexes ─────────────────────────────────────────────────────────────────
schoolSchema.index({ name: 'text' });
schoolSchema.index({ status: 1, plan: 1 });
schoolSchema.index({ planExpiry: 1 }, { sparse: true });
schoolSchema.index({ deletedAt: 1 }, { sparse: true });

// ── Validation: academicYear endDate must follow startDate ──────────────────
schoolSchema.pre('save', function (next) {
  const ay = this.academicYear;
  if (ay?.startDate && ay?.endDate && ay.endDate <= ay.startDate) {
    return next(new Error('academicYear.endDate must be after startDate'));
  }
  next();
});

// ── Pre-find: exclude soft-deleted by default ───────────────────────────────
schoolSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) this.where({ deletedAt: null });
  next();
});

const School = mongoose.model('SCHOOL', schoolSchema);
module.exports = { School, BOARD_TYPES, SUBSCRIPTION_PLANS, FEATURES };
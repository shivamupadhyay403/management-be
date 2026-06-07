const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);
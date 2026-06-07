const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    relation: {
      type: String,
      enum: ["father", "mother", "guardian"],
      required: true,
    },

    occupation: String,

    phone: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Parent", parentSchema);
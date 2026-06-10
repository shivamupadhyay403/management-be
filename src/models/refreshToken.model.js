// models/refreshToken.model.js
//
// Storing refresh tokens in the DB lets you:
//   • Revoke a single device's session (logout from one device)
//   • Revoke ALL sessions on password change
//   • Detect refresh token reuse (rotation theft detection)

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    // The jti claim inside the JWT — used to look up + revoke individual tokens
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Soft revocation — set to true on logout / password change / token reuse
    revoked: {
      type: Boolean,
      default: false,
    },

    // Optional: track which device/browser issued this token
    userAgent: { type: String },
    ipAddress: { type: String },

    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: document auto-deleted after expiry
      // This keeps the collection lean without a cron job
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

// ─── Statics ──────────────────────────────────────────────────────────────────

/** Revoke a single token by jti */
refreshTokenSchema.statics.revokeOne = function (jti) {
  return this.findOneAndUpdate({ jti }, { revoked: true });
};

/** Revoke ALL tokens for a user (password change, security breach) */
refreshTokenSchema.statics.revokeAll = function (userId) {
  return this.updateMany({ userId, revoked: false }, { revoked: true });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
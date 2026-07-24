const crypto = require('crypto');
const ms = require('ms'); // already a sub-dep of express; or: npm i ms
const School = require('../models/school.model');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const Subscription = require('../models/subscription.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const AppError = require('../utils/AppError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { REFRESH_EXPIRY } = require('../config/env');
/** Build the access-token payload (keep it lean — no sensitive fields) */
const buildTokenPayload = (user) => ({
  userId: user._id,
  schoolId: user.schoolId?._id ?? user.schoolId ?? null,
  role: user.role,
});
const issueTokenPair = async (user, meta = {},remember_me) => {
  // jti: a random unique ID that ties the DB row to the JWT
  const jti = crypto.randomBytes(32).toString('hex');
  const accessToken = generateAccessToken(buildTokenPayload(user));
  const refreshToken = generateRefreshToken(user._id, jti,remember_me);
  // Persist refresh token to DB (enables revocation)
  await RefreshToken.create({
    jti,
    userId: user._id,
    expiresAt: new Date(Date.now() + ms(REFRESH_EXPIRY)),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  // expiresAt in seconds (Unix) — sent to frontend to track when to refresh
  const expiresAt = Math.floor(Date.now() / 1000) + ms('15m') / 1000;

  return { accessToken, refreshToken, expiresAt };
};

exports.registerSchool = async (payload) => {
  const { schoolName, schoolEmail, schoolCode, adminName, adminEmail, password } = payload;

  const schoolExists = await School.findOne({ code: schoolCode });
  if (schoolExists) {
    throw new AppError('School code already exists');
  }

  const userExists = await User.findOne({ email: adminEmail });
  if (userExists) {
    throw new AppError('Admin Email already exists');
  }

  const schoolEmailExists = await School.findOne({ email: schoolEmail });
  if (schoolEmailExists) {
    throw new AppError('School Email already exists');
  }

  const school = await School.create({
    name: schoolName,
    code: schoolCode,
    email: schoolEmail,
  });

  const hashedPassword = await hashPassword(password);

  const admin = await User.create({
    schoolId: school._id,
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'school_admin',
  });

  await Subscription.create({
    schoolId: school._id,
    plan: 'free',
    status: 'active',
  });

  return {
    school,
    admin: {
      schoolId: admin.schoolId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};
exports.login = async (payload, meta = {}) => {
  const { email, password,remember_me } = payload;

  const user = await User.findOne({ email }).select('+password').populate('schoolId');

  if (!user) throw new AppError('Invalid email or password', 401);

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new AppError('Invalid email or password', 401);
  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user, meta,remember_me);
  return {
    accessToken,
    refreshToken,
    expiresAt, // Unix seconds — frontend uses this to schedule refresh
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?._id ?? null,
    },
  };
};

exports.refresh = async (incomingRefreshToken, meta = {}) => {
  if (!incomingRefreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  // 1. Verify the JWT signature + expiry
  const decoded = verifyRefreshToken(incomingRefreshToken); // throws on invalid/expired

  // 2. Look up the token in DB — check it exists and isn't revoked
  const storedToken = await RefreshToken.findOne({ jti: decoded.jti });

  if (!storedToken || storedToken.revoked) {
    // Possible token reuse attack — revoke ALL tokens for this user
    if (storedToken?.userId) {
      await RefreshToken.revokeAll(storedToken.userId);
    }
    throw new AppError('Refresh token revoked or reused', 401);
  }

  // 3. Load the user
  const user = await User.findById(decoded.userId).populate('schoolId');
  if (!user) throw new AppError('User not found', 401);

  // 4. Rotate: revoke the old token, issue a new pair
  await RefreshToken.revokeOne(decoded.jti);
  const {
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  } = await issueTokenPair(user, meta);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?._id ?? null,
    },
  };
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await comparePassword(oldPassword, user.password);

  if (!isMatch) {
    throw new AppError('Old password is incorrect', 400);
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  return true;
};

exports.logout = async (incomingRefreshToken, logoutAll = false) => {
  if (!incomingRefreshToken) return; // already logged out

  try {
    const decoded = verifyRefreshToken(incomingRefreshToken);

    if (logoutAll) {
      await RefreshToken.revokeAll(decoded.userId);
    } else {
      await RefreshToken.revokeOne(decoded.jti);
    }
  } catch {
    // Token already invalid — nothing to revoke, silently succeed
  }
};

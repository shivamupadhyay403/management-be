const jwt  = require("jsonwebtoken");
const User = require("../models/userSchema");

const validateUserToken = async (req, res, next) => {
  try {
    // ── 1. Check header exists ──────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header not provided" });
    }

    // ── 2. Must be "Bearer <token>" ─────────────────────────────────────────
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({ success: false, message: "Invalid authorization format. Use: Bearer <token>" });
    }

    const token = parts[1];

    // ── 3. Verify token ─────────────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 4. Check user still exists in DB ────────────────────────────────────
    // Catches: deleted accounts still holding a valid token
    const user = await User.findById(decoded.id ?? decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    // ── 5. Attach full user to request ──────────────────────────────────────
    // Your controllers use req.user._id and req.user.id — both now work
    req.user = user;

    next();

  } catch (err) {
    // ── 6. Specific JWT error messages ──────────────────────────────────────
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired, please log in again" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (err.name === "NotBeforeError") {
      return res.status(401).json({ success: false, message: "Token not yet active" });
    }

    // Unexpected error (e.g. DB down)
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

module.exports = validateUserToken;
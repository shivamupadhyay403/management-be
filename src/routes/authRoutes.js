const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── Public routes ──────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// ── Protected routes (require valid access token) ──────────────────────────

// POST /api/auth/logout
router.post('/logout', protect, authController.logout);

// GET /api/auth/me
router.get('/me', protect, authController.getMe);

// ── Role-protected example routes ──────────────────────────────────────────

// GET /api/auth/admin-only  (only admin)
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: `Welcome Admin ${req.user.fullName}` });
});

// GET /api/auth/staff-only  (admin or teacher)
router.get('/staff-only', protect, authorize('admin', 'teacher'), (req, res) => {
  res.json({ success: true, message: `Welcome ${req.user.role} ${req.user.fullName}` });
});

module.exports = router;
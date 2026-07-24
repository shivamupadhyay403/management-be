const express = require('express')
const router=express.Router()

const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const controller = require('../controllers/auth.controller');

const {
  registerSchoolSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validations/auth.validation');
const { loginLimiter, registerLimiter, refreshLimiter, changePasswordLimiter,logoutLimiter } = require('../middlewares/rateLimit.middleware');

// ─── Public ───────────────────────────────────────────────────────────────────

router.post('/register-school',registerLimiter, validate(registerSchoolSchema), controller.registerSchool);

router.post('/login',loginLimiter, validate(loginSchema), controller.login);

// Reads httpOnly edu_excel_ref_token cookie — no auth middleware, no body validation
router.post('/refresh', refreshLimiter,controller.refresh);

// Reads httpOnly edu_excel_ref_token cookie — pass ?all=true to logout every device
router.post('/logout',logoutLimiter, controller.logout);

// ─── Protected ────────────────────────────────────────────────────────────────

router.get('/me', auth, controller.me);

router.patch('/change-password',changePasswordLimiter, auth, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
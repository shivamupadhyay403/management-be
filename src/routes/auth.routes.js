const router = require('express').Router();

const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const controller = require('../controllers/auth.controller');

const {
  registerSchoolSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validations/auth.validation');

// ─── Public ───────────────────────────────────────────────────────────────────

router.post('/register-school', validate(registerSchoolSchema), controller.registerSchool);

router.post('/login', validate(loginSchema), controller.login);

// Reads httpOnly edu_excel_ref_token cookie — no auth middleware, no body validation
router.post('/refresh', controller.refresh);

// Reads httpOnly edu_excel_ref_token cookie — pass ?all=true to logout every device
router.post('/logout', controller.logout);

// ─── Protected ────────────────────────────────────────────────────────────────

router.get('/me', auth, controller.me);

router.patch('/change-password', auth, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
const router = require('express').Router();

const auth = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate.middleware');

const controller = require('../controllers/auth.controller');

const {
  registerSchoolSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validations/auth.validation');

router.post('/register-school', validate(registerSchoolSchema), controller.registerSchool);

router.post('/login', validate(loginSchema), controller.login);

router.post('/refresh-token', controller.refreshToken);

router.post('/logout', auth, controller.logout);

router.get('/me', auth, controller.me);

router.patch('/change-password', auth, validate(changePasswordSchema), controller.changePassword);

module.exports = router;

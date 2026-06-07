const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth.middleware');

const tenant = require('../middlewares/tenant.middleware');

const validate = require('../middlewares/validate.middleware');

const { updateSchoolSchema } = require('../validations/school.validation');

const controller = require('../controllers/school.controller');

router.get('/me', auth, tenant, controller.getProfile);

router.patch('/me', auth, tenant, validate(updateSchoolSchema), controller.updateSchool);

router.get('/stats', auth, tenant, controller.getStats);

module.exports = router;

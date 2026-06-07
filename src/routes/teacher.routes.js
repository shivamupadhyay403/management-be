const router = require('express').Router();

const auth = require('../middlewares/auth.middleware');

const tenant = require('../middlewares/tenant.middleware');

const validate = require('../middlewares/validate.middleware');

const controller = require('../controllers/teacher.controller');

const { createTeacherSchema, updateTeacherSchema } = require('../validations/teacher.validation');

router.post('/add', auth, tenant, validate(createTeacherSchema), controller.createTeacher);

router.get('/get', auth, tenant, controller.getTeachers);

router.get('/find-by-id/:id', auth, tenant, controller.getTeacher);

router.patch('/update/:id', auth, tenant, validate(updateTeacherSchema), controller.updateTeacher);

router.delete('/delete/:id', auth, tenant, controller.deleteTeacher);

module.exports = router;

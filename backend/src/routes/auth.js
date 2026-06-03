const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordUpdate } = require('../middleware/validate');
const { body } = require('express-validator');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.patch('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  ...validatePasswordUpdate,
], updatePassword);

module.exports = router;

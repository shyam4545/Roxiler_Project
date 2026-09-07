const express = require('express');
const router = express.Router();

const { register, login, changePassword, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, changePasswordSchema } = require('../validators/schemas');

// Public
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;

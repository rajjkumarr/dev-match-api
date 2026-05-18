const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { signupValidator, loginValidator } = require('../validators/auth.validator');

// POST /api/v1/auth/signup
router.post('/signup', signupValidator, authController.signup);

// POST /api/v1/auth/login
router.post('/login', loginValidator, authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout  (protected)
router.post('/logout', protect, authController.logout);

// GET  /api/v1/auth/me      (protected)
router.get('/me', protect, authController.getMe);

module.exports = router;

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// GET /api/v1/users/:userId/status
router.get('/:userId/status', protect, userController.getUserStatus);

module.exports = router;

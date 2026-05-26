const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// GET /api/v1/chat/:targetUserId
router.get('/:targetUserId', protect, chatController.getChat);

module.exports = router;

const mongoose = require('mongoose');
const chatService = require('../services/chat.service');
const { sendSuccess, sendError } = require('../utils/response');

const getChat = async (req, res) => {
  const userId = req.user._id;
  const targetUserId = req.params.targetUserId?.replace(/[^a-fA-F0-9]/g, '');
  console.log(userId, targetUserId,"getChat called") // Debug log;

  if (!targetUserId) {
    return sendError(res, 400, 'targetUserId is required');
  }

  if (!mongoose.isValidObjectId(targetUserId)) {
    return sendError(res, 400, `Invalid targetUserId: "${targetUserId}" (length: ${targetUserId.length})`);
  }

  try {
    const data = await chatService.getChat(userId, targetUserId);
    return sendSuccess(res, 200, 'Chat fetched', data);
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

module.exports = { getChat };

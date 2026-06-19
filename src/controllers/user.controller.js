const mongoose = require('mongoose');
const statusService = require('../services/status.service');
const { sendSuccess, sendError } = require('../utils/response');

const getUserStatus = async (req, res) => {
  const targetUserId = req.params.userId?.replace(/[^a-fA-F0-9]/g, '');

  if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
    return sendError(res, 400, 'Invalid userId');
  }

  try {
    const status = await statusService.getStatus(targetUserId);
    return sendSuccess(res, 200, 'User status fetched', status);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { getUserStatus };

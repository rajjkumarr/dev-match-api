const connectionService = require('../services/connection.service');
const { sendSuccess, sendError } = require('../utils/response');

const ALLOWED_SEND_STATUSES = ['interested', 'ignored'];

const sendRequest = async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, status } = req.body;

  if (!receiverId) {
    return sendError(res, 400, 'receiverId is required');
  }

  if (!status || !ALLOWED_SEND_STATUSES.includes(status)) {
    return sendError(res, 400, `status must be one of: ${ALLOWED_SEND_STATUSES.join(', ')}`);
  }

  try {
    const request = await connectionService.sendRequest(senderId, receiverId, status);
    return sendSuccess(res, 201, 'Connection request sent', { request });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const getFeed = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  try {
    const result = await connectionService.getFeed(userId, page, limit);
    return sendSuccess(res, 200, 'Feed fetched successfully', result);
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const requests = await connectionService.getIncomingRequests(req.user._id);
    return sendSuccess(res, 200, 'Incoming requests fetched', { requests });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const reviewRequest = async (req, res) => {
  const senderId = req.params.senderId;
  const receiverId = req.user._id; // logged-in user from JWT
  const { status } = req.body;

  const ALLOWED = ['accepted', 'rejected'];
  if (!status || !ALLOWED.includes(status)) {
    return sendError(res, 400, `status must be one of: ${ALLOWED.join(', ')}`);
  }

  try {
    const request = await connectionService.reviewRequest(senderId, receiverId, status);
    return sendSuccess(res, 200, `Request ${status}`, { request });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const getMyConnections = async (req, res) => {
  try {
    const contacts = await connectionService.getMyConnections(req.user._id);
    return sendSuccess(res, 200, 'Connections fetched', { contacts });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

module.exports = { sendRequest, getFeed, getIncomingRequests, reviewRequest, getMyConnections };

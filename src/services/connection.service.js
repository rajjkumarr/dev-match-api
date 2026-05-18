const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user.model');

const sendRequest = async (senderId, receiverId, status) => {
  if (senderId.toString() === receiverId.toString()) {
    const error = new Error('You cannot send a connection request to yourself');
    error.statusCode = 400;
    throw error;
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.isActive) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = await ConnectionRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existing) {
    const error = new Error('A connection request already exists between these users');
    error.statusCode = 409;
    throw error;
  }

  const request = await ConnectionRequest.create({
    sender: senderId,
    receiver: receiverId,
    status,
  });

  return request;
};

const getFeed = async (userId, page = 1, limit = 10) => {
  // Find all requests where logged-in user is involved (either side)
  const existingRequests = await ConnectionRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).select('sender receiver');

  // Collect every user ID already interacted with
  const excludeIds = new Set([userId.toString()]);
  existingRequests.forEach((req) => {
    excludeIds.add(req.sender.toString());
    excludeIds.add(req.receiver.toString());
  });

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ _id: { $nin: [...excludeIds] }, isActive: true })
      .select('name email bio skills avatar createdAt')
      .skip(skip)
      .limit(limit),
    User.countDocuments({ _id: { $nin: [...excludeIds] }, isActive: true }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getIncomingRequests = async (userId) => {
  const requests = await ConnectionRequest.find({
    receiver: userId,
    status: 'interested',
  })
    .populate('sender', 'name email bio skills avatar')
    .sort({ createdAt: -1 });

  return requests;
};

const reviewRequest = async (senderId, receiverId, status) => {
  const request = await ConnectionRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: 'interested',
  });

  if (!request) {
    const error = new Error('No pending connection request found from this user');
    error.statusCode = 404;
    throw error;
  }

  request.status = status;
  await request.save();

  return request;
};

const getMyConnections = async (userId) => {
  const connections = await ConnectionRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'accepted',
  })
    .populate('sender', 'name email bio skills avatar')
    .populate('receiver', 'name email bio skills avatar')
    .sort({ updatedAt: -1 });

  // Return the other user's details (not the logged-in user)
  const contacts = connections.map((conn) => {
    const isSender = conn.sender._id.toString() === userId.toString();
    return {
      connectionId: conn._id,
      user: isSender ? conn.receiver : conn.sender,
      connectedAt: conn.updatedAt,
    };
  });

  return contacts;
};

module.exports = { sendRequest, getFeed, getIncomingRequests, reviewRequest, getMyConnections };

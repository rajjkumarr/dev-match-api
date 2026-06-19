const { redis, keys } = require('../config/redis');
const User = require('../models/user.model');
const ConnectionRequest = require('../models/connectionRequest');

const setOnline = async (userId, socketId) => {
  await redis.set(keys.online(userId), '1', 'EX', 300);
  await redis.set(keys.socket(userId), socketId);
};

const setOffline = async (userId) => {
  await redis.del(keys.online(userId));
  await redis.del(keys.socket(userId));
  await User.findByIdAndUpdate(userId, { lastSeenAt: new Date() });
};

const refreshHeartbeat = async (userId) => {
  await redis.expire(keys.online(userId), 300);
};

const getStatus = async (userId) => {
  const isOnline = await redis.exists(keys.online(userId));
  if (isOnline) return { isOnline: true, lastSeenAt: null };

  const user = await User.findById(userId).select('lastSeenAt');
  return { isOnline: false, lastSeenAt: user?.lastSeenAt || null };
};

// Returns socketIds of all accepted connections that are currently online
const getOnlineContactSocketIds = async (userId) => {
  const connections = await ConnectionRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'accepted',
  }).select('sender receiver');

  const contactIds = connections.map((c) =>
    c.sender.toString() === userId.toString()
      ? c.receiver.toString()
      : c.sender.toString()
  );

  const socketIds = await Promise.all(
    contactIds.map((id) => redis.get(keys.socket(id)))
  );

  return socketIds.filter(Boolean);
};

module.exports = { setOnline, setOffline, refreshHeartbeat, getStatus, getOnlineContactSocketIds };

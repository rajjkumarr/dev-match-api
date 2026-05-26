const mongoose = require('mongoose');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

// Find existing direct conversation or create a new one
const getOrCreateDirectConversation = async (userAId, userBId) => {
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userAId, userBId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [userAId, userBId],
    });
  }

  return conversation;
};

const saveMessage = async ({ conversationId, senderId, content, type = 'text' }) => {
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    type,
    readBy: [senderId],
  });

  // Keep conversation's lastMessage pointer up to date
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: message.createdAt,
  });

  return message;
};

const getChat = async (userId, targetUserId) => {
  const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

  const conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userId, targetObjectId], $size: 2 },
  }).populate('participants', 'name avatar');

  if (!conversation) {
    return { conversation: null, messages: [] };
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', '_id name avatar')
    .sort({ createdAt: 1 });

  return { conversation, messages };
};

module.exports = { getOrCreateDirectConversation, saveMessage, getChat };

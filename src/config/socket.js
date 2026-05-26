const { Server } = require('socket.io');
const { getOrCreateDirectConversation, saveMessage } = require('../services/chat.service');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // payload: { userId, currentUserId }
    // Creates or fetches direct conversation and joins its room
    socket.on('joinChat', async ({ userId, currentUserId }) => {
      try {
        const conversation = await getOrCreateDirectConversation(userId, currentUserId);
        const roomId = conversation._id.toString();
        socket.join(roomId);
        socket.emit('chatJoined', { conversationId: roomId });
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // payload: { senderId, receiverId, content }
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        const conversation = await getOrCreateDirectConversation(senderId, receiverId);
        const roomId = conversation._id.toString();

        const message = await saveMessage({
          conversationId: conversation._id,
          senderId,
          content,
        });

        io.to(roomId).emit('messageReceived', {
          _id: message._id,
          conversationId: roomId,
          senderId,
          content,
          timestamp: message.createdAt,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };

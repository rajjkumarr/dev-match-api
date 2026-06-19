const { Server } = require('socket.io');
const { getOrCreateDirectConversation, saveMessage } = require('../services/chat.service');
const { setOnline, setOffline, refreshHeartbeat, getOnlineContactSocketIds } = require('../services/status.service');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`Socket connected: ${socket.id} | user: ${userId}`);
    console.log(userId,socket.id,socket.handshake.query);

    if (userId) {
      await setOnline(userId, socket.id);

      // notify all online contacts that this user is now online
      const contactSocketIds = await getOnlineContactSocketIds(userId);
      contactSocketIds.forEach((socketId) => {
        io.to(socketId).emit('userStatus', { userId, isOnline: true });
      });
    }

    // frontend emits this every 60s to keep the Redis TTL alive
    socket.on('heartbeat', async () => {
      if (userId) await refreshHeartbeat(userId);
    });

    // payload: { userId, currentUserId }
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

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id} | user: ${userId}`);
      if (userId) {
        await setOffline(userId);

        // notify all online contacts that this user is now offline
        const contactSocketIds = await getOnlineContactSocketIds(userId);
        contactSocketIds.forEach((socketId) => {
          io.to(socketId).emit('userStatus', { userId, isOnline: false });
        });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };

const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join personal room
    socket.join(socket.userId);

    // Join a chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const isParticipant = chat.participants.some(
          (p) => p.toString() === socket.userId
        );
        if (!isParticipant) return;

        const message = {
          sender: socket.userId,
          content,
          readBy: [socket.userId],
        };

        chat.messages.push(message);
        chat.lastMessage = {
          content,
          sender: socket.userId,
          createdAt: new Date(),
        };

        await chat.save();

        const savedMsg = chat.messages[chat.messages.length - 1];

        // Emit to all participants in the chat room
        io.to(`chat_${chatId}`).emit('new-message', {
          chatId,
          message: savedMsg,
        });

        // Notify other participants not in the room
        chat.participants.forEach((participantId) => {
          if (participantId.toString() !== socket.userId) {
            io.to(participantId.toString()).emit('message-notification', {
              chatId,
              message: savedMsg,
            });
          }
        });
      } catch (error) {
        console.error('Socket message error:', error.message);
      }
    });

    // Typing indicator
    socket.on('typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user-typing', {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on('stop-typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user-stop-typing', {
        chatId,
        userId: socket.userId,
      });
    });

    // Mark messages as read
    socket.on('mark-read', async (chatId) => {
      try {
        await Chat.updateOne(
          { _id: chatId },
          {
            $addToSet: { 'messages.$[].readBy': socket.userId },
          }
        );
      } catch (error) {
        console.error('Mark read error:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;

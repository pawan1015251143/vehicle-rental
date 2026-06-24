const Chat = require('../models/Chat');

// @desc    Get or create chat between two users
// @route   POST /api/chats
exports.getOrCreateChat = async (req, res, next) => {
  try {
    const { participantId, bookingId } = req.body;

    if (participantId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot chat with yourself' });
    }

    // Check for existing chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      ...(bookingId && { booking: bookingId }),
    }).populate('participants', 'name avatar role');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        booking: bookingId,
        messages: [],
      });
      await chat.populate('participants', 'name avatar role');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my chats
// @route   GET /api/chats
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar role')
      .populate('booking', 'status totalAmount')
      .sort('-updatedAt');

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat messages
// @route   GET /api/chats/:chatId/messages
exports.getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      'messages.sender',
      'name avatar'
    );

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: 'Chat not found' });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (REST fallback, Socket.io preferred)
// @route   POST /api/chats/:chatId/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    const message = {
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      sender: req.user._id,
      createdAt: new Date(),
    };

    await chat.save();

    const savedMsg = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      success: true,
      message: savedMsg,
    });
  } catch (error) {
    next(error);
  }
};

const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getMyChats,
  getChatMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/', protect, getOrCreateChat);
router.get('/', protect, getMyChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/:chatId/messages', protect, sendMessage);

module.exports = router;

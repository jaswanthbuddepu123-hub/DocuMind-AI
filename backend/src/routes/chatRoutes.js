const express = require('express');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth); // Protect all chat routes

router.post('/', chatController.handleChat);
router.get('/:documentId', chatController.getChatHistory);

module.exports = router;

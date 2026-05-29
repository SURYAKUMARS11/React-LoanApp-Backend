// routers/chatRoutes.js
const express = require('express');
const router = express.Router();

// CHANGE THIS LINE:
const { handleChat } = require('../controllers/chatController.js');

router.post('/', handleChat);

module.exports = router;
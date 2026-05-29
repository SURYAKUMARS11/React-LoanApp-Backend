const express = require('express');
const router = express.Router();
const { addUser, getUserByEmailAndPassword, logoutUser } = require('../controllers/userController');

router.post('/signup', addUser);
router.post('/login', getUserByEmailAndPassword);
router.post('/logout', logoutUser);

module.exports = router;
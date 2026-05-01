const express = require('express');
const { signup, login, getMe, getUsers } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, adminMiddleware, getUsers);

module.exports = router;

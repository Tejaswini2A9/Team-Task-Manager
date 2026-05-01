const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, verifySignup, verifyLogin, resendOTP, getMe, getUsers } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' }
});

router.post('/signup', otpLimiter, signup);
router.post('/login', otpLimiter, login);
router.post('/verify-signup', verifySignup);
router.post('/verify-login', verifyLogin);
router.post('/resend-otp', otpLimiter, resendOTP);
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, adminMiddleware, getUsers);

module.exports = router;

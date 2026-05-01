const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ where: { email } });

    // If user exists and is already verified, block
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user && !user.isVerified) {
      // User exists but never verified — update their details and resend OTP
      user.name = name;
      user.password = hashedPassword;
      user.role = role || 'Member';
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      // New user — create fresh record
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'Member',
        otp,
        otpExpiry,
        isVerified: false,
      });
    }

    const message = `Your OTP for registration is: ${otp}. It is valid for 10 minutes.`;
    const emailResult = await sendEmail({
      email: user.email,
      subject: 'Registration OTP - Team Task Manager',
      message,
      otp, // used for console fallback if SMTP fails
    });

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    console.error('VerifySignup Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (role && user.role !== role) {
      return res.status(400).json({ message: `Access denied: You are not registered as an ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Auto-verify legacy users (created before OTP system) on first successful login
    if (!user.isVerified) {
      user.isVerified = true;
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const message = `Your OTP for login is: ${otp}. It is valid for 10 minutes.`;
    const emailResult = await sendEmail({
      email: user.email,
      subject: 'Login OTP - Team Task Manager',
      message,
      otp, // used for console fallback if SMTP fails
    });

    res.json({
      message: 'OTP sent to your email for login verification',
      email: user.email,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    console.error('VerifyLogin Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const message = `Your new OTP is: ${otp}. It is valid for 10 minutes.`;
    await sendEmail({ email: user.email, subject: 'Resend OTP - Team Task Manager', message, otp });

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('ResendOTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

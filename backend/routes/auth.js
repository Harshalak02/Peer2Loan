const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, verifyToken } = require('../controllers/authController');
const router = express.Router();

// ...existing code...
router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyToken);

// 1. Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google calls this back
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate Token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Redirect to Frontend with Token
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${encodeURIComponent(token)}`);
  }
);

module.exports = router;

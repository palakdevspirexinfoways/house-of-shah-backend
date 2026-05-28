const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route for login
router.post('/login', authController.login);

// Protected route to fetch current active session details
router.get('/me', protect, authController.getMe);

module.exports = router;

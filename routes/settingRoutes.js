const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints to retrieve system settings configuration
router.get('/', settingController.getSettings);

// Protected administrative config updates
router.put('/', protect, settingController.editSetting);

// Protected administrative factory database resets
router.post('/reset', protect, settingController.resetDatabase);

module.exports = router;

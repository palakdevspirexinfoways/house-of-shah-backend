const express = require('express');
const router = express.Router();
const slideController = require('../controllers/slideController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints to read hero slides
router.get('/', slideController.getSlides);
router.get('/:id', slideController.getSlide);

// Protected administrative CRUD actions
router.post('/', protect, slideController.addSlide);
router.put('/:id', protect, slideController.editSlide);
router.delete('/:id', protect, slideController.deleteSlide);

module.exports = router;

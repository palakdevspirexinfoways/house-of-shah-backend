const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints to read magazine/gallery items
router.get('/', galleryController.getGalleryItems);
router.get('/:id', galleryController.getGalleryItem);

// Protected administrative CRUD actions
router.post('/', protect, galleryController.addGalleryItem);
router.put('/:id', protect, galleryController.editGalleryItem);
router.delete('/:id', protect, galleryController.deleteGalleryItem);

module.exports = router;

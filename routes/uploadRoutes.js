const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Storage engine configuration for local disk fallback
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage engine configuration for memory (Cloudinary streams)
const memoryStorage = multer.memoryStorage();

// File filter to accept images only
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
  }
};

// Check if Cloudinary configuration is active
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME_HERE' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'YOUR_API_KEY_HERE' &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Multer dynamically based on Cloudinary config state
const upload = multer({
  storage: isCloudinaryConfigured() ? memoryStorage : diskStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB (expanded for Cloudinary)
});

/**
 * @desc    Upload an image file securely (Handles Cloudinary and local disk fallback)
 * @route   POST /api/v1/upload
 * @access  Protected (Requires JWT Admin Token)
 */
router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
      }

      // 1. Upload to Cloudinary if configured
      if (isCloudinaryConfigured()) {
        console.log('[Upload Endpoint] Cloudinary config detected. Commencing memory stream upload...');
        try {
          const result = await uploadToCloudinary(req.file.buffer, 'house_of_shah');
          return res.status(200).json({
            success: true,
            message: 'Image uploaded to Cloudinary successfully',
            imageUrl: result.secure_url,
          });
        } catch (cloudinaryErr) {
          console.error('[Upload Endpoint Cloudinary Error]', cloudinaryErr.message);
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed: ' + cloudinaryErr.message });
        }
      }

      // 2. Fall back to local file storage if Cloudinary is not configured
      console.log('[Upload Endpoint] Cloudinary not configured or contains placeholder keys. Falling back to local disk storage...');
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to local disk successfully',
        imageUrl: fileUrl,
      });

    } catch (error) {
      console.error(`[Upload Endpoint General Error] ${error.message}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
});

module.exports = router;

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

// File filter to accept images and videos
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|gif|mp4|webm|avi|mov|mkv/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

// Check if Cloudinary configuration is active
const isCloudinaryConfigured = () => {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME_HERE' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'YOUR_API_KEY_HERE' &&
    process.env.CLOUDINARY_API_SECRET
  );
  console.log('[UploadRoutes] isCloudinaryConfigured evaluated:', isConfigured);
  console.log('[UploadRoutes] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('[UploadRoutes] CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '(set)' : '(not set)');
  console.log('[UploadRoutes] CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '(set)' : '(not set)');
  return isConfigured;
};

// Configure Multer to always use memory storage so buffer is available
const upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 99 * 1024 * 1024 }, // Max file size 99MB
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
        return res.status(400).json({ success: false, message: 'File size exceeds the 99MB limit.' });
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
      
      const fs = require('fs');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname);
      const filepath = path.join(__dirname, '../uploads', filename);
      
      fs.writeFileSync(filepath, req.file.buffer);

      const fileUrl = `/uploads/${filename}`;
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

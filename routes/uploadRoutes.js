const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

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

// Configure Multer to use disk storage
const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 99 * 1024 * 1024 }, // Max file size 99MB
});

/**
 * @desc    Upload an image file securely to local disk
 * @route   POST /api/v1/upload
 * @access  Protected (Requires JWT Admin Token)
 */
router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
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

      const fileUrl = `/uploads/${req.file.filename}`;
      const { formatImageUrl } = require('../utils/imageUrlFormatter');
      const absoluteUrl = formatImageUrl(fileUrl, req);
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to local disk successfully',
        imageUrl: absoluteUrl,
      });

    } catch (error) {
      console.error(`[Upload Endpoint General Error] ${error.message}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
});

module.exports = router;

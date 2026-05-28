const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// Storage engine configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique file name using fieldname, timestamp, and a random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // Max file size 3MB
});

/**
 * @desc    Upload an image file securely
 * @route   POST /api/v1/upload
 * @access  Protected (Requires JWT Admin Token)
 */
router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 3MB limit.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
      }

      // Build the live file URL dynamically (handles port 5000 as well as production domains)
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        imageUrl: fileUrl,
      });
    } catch (error) {
      console.error(`[Upload Endpoint Error] ${error.message}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
});

module.exports = router;

const Admin = require('../models/Admin');
const authService = require('../services/authService');

/**
 * @desc    Authenticate administrator and return JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check if administrator exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await authService.comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = authService.generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(`[Auth Controller Login Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get current authenticated administrator details
 * @route   GET /api/v1/auth/me
 * @access  Protected (Requires Token)
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware protect
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'Administrator details not found' });
    }

    return res.status(200).json({
      success: true,
      admin: req.user,
    });
  } catch (error) {
    console.error(`[Auth Controller getMe Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  login,
  getMe,
};

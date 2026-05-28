const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

/**
 * Helper to generate JWT token for a user
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new public client user
 * @route   POST /api/v1/users/register
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyName, contactNumber, interestedProduct, natureOfBusiness, additionalRemarks } = req.body;

    if (!name || !email || !password || !contactNumber || !interestedProduct || !natureOfBusiness) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory fields (Name, Email, Password, Contact Number, Interested Product, Nature of Business).' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      companyName,
      contactNumber,
      interestedProduct,
      natureOfBusiness,
      additionalRemarks,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`[User Register Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @desc    Authenticate public client user & return JWT token
 * @route   POST /api/v1/users/login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`[User Login Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @desc    Get list of all registered public users
 * @route   GET /api/v1/users
 * @access  Protected (Requires Administrator JWT Token)
 */
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(`[User Get List Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @desc    Update a registered user's profile details
 * @route   PUT /api/v1/users/:id
 * @access  Protected (Requires Administrator JWT Token)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, email, companyName, contactNumber, interestedProduct, natureOfBusiness, additionalRemarks, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;
    if (contactNumber) user.contactNumber = contactNumber;
    if (interestedProduct) user.interestedProduct = interestedProduct;
    if (natureOfBusiness) user.natureOfBusiness = natureOfBusiness;
    if (additionalRemarks !== undefined) user.additionalRemarks = additionalRemarks;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User registry details updated successfully',
      data: user,
    });
  } catch (error) {
    console.error(`[User Update Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @desc    Delete a registered user by ID
 * @route   DELETE /api/v1/users/:id
 * @access  Protected (Requires Administrator JWT Token)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User registry profile not found' });
    }
    return res.status(200).json({ success: true, message: 'User registry profile deleted successfully' });
  } catch (error) {
    console.error(`[User Delete Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * Helper to send OTP email or fallback to console log
 */
const sendOTPEmail = async (email, otp) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`\n======================================================`);
  console.log(`[OTP GENERATED] PASSWORD RECOVERY FOR: ${email}`);
  console.log(`OTP CODE: ${otp}`);
  console.log(`======================================================\n`);

  if (!host || !port || !user || !pass) {
    console.warn('[SMTP CONFIG WARNING] SMTP variables are not fully configured in your .env. The generated OTP code has been logged above.');
    return { success: true, loggedToConsole: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port === '465',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"House of Shah" <${user}>`,
      to: email,
      subject: 'House of Shah - Password Reset OTP',
      html: `
        <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #eaeaea; border-radius: 8px; color: #1a4173;">
          <h2 style="color: #1a4173; text-align: center; text-transform: uppercase; letter-spacing: 2px;">House of Shah</h2>
          <p style="font-size: 14px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.6;">We received a request to recover your account password. Please use the following 6-digit One-Time Password (OTP) to reset your password. This code is valid for 10 minutes:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; color: #1a4173; padding: 20px; background-color: #f7f9fc; border-radius: 6px; letter-spacing: 6px; margin: 30px 0; border: 1px dashed #1a4173;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; line-height: 1.6;">If you did not request this password recovery, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center; letter-spacing: 1px; uppercase">AUTHENTIC LUXURY STERLING SILVER</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, loggedToConsole: false };
  } catch (error) {
    console.error(`[SMTP SEND EMAIL ERROR] ${error.message}`);
    return { success: true, error: error.message, loggedToConsole: true };
  }
};

/**
 * @desc    Generate OTP & send email for password recovery
 * @route   POST /api/v1/users/forgot-password
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account does not exist' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 10 minutes from now
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email with OTP
    const emailResult = await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: 'Verification OTP has been sent successfully',
      debugOtp: process.env.NODE_ENV !== 'production' || emailResult.loggedToConsole ? otp : undefined,
    });
  } catch (error) {
    console.error(`[User Forgot Password Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @desc    Verify OTP & update user password
 * @route   POST /api/v1/users/reset-password
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields: Email, OTP, and New Password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account does not exist' });
    }

    // Check if OTP matches and is not expired
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check the code and try again.' });
    }

    if (!user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    // Generate JWT token so user logs in immediately
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Logging you in...',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`[User Reset Password Route Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;

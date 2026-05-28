const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Generate a JWT for a user ID
 * @param {string} id 
 * @returns {string}
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Hash a plain text password
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with hashed password
 * @param {string} enteredPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

/**
 * Automatically seeds the default administrator account if it does not exist.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log('[Seeding] No administrator account found. Initializing seed...');
      const hashedPassword = await hashPassword('admin123');
      
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`[Seeding] Administrator successfully created: ${adminEmail} / admin123`);
    } else {
      console.log(`[Seeding] Administrator verification complete. Active admin: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`[Seeding Error] Admin seeding failed: ${error.message}`);
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  seedAdmin,
};

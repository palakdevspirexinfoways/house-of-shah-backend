const Setting = require('../models/Setting');
const Slide = require('../models/Slide');
const Product = require('../models/Product');
const Gallery = require('../models/Gallery');

// Import other seeders for database reset
const slideService = require('./slideService');
const productService = require('./productService');
const galleryService = require('./galleryService');

/**
 * Get all settings as a flat object (key-value pair)
 * @returns {Promise<Object>}
 */
const getSettingsFlat = async () => {
  const settingsList = await Setting.find({});
  const settingsObj = {};
  settingsList.forEach((set) => {
    settingsObj[set.key] = set.value;
  });
  return settingsObj;
};

/**
 * Get the value of a specific setting key
 * @param {string} key 
 * @returns {Promise<any>}
 */
const getSettingValue = async (key) => {
  const setting = await Setting.findOne({ key });
  return setting ? setting.value : null;
};

/**
 * Updates or creates a setting
 * @param {string} key 
 * @param {any} value 
 * @returns {Promise<Object>}
 */
const updateSetting = async (key, value) => {
  return await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true, runValidators: true }
  );
};

/**
 * Seeds setting defaults if they don't exist
 */
const seedSettings = async () => {
  try {
    const key = 'popupEnabled';
    const exists = await Setting.findOne({ key });
    if (!exists) {
      console.log('[Seeding] popupEnabled setting not found. Seeding default true...');
      await Setting.create({ key, value: true });
    }
  } catch (error) {
    console.error(`[Seeding Error] Settings seeding failed: ${error.message}`);
  }
};

/**
 * Performs a factory reset:
 * - Wipes out all Hero Slides, Signature Products, and Digital Gallery items from MongoDB
 * - Runs the seeders again to repopulate the collections with default seeds
 * - Resets popupEnabled setting to true
 */
const resetDatabaseToSeeds = async () => {
  console.log('[Factory Reset] Initializing database wipe...');
  
  // Wipe
  await Slide.deleteMany({});
  await Product.deleteMany({});
  await Gallery.deleteMany({});
  
  console.log('[Factory Reset] Database wipe completed. Initializing reseeding...');
  
  // Seed content
  await slideService.seedSlides();
  await productService.seedProducts();
  await galleryService.seedGallery();
  
  // Seed/reset setting
  await updateSetting('popupEnabled', true);
  
  console.log('[Factory Reset] Database successfully reseeded to factory defaults.');
  return { success: true, message: 'Database successfully reseeded to factory defaults.' };
};

module.exports = {
  getSettingsFlat,
  getSettingValue,
  updateSetting,
  seedSettings,
  resetDatabaseToSeeds,
};

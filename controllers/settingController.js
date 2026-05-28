const settingService = require('../services/settingService');

/**
 * @desc    Get all global setting configurations
 * @route   GET /api/v1/settings
 * @access  Public
 */
const getSettings = async (req, res) => {
  try {
    const settings = await settingService.getSettingsFlat();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(`[Setting Controller getSettings Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update a global setting parameter
 * @route   PUT /api/v1/settings
 * @access  Protected
 */
const editSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (key === undefined || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value parameters are required' });
    }

    const setting = await settingService.updateSetting(key, value);
    return res.status(200).json({
      success: true,
      message: `Setting ${key} updated successfully`,
      data: { key: setting.key, value: setting.value },
    });
  } catch (error) {
    console.error(`[Setting Controller editSetting Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Perform a factory reset - wipe and re-seed Slides, Products, and Gallery data
 * @route   POST /api/v1/settings/reset
 * @access  Protected
 */
const resetDatabase = async (req, res) => {
  try {
    const result = await settingService.resetDatabaseToSeeds();
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(`[Setting Controller resetDatabase Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getSettings,
  editSetting,
  resetDatabase,
};

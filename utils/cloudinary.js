const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer memory storage
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<object>} Cloudinary upload response object
 */
const uploadToCloudinary = (fileBuffer, folder = 'house_of_shah') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extract public ID from a Cloudinary URL
 * Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567/house_of_shah/filename.jpg
 * Returns: house_of_shah/filename
 * @param {string} url - Cloudinary asset URL
 * @returns {string|null} public ID or null
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const rest = parts[1];
    const segments = rest.split('/');
    if (segments[0].match(/^v\d+$/)) {
      segments.shift(); // remove version segment
    }

    const publicIdWithExtension = segments.join('/');
    const dotIndex = publicIdWithExtension.lastIndexOf('.');
    if (dotIndex !== -1) {
      return publicIdWithExtension.substring(0, dotIndex);
    }
    return publicIdWithExtension;
  } catch (error) {
    console.error('[Cloudinary Public ID Extract Error]', error.message);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary by its public ID or URL
 * @param {string} target - Public ID or full Cloudinary URL
 * @returns {Promise<object>} Cloudinary delete result
 */
const deleteFromCloudinary = async (target) => {
  if (!target) return null;

  let publicId = target;
  if (target.includes('res.cloudinary.com')) {
    publicId = extractPublicIdFromUrl(target);
  }

  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary Clean Up] Asset ${publicId} deletion result:`, result);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Clean Up Error] Failed to delete asset: ${publicId}`, error.message);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl
};

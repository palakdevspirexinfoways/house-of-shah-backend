const fs = require('fs');
const path = require('path');
const { deleteFromCloudinary } = require('./cloudinary');

/**
 * Parses the image URL and unlinks the file from Backend/uploads locally
 * OR deletes the remote asset from Cloudinary dynamically.
 * @param {string} imageUrl - The URL of the image file
 */
const deleteLocalImage = async (imageUrl) => {
  if (!imageUrl) return;

  // 1. Check if it's a Cloudinary asset
  if (imageUrl.includes('res.cloudinary.com')) {
    try {
      await deleteFromCloudinary(imageUrl);
      console.log(`[File Clean Up] Successfully triggered Cloudinary deletion: ${imageUrl}`);
    } catch (err) {
      console.error(`[File Clean Up Error] Cloudinary deletion failed for: ${imageUrl}`, err.message);
    }
    return;
  }

  // 2. Check if it's a locally served file
  if (imageUrl.includes('/uploads/')) {
    const parts = imageUrl.split('/uploads/');
    if (parts.length > 1) {
      const filename = parts[1];
      const filePath = path.join(__dirname, '../uploads', filename);
      
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`[File Clean Up Error] Failed to delete local image: ${filePath}`, err.message);
        } else {
          console.log(`[File Clean Up] Successfully deleted local image: ${filePath}`);
        }
      });
    }
  }
};

module.exports = { deleteLocalImage };

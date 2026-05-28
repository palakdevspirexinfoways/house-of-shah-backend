const fs = require('fs');
const path = require('path');

/**
 * Parses the image URL and unlinks the local file from Backend/uploads if it exists.
 * @param {string} imageUrl - The URL of the image file
 */
const deleteLocalImage = (imageUrl) => {
  if (!imageUrl) return;

  // Check if it's a locally served file
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

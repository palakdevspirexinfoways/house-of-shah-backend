/**
 * Formats a database image path to be an absolute URL.
 * If the path is already an absolute URL (starts with http/https), it returns it as is.
 * Otherwise, it prepends the protocol and host from the current request.
 * 
 * @param {string} imagePath - The image path stored in the database
 * @param {object} req - Express request object
 * @returns {string} Absolute image URL
 */
const formatImageUrl = (imagePath, req) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const relativePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${req.protocol}://${req.get('host')}${relativePath}`;
};

module.exports = { formatImageUrl };

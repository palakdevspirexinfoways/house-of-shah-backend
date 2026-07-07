const galleryService = require('../services/galleryService');
const { deleteLocalImage } = require('../utils/fileCleaner');
const { formatImageUrl } = require('../utils/imageUrlFormatter');

/**
 * @desc    Get all gallery items
 * @route   GET /api/v1/gallery
 * @access  Public
 */
const getGalleryItems = async (req, res) => {
  try {
    const galleryItems = await galleryService.getAllGalleryItems();
    const formatted = galleryItems.map(item => {
      const obj = item.toJSON();
      obj.image = formatImageUrl(obj.image, req);
      return obj;
    });
    return res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error(`[Gallery Controller getGalleryItems Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get a single gallery item by ID
 * @route   GET /api/v1/gallery/:id
 * @access  Public
 */
const getGalleryItem = async (req, res) => {
  try {
    const item = await galleryService.getGalleryItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    const obj = item.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(200).json({ success: true, data: obj });
  } catch (error) {
    console.error(`[Gallery Controller getGalleryItem Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Create a new gallery item
 * @route   POST /api/v1/gallery
 * @access  Protected
 */
const addGalleryItem = async (req, res) => {
  try {
    const { title, category, image } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ success: false, message: 'Title, category issue, and image URL are required' });
    }

    const item = await galleryService.createGalleryItem(req.body);
    const obj = item.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(201).json({ success: true, message: 'Gallery item added successfully', data: obj });
  } catch (error) {
    console.error(`[Gallery Controller addGalleryItem Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update a gallery item by ID
 * @route   PUT /api/v1/gallery/:id
 * @access  Protected
 */
const editGalleryItem = async (req, res) => {
  try {
    const oldItem = await galleryService.getGalleryItemById(req.params.id);
    if (!oldItem) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    const { image } = req.body;
    if (image && oldItem.image && oldItem.image !== image) {
      deleteLocalImage(oldItem.image);
    }

    const item = await galleryService.updateGalleryItem(req.params.id, req.body);
    const obj = item.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(200).json({ success: true, message: 'Gallery details updated successfully', data: obj });
  } catch (error) {
    console.error(`[Gallery Controller editGalleryItem Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Delete a gallery item by ID
 * @route   DELETE /api/v1/gallery/:id
 * @access  Protected
 */
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await galleryService.deleteGalleryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // Clean up local file
    deleteLocalImage(item.image);

    return res.status(200).json({ success: true, message: 'Gallery item removed successfully' });
  } catch (error) {
    console.error(`[Gallery Controller deleteGalleryItem Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItem,
  addGalleryItem,
  editGalleryItem,
  deleteGalleryItem,
};

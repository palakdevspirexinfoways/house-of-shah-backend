const Gallery = require('../models/Gallery');

const getAllGalleryItems = async () => {
  return await Gallery.find({});
};

const getGalleryItemById = async (id) => {
  return await Gallery.findById(id);
};

const createGalleryItem = async (galleryData) => {
  return await Gallery.create(galleryData);
};

const updateGalleryItem = async (id, galleryData) => {
  return await Gallery.findByIdAndUpdate(id, galleryData, {
    new: true,
    runValidators: true,
  });
};

const deleteGalleryItem = async (id) => {
  return await Gallery.findByIdAndDelete(id);
};

/**
 * Seeds initial gallery items if none exist
 */
const seedGallery = async () => {
  try {
    const count = await Gallery.countDocuments({});
    if (count === 0) {
      console.log('[Seeding] No gallery items found. Seeding initial records...');
      const initialGallery = [];
      await Gallery.insertMany(initialGallery);
      console.log(`[Seeding] Seeding successful. Added ${initialGallery.length} gallery items.`);
    } else {
      console.log('[Seeding] Gallery collection has existing data. Skipping seed.');
    }
  } catch (error) {
    console.error(`[Seeding Error] Gallery seeding failed: ${error.message}`);
  }
};

module.exports = {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  seedGallery,
};

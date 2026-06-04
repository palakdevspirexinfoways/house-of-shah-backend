const Slide = require('../models/Slide');

const getAllSlides = async (query = {}) => {
  return await Slide.find(query);
};

const getSlideById = async (id) => {
  return await Slide.findById(id);
};

const createSlide = async (slideData) => {
  return await Slide.create(slideData);
};

const updateSlide = async (id, slideData) => {
  return await Slide.findByIdAndUpdate(id, slideData, {
    new: true,
    runValidators: true,
  });
};

const deleteSlide = async (id) => {
  return await Slide.findByIdAndDelete(id);
};

/**
 * Seeds initial hero slider records if none exist
 */
const seedSlides = async () => {
  try {
    const count = await Slide.countDocuments({});
    if (count === 0) {
      console.log('[Seeding] No hero slides found. Seeding initial templates...');
      const initialSlides = [];
      await Slide.insertMany(initialSlides);
      console.log(`[Seeding] Seeding successful. Added ${initialSlides.length} hero slides.`);
    } else {
      console.log('[Seeding] Hero slide collection has existing data. Skipping seed.');
    }
  } catch (error) {
    console.error(`[Seeding Error] Slides seeding failed: ${error.message}`);
  }
};

module.exports = {
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
  seedSlides,
};

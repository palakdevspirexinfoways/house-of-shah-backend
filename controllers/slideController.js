const slideService = require('../services/slideService');
const { deleteLocalImage } = require('../utils/fileCleaner');

/**
 * @desc    Get all hero slides
 * @route   GET /api/v1/slides
 * @access  Public
 */
const getSlides = async (req, res) => {
  try {
    const slides = await slideService.getAllSlides();
    return res.status(200).json({ success: true, count: slides.length, data: slides });
  } catch (error) {
    console.error(`[Slide Controller getSlides Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get a single hero slide by ID
 * @route   GET /api/v1/slides/:id
 * @access  Public
 */
const getSlide = async (req, res) => {
  try {
    const slide = await slideService.getSlideById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found' });
    }
    return res.status(200).json({ success: true, data: slide });
  } catch (error) {
    console.error(`[Slide Controller getSlide Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Create a new hero slide
 * @route   POST /api/v1/slides
 * @access  Protected
 */
const addSlide = async (req, res) => {
  try {
    const { title, image } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required' });
    }

    const slide = await slideService.createSlide(req.body);
    return res.status(201).json({ success: true, message: 'Hero slide added successfully', data: slide });
  } catch (error) {
    console.error(`[Slide Controller addSlide Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update a hero slide by ID
 * @route   PUT /api/v1/slides/:id
 * @access  Protected
 */
const editSlide = async (req, res) => {
  try {
    const oldSlide = await slideService.getSlideById(req.params.id);
    if (!oldSlide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found' });
    }

    const { image } = req.body;
    if (image && oldSlide.image && oldSlide.image !== image) {
      deleteLocalImage(oldSlide.image);
    }

    const slide = await slideService.updateSlide(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Hero slide updated successfully', data: slide });
  } catch (error) {
    console.error(`[Slide Controller editSlide Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Delete a hero slide by ID
 * @route   DELETE /api/v1/slides/:id
 * @access  Protected
 */
const deleteSlide = async (req, res) => {
  try {
    const slide = await slideService.deleteSlide(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found' });
    }

    // Clean up local file
    deleteLocalImage(slide.image);

    return res.status(200).json({ success: true, message: 'Hero slide removed successfully' });
  } catch (error) {
    console.error(`[Slide Controller deleteSlide Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getSlides,
  getSlide,
  addSlide,
  editSlide,
  deleteSlide,
};

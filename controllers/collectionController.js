const Collection = require('../models/Collection');
const { formatImageUrl } = require('../utils/imageUrlFormatter');


// @desc    Get all collections
// @route   GET /api/collections
// @access  Public
exports.getCollections = async (req, res) => {
  try {
    const { limit, sort } = req.query;
    
    let query = Collection.find();

    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by latest
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const collections = await query;
    const formatted = collections.map(col => {
      const obj = col.toJSON();
      obj.image = formatImageUrl(obj.image, req);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch collections',
      error: error.message,
    });
  }
};

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private
exports.createCollection = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and image for the collection',
      });
    }

    const collection = await Collection.create({ name, image });
    const obj = collection.toJSON();
    obj.image = formatImageUrl(obj.image, req);

    res.status(201).json({
      success: true,
      data: obj,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Collection with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not create collection',
      error: error.message,
    });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: `Collection not found with id of ${req.params.id}`,
      });
    }

    await collection.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not delete collection',
      error: error.message,
    });
  }
};

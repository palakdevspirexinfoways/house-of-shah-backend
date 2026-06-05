const Product = require('../models/Product');

const getAllProducts = async (query = {}) => {
  let filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { collection: searchRegex },
      { category: searchRegex }
    ];
  }

  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }

  if (query.collection && query.collection !== 'All') {
    filter.collection = query.collection;
  }

  const page = parseInt(query.page) || 1;
  const limit = query.limit ? parseInt(query.limit) : 0;
  
  const sortOptions = { order: 1, createdAt: -1 };

  if (limit === 0) {
    const products = await Product.find(filter).sort(sortOptions);
    return { products, totalCount: products.length, totalPages: 1, currentPage: 1 };
  }

  const skip = (page - 1) * limit;
  const products = await Product.find(filter).sort(sortOptions).skip(skip).limit(limit);
  const totalCount = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);

  return { products, totalCount, totalPages, currentPage: page };
};

const getProductsMetadata = async () => {
  const categories = await Product.distinct('category');
  const collections = await Product.distinct('collection');
  return { 
    categories: categories.filter(Boolean), 
    collections: collections.filter(Boolean) 
  };
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (productData) => {
  return await Product.create(productData);
};

const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

const reorderProducts = async (orderedIds) => {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } }
    }
  }));
  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }
};

/**
 * Seeds initial signature product records if none exist
 */
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments({});
    if (count === 0) {
      console.log('[Seeding] No products found. Seeding initial items...');
      const initialProducts = [];
      await Product.insertMany(initialProducts);
      console.log(`[Seeding] Seeding successful. Added ${initialProducts.length} products.`);
    } else {
      console.log('[Seeding] Product collection has existing data. Skipping seed.');
    }
  } catch (error) {
    console.error(`[Seeding Error] Products seeding failed: ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  getProductsMetadata,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  seedProducts,
};

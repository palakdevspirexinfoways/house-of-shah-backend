const Product = require('../models/Product');

const getAllProducts = async () => {
  return await Product.find({}).sort({ order: 1, createdAt: -1 });
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
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  seedProducts,
};

const productService = require('../services/productService');
const { deleteLocalImage } = require('../utils/fileCleaner');

/**
 * @desc    Get all signature products
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error(`[Product Controller getProducts Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product item not found' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(`[Product Controller getProduct Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Protected
 */
const addProduct = async (req, res) => {
  try {
    const { title, category, image } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ success: false, message: 'Title, category, and image URL are required' });
    }

    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, message: 'Product added successfully', data: product });
  } catch (error) {
    console.error(`[Product Controller addProduct Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update a product by ID
 * @route   PUT /api/v1/products/:id
 * @access  Protected
 */
const editProduct = async (req, res) => {
  try {
    const oldProduct = await productService.getProductById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ success: false, message: 'Product item not found' });
    }

    const { image } = req.body;
    if (image && oldProduct.image && oldProduct.image !== image) {
      deleteLocalImage(oldProduct.image);
    }

    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Product details updated successfully', data: product });
  } catch (error) {
    console.error(`[Product Controller editProduct Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/v1/products/:id
 * @access  Protected
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product item not found' });
    }

    // Clean up local file
    deleteLocalImage(product.image);

    return res.status(200).json({ success: true, message: 'Product item removed successfully' });
  } catch (error) {
    console.error(`[Product Controller deleteProduct Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Reorder products
 * @route   PUT /api/v1/products/reorder
 * @access  Protected
 */
const reorderProducts = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'Invalid orderedIds array' });
    }

    await productService.reorderProducts(orderedIds);
    return res.status(200).json({ success: true, message: 'Products reordered successfully' });
  } catch (error) {
    console.error(`[Product Controller reorderProducts Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  deleteProduct,
  reorderProducts,
};

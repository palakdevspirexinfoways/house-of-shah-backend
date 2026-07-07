const productService = require('../services/productService');
const { deleteLocalImage } = require('../utils/fileCleaner');
const { formatImageUrl } = require('../utils/imageUrlFormatter');

/**
 * @desc    Get all signature products
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    const formattedProducts = result.products.map(p => {
      const obj = p.toJSON();
      obj.image = formatImageUrl(obj.image, req);
      return obj;
    });

    return res.status(200).json({ 
      success: true, 
      count: formattedProducts.length, 
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: formattedProducts 
    });
  } catch (error) {
    console.error(`[Product Controller getProducts Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get product metadata (categories & collections)
 * @route   GET /api/v1/products/metadata
 * @access  Public
 */
const getProductsMetadata = async (req, res) => {
  try {
    const metadata = await productService.getProductsMetadata();
    return res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    console.error(`[Product Controller getProductsMetadata Error] ${error.message}`);
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
    const obj = product.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(200).json({ success: true, data: obj });
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
    const { title, category, image, collection } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required' });
    }
    if (!collection && !category) {
      return res.status(400).json({ success: false, message: 'Category is required if no collection is selected' });
    }

    const product = await productService.createProduct(req.body);
    const obj = product.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(201).json({ success: true, message: 'Product added successfully', data: obj });
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
    const obj = product.toJSON();
    obj.image = formatImageUrl(obj.image, req);
    return res.status(200).json({ success: true, message: 'Product details updated successfully', data: obj });
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
  getProductsMetadata,
  getProduct,
  addProduct,
  editProduct,
  deleteProduct,
  reorderProducts,
};

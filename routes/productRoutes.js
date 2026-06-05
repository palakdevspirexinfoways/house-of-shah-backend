const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints to read signature product collections
router.get('/', productController.getProducts);
router.get('/metadata', productController.getProductsMetadata);
router.get('/:id', productController.getProduct);

// Protected administrative CRUD actions
router.put('/reorder', protect, productController.reorderProducts);
router.post('/', protect, productController.addProduct);
router.put('/:id', protect, productController.editProduct);
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;

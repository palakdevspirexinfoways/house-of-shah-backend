const express = require('express');
const {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require('../controllers/collectionController');

const router = express.Router();
// Assuming we need protection for create/delete like other routes
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCollections)
  .post(protect, createCollection);

router.route('/:id')
  .put(protect, updateCollection)
  .delete(protect, deleteCollection);

module.exports = router;

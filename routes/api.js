const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const slideRoutes = require('./slideRoutes');
const productRoutes = require('./productRoutes');
const galleryRoutes = require('./galleryRoutes');
const settingRoutes = require('./settingRoutes');
const uploadRoutes = require('./uploadRoutes');
const userRoutes = require('./userRoutes');
const collectionRoutes = require('./collectionRoutes');

// Mount routes to API namespace
router.use('/auth', authRoutes);
router.use('/slides', slideRoutes);
router.use('/products', productRoutes);
router.use('/gallery', galleryRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/collections', collectionRoutes);

module.exports = router;

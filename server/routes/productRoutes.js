const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  getTopProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/v1/products
// @access  Public
router.route('/').get(getProducts);

// @desc    Fetch top products
// @route   GET /api/v1/products/top
// @access  Public
router.get('/top', getTopProducts);

// @desc    Fetch single product
// @route   GET /api/v1/products/:id
// @access  Public
router.route('/:id').get(getProductById);

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
router.route('/').post(protect, admin, createProduct);

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
router.route('/:id').put(protect, admin, updateProduct);

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
router.route('/:id').delete(protect, admin, deleteProduct);

// @desc    Create new review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
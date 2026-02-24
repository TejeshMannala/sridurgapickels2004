const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getDashboardSummary,
  getRevenueTrend,
  getUsers,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getSupportMessages
} = require('../controllers/adminController');
const { replyToFeedback } = require('../controllers/supportController');

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/revenue', getRevenueTrend);

router.get('/users', getUsers);

router.route('/products').get(getProducts).post(createProduct);
router.route('/products/:id').put(updateProduct).delete(deleteProduct);

router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/support', getSupportMessages);
router.put('/support/:id/reply', replyToFeedback);

module.exports = router;

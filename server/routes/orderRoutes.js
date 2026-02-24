const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrderById, updateOrderTracking } = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/tracking', admin, updateOrderTracking);

module.exports = router;

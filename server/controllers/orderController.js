const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

const parseCouponMap = () => {
  const fallback = { PICKLES10: 10, DEAL20: 20, WELCOME5: 5 };
  const raw = String(process.env.COUPON_CODES || '').trim();
  if (!raw) return fallback;

  const map = {};
  raw.split(',').forEach((token) => {
    const [code, percentText] = token.split(':').map((part) => String(part || '').trim());
    const percent = Number(percentText);
    if (!code || !Number.isFinite(percent) || percent <= 0 || percent > 90) return;
    map[code.toUpperCase()] = Math.round(percent);
  });

  return Object.keys(map).length ? map : fallback;
};

const COUPON_MAP = parseCouponMap();

const createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod, upiId, couponCode } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const orderItems = cart.items.map((item) => ({
      name: `${item.product.name} (${item.packSize})`,
      quantity: item.quantity,
      image: item.product.images?.[0]?.url || '',
      price: item.price,
      product: item.product._id
    }));

    const itemsPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    const shippingPrice = itemsPrice > 999 ? 0 : 60;
    const taxPrice = Math.round(itemsPrice * 0.05);

    const normalizedCoupon = String(couponCode || '').trim().toUpperCase();
    let discountPrice = 0;
    if (normalizedCoupon) {
      const percentage = COUPON_MAP[normalizedCoupon];
      if (!percentage) {
        return res.status(400).json({ success: false, message: 'Enter valid coupon code' });
      }
      discountPrice = Math.round((itemsPrice * percentage) / 100);
    }

    const totalPrice = Math.max(0, itemsPrice + shippingPrice + taxPrice - discountPrice);

    const upiRequiredMethods = ['upi', 'gpay', 'paytm', 'googlepay', 'amazonpay'];
    if (upiRequiredMethods.includes(paymentMethod) && !upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required for selected online payment' });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponCode: normalizedCoupon,
      paymentMethod,
      paymentInfo: { status: paymentMethod === 'cod' ? 'pending' : 'initiated', upiId: upiId || '' },
      orderStatus: 'Pending',
      trackingHistory: [{ status: 'Pending', note: 'Order confirmed and pending dispatch' }]
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: 'Order confirmed', data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (String(order.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateOrderTracking = async (req, res) => {
  try {
    const { status, note = '' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.orderStatus = status;
    order.trackingHistory.push({ status, note });
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderTracking };

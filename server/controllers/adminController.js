const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Feedback = require('../models/feedbackModel');

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return null;
  const valid = images.filter((image) => image && typeof image.url === 'string' && image.url.trim());
  if (!valid.length) return null;
  return valid.map((image) => ({
    public_id: image.public_id || 'manual',
    url: String(image.url).trim(),
  }));
};

const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const activeSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, totalProducts, activeProducts, totalOrders, supportCount, orders] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ lastLoginAt: { $gte: activeSince } }),
        Product.countDocuments({}),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments({}),
        Feedback.countDocuments({}),
        Order.find({ orderStatus: { $ne: 'Cancelled' } }).select('totalPrice')
      ]);

    const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const paymentBreakdown = { cod: 0, upi: 0, online: 0 };
    const orderStatusBreakdown = { pending: 0, shipped: 0, cancelled: 0, delivered: 0 };
    const allOrders = await Order.find({}).select('paymentMethod');
    const allOrdersWithStatus = await Order.find({}).select('paymentMethod orderStatus');
    allOrdersWithStatus.forEach((order) => {
      if (order.paymentMethod === 'cod') paymentBreakdown.cod += 1;
      else if (['upi', 'gpay', 'paytm', 'googlepay', 'amazonpay'].includes(order.paymentMethod)) paymentBreakdown.upi += 1;
      else paymentBreakdown.online += 1;

      const key = String(order.orderStatus || '').toLowerCase();
      if (key === 'pending') orderStatusBreakdown.pending += 1;
      else if (key === 'shipped') orderStatusBreakdown.shipped += 1;
      else if (key === 'cancelled') orderStatusBreakdown.cancelled += 1;
      else if (key === 'delivered') orderStatusBreakdown.delivered += 1;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProducts,
        activeProducts,
        totalOrders,
        supportCount,
        revenue,
        paymentBreakdown,
        orderStatusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const range = req.query.range || 'monthly';
    const now = new Date();
    const start = new Date(now);

    if (range === 'yearly') {
      start.setMonth(now.getMonth() - 11);
      start.setDate(1);
    } else if (range === 'half-year' || range === 'halfyear') {
      start.setMonth(now.getMonth() - 5);
      start.setDate(1);
    } else {
      start.setDate(1);
      start.setMonth(now.getMonth() - 2);
    }

    const orders = await Order.find({
      createdAt: { $gte: start },
      orderStatus: { $ne: 'Cancelled' }
    }).select('createdAt totalPrice');

    const buckets = new Map();

    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      let label = '';
      if (range === 'yearly' || range === 'half-year' || range === 'halfyear') label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      else label = d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
      buckets.set(label, (buckets.get(label) || 0) + (order.totalPrice || 0));
    });

    const trend = Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    const images = normalizeImages(req.body.images);
    if (images) payload.images = images;
    else delete payload.images;
    const product = await Product.create(payload);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const update = { ...req.body };
    const images = normalizeImages(req.body.images);
    if (images) {
      update.images = images;
    } else {
      delete update.images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted from database' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note = '' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    order.trackingHistory.push({ status, note });
    if (status === 'Delivered') order.deliveredAt = new Date();
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSupportMessages = async (req, res) => {
  try {
    const messages = await Feedback.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};

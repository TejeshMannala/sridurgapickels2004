const Feedback = require('../models/feedbackModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');

const createFeedback = async (req, res) => {
  try {
    const { subject, message, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Order ID is incorrect. Please check the order once.' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(400).json({ success: false, message: 'Order ID is incorrect. Please check the order once.' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      order: order._id,
      subject,
      message
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id }).populate('order', '_id orderStatus createdAt').sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({})
      .populate('user', 'name email')
      .populate('order', '_id orderStatus')
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const replyToFeedback = async (req, res) => {
  try {
    const { adminReply, status = 'replied' } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.status === 'replied' || String(feedback.adminReply || '').trim()) {
      return res.status(409).json({
        success: false,
        message: 'Reply already sent for this support message.'
      });
    }

    if (!String(adminReply || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required.'
      });
    }

    feedback.adminReply = String(adminReply).trim();
    feedback.status = status;
    feedback.repliedBy = req.user._id;
    feedback.repliedAt = new Date();
    await feedback.save();

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createFeedback, getMyFeedback, getAllFeedback, replyToFeedback };

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Subject cannot exceed 120 characters']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1200, 'Message cannot exceed 1200 characters']
    },
    status: {
      type: String,
      enum: ['open', 'replied', 'closed'],
      default: 'open'
    },
    adminReply: {
      type: String,
      default: ''
    },
    repliedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    repliedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

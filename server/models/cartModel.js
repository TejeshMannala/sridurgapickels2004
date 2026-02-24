const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  packSize: {
    type: String,
    enum: ['250g', '500g', '1kg'],
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total price
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  }
});

const shippingInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  pinCode: {
    type: Number,
    required: true
  },
  phoneNo: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingInfo: shippingInfoSchema,
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  discountPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  couponCode: {
    type: String,
    default: ''
  },
  paymentInfo: {
    id: {
      type: String
    },
    status: {
      type: String
    },
    upiId: {
      type: String
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'gpay', 'paytm', 'googlepay', 'amazonpay', 'card', 'netbanking'],
    required: true
  },
  paidAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Shipped', 'Cancelled', 'Delivered'],
    default: 'Pending'
  },
  trackingHistory: [
    {
      status: {
        type: String,
        required: true
      },
      note: {
        type: String,
        default: ''
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);

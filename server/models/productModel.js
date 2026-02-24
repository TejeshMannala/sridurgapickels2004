const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    packSize: {
      type: String,
      enum: ['250g', '500g', '1kg'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    max: [99999, 'Product price cannot exceed 99999'],
    default: 0.0
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  images: [
    {
      public_id: {
        type: String,
        default: 'product_default'
      },
      url: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels.jpg'
      }
    }
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  variants: {
    type: [variantSchema],
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'At least one size variant is required'
    }
  },
  ratings: {
    type: Number,
    default: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 90
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  tags: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

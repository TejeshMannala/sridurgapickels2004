const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter category description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['veg', 'non-veg', 'seafood', 'dry-fruits', 'labbu'],
    required: true
  },
  image: {
    public_id: {
      type: String,
      default: 'category_default'
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/fish-vegetables.jpg'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);

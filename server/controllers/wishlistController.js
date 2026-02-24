const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const existingIndex = wishlist.items.findIndex((item) => String(item.product) === String(productId));
    if (existingIndex >= 0) {
      wishlist.items.splice(existingIndex, 1);
    } else {
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    const populated = await Wishlist.findById(wishlist._id).populate('items.product');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist };

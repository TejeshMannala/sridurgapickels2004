const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, packSize, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variant = product.variants.find((item) => item.packSize === packSize);
    if (!variant) {
      return res.status(400).json({ success: false, message: 'Selected pack size is unavailable' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      (item) => String(item.product) === String(productId) && item.packSize === packSize
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: product._id,
        quantity: Number(quantity),
        packSize,
        price: variant.price
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    item.quantity = Number(quantity);
    if (item.quantity <= 0) {
      item.deleteOne();
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    item.deleteOne();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };

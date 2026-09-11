const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get logged in user's watchlist
// @route   GET /api/watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'watchlist',
      model: 'Product'
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert populated products to JSON so virtuals (priceDropPercentage, recommendation) are included
    const watchlist = (user.watchlist || [])
      .filter(p => p !== null)
      .map(p => (typeof p.toJSON === 'function' ? p.toJSON() : p));

    res.json({
      success: true,
      count: watchlist.length,
      data: watchlist
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ success: false, message: 'Server error fetching watchlist' });
  }
});

// @desc    Add product to watchlist
// @route   POST /api/watchlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide a productId' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);

    // Check if already in watchlist
    const alreadyInWatchlist = user.watchlist.some(
      id => id.toString() === productId.toString()
    );

    if (alreadyInWatchlist) {
      return res.status(400).json({ success: false, message: 'Product is already in your watchlist' });
    }

    user.watchlist.push(productId);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Product added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ success: false, message: 'Server error updating watchlist' });
  }
});

// @desc    Remove product from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const initialLength = user.watchlist.length;
    user.watchlist = user.watchlist.filter(
      prodId => prodId.toString() !== req.params.id.toString()
    );

    if (user.watchlist.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Product was not in your watchlist' });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Product removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ success: false, message: 'Server error updating watchlist' });
  }
});

module.exports = router;

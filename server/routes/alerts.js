const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { sendPriceAlertConfirmation } = require('../services/emailService');

// @desc    Get user's price alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    const formattedAlerts = alerts
      .filter(a => a.product !== null)
      .map(a => {
        const item = a.toObject();
        if (item.product && item.product.priceDropPercentage === undefined) {
          // ensure virtuals
          const p = a.product.toJSON ? a.product.toJSON() : a.product;
          item.product = p;
        }
        return item;
      });

    res.json({
      success: true,
      count: formattedAlerts.length,
      data: formattedAlerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching alerts' });
  }
});

// @desc    Create a price alert
// @route   POST /api/alerts
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || targetPrice === undefined || targetPrice === null) {
      return res.status(400).json({ success: false, message: 'Please provide productId and targetPrice' });
    }

    const numericTarget = Number(targetPrice);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid target price greater than 0' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if an active alert already exists for this user and product
    let alert = await Alert.findOne({
      user: req.user._id,
      product: productId,
      active: true
    });

    if (alert) {
      alert.targetPrice = numericTarget;
      alert.notified = false;
      await alert.save();
    } else {
      alert = await Alert.create({
        user: req.user._id,
        product: productId,
        targetPrice: numericTarget,
        active: true
      });
    }

    // Send confirmation email asynchronously
    sendPriceAlertConfirmation(
      req.user.email,
      req.user.name,
      product.name,
      numericTarget,
      product.currentPrice
    );

    const populatedAlert = await Alert.findById(alert._id).populate('product');

    res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      data: populatedAlert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating alert' });
  }
});

// @desc    Delete/cancel an alert
// @route   DELETE /api/alerts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await alert.deleteOne();

    res.json({
      success: true,
      message: 'Price alert removed successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ success: false, message: 'Server error deleting alert' });
  }
});

module.exports = router;

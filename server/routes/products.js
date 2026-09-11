const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Alert = require('../models/Alert');
const { sendPriceAlertConfirmation } = require('../services/emailService');
const sampleProducts = require('../data/sampleProducts');

// @desc    Get all products with search, filtering and sorting
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, sort, dropsOnly, limit } = req.query;

    const query = {};

    // Search by product name, brand, or description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by Category
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Filter for drops only (currentPrice < highestPrice)
    if (dropsOnly === 'true' || dropsOnly === true) {
      query.$expr = { $lt: ['$currentPrice', '$highestPrice'] };
    }

    let queryExec = Product.find(query);

    // Sorting
    if (sort === 'price_asc') {
      queryExec = queryExec.sort({ currentPrice: 1 });
    } else if (sort === 'price_desc') {
      queryExec = queryExec.sort({ currentPrice: -1 });
    } else if (sort === 'drops') {
      // Sort products by highest discount difference
      queryExec = queryExec.sort({ highestPrice: -1 });
    } else {
      // Default: newest first
      queryExec = queryExec.sort({ createdAt: -1 });
    }

    if (limit) {
      queryExec = queryExec.limit(parseInt(limit));
    }

    const products = await queryExec;

    // Optional post-sort for percentage drop if requested
    let result = products.map(p => p.toJSON());
    if (sort === 'drops') {
      result.sort((a, b) => (b.priceDropPercentage || 0) - (a.priceDropPercentage || 0));
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      data: product.toJSON()
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Public (or Admin)
router.post('/', async (req, res) => {
  try {
    const { name, brand, category, image, description, currentPrice, stores, priceHistory } = req.body;

    if (!name || !brand || !category || !image || !currentPrice) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const history = priceHistory && priceHistory.length > 0
      ? priceHistory
      : [{ date: new Date(), price: Number(currentPrice) }];

    const product = new Product({
      name,
      brand,
      category,
      image,
      description,
      currentPrice: Number(currentPrice),
      stores: stores || [],
      priceHistory: history
    });

    const saved = await product.save();
    res.status(201).json({ success: true, data: saved.toJSON() });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating product' });
  }
});

// @desc    Update product & update price history if price changed
// @route   PUT /api/products/:id
// @access  Public (or Admin)
router.put('/:id', async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, brand, category, image, description, currentPrice, stores } = req.body;

    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (image) product.image = image;
    if (description !== undefined) product.description = description;
    if (stores) product.stores = stores;

    // If new price provided, append to history
    if (currentPrice && Number(currentPrice) !== product.currentPrice) {
      const newPrice = Number(currentPrice);
      product.currentPrice = newPrice;
      product.priceHistory.push({
        date: new Date(),
        price: newPrice
      });

      // Check active alerts for this product
      const activeAlerts = await Alert.find({ product: product._id, active: true }).populate('user');
      for (const alert of activeAlerts) {
        if (alert.targetPrice >= newPrice && !alert.notified) {
          alert.notified = true;
          await alert.save();
          if (alert.user && alert.user.email) {
            sendPriceAlertConfirmation(
              alert.user.email,
              alert.user.name,
              product.name,
              alert.targetPrice,
              newPrice
            );
          }
        }
      }
    }

    const updated = await product.save();
    res.json({ success: true, data: updated.toJSON() });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public (or Admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    // Also remove associated alerts
    await Alert.deleteMany({ product: req.params.id });

    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

// @desc    Reset and reseed sample products
// @route   POST /api/products/reset-seed
// @access  Public
router.post('/reset-seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    for (const prodData of sampleProducts) {
      const p = new Product(prodData);
      await p.save();
    }
    const count = await Product.countDocuments();
    res.json({ success: true, message: `Successfully seeded ${count} products` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

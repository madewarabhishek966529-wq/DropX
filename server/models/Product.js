const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      default: '#'
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL']
    },
    description: {
      type: String,
      default: ''
    },
    currentPrice: {
      type: Number,
      required: [true, 'Please provide the current price']
    },
    lowestPrice: {
      type: Number
    },
    highestPrice: {
      type: Number
    },
    averagePrice: {
      type: Number
    },
    priceHistory: [priceHistorySchema],
    stores: [storeSchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate lowest, highest, and average price automatically before saving
productSchema.pre('save', function (next) {
  if (this.priceHistory && this.priceHistory.length > 0) {
    const allPrices = this.priceHistory.map(p => p.price);
    if (this.currentPrice) {
      allPrices.push(this.currentPrice);
    }
    this.lowestPrice = Math.min(...allPrices);
    this.highestPrice = Math.max(...allPrices);
    const sum = allPrices.reduce((acc, curr) => acc + curr, 0);
    this.averagePrice = Math.round(sum / allPrices.length);
  } else {
    this.lowestPrice = this.currentPrice;
    this.highestPrice = this.currentPrice;
    this.averagePrice = this.currentPrice;
  }
  next();
});

// Virtual for calculating price drop percentage from highest or average
productSchema.virtual('priceDropPercentage').get(function () {
  if (this.highestPrice && this.highestPrice > this.currentPrice) {
    return Math.round(((this.highestPrice - this.currentPrice) / this.highestPrice) * 100);
  }
  return 0;
});

// Virtual for smart "Buy or Wait" recommendation
productSchema.virtual('recommendation').get(function () {
  if (!this.averagePrice || !this.currentPrice) {
    return {
      status: 'BUY NOW',
      color: 'green',
      icon: '🟢',
      summary: 'Current price is attractive.'
    };
  }

  const diffFromAvgPercent = ((this.averagePrice - this.currentPrice) / this.averagePrice) * 100;
  const isNearLowest = this.lowestPrice && (this.currentPrice <= this.lowestPrice * 1.03);

  if (diffFromAvgPercent >= 5 || isNearLowest) {
    return {
      status: 'BUY NOW',
      code: 'buy_now',
      badge: 'GOOD TIME TO BUY',
      color: 'green',
      icon: '🟢',
      reason: `Current price is ${Math.abs(Math.round(diffFromAvgPercent))}% below the average price (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(this.averagePrice)}). Near the lowest recorded price.`
    };
  } else if (diffFromAvgPercent <= -5) {
    return {
      status: 'OVERPRICED',
      code: 'overpriced',
      badge: 'OVERPRICED',
      color: 'red',
      icon: '🔴',
      reason: `Current price is ${Math.round(Math.abs(diffFromAvgPercent))}% above average. We recommend waiting for a discount.`
    };
  } else {
    return {
      status: 'WAIT',
      code: 'wait',
      badge: 'WAIT',
      color: 'yellow',
      icon: '🟡',
      reason: `Current price is close to average (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(this.averagePrice)}). A seasonal drop may happen soon.`
    };
  }
});

module.exports = mongoose.model('Product', productSchema);

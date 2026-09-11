require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Alert = require('./models/Alert');
const sampleProducts = require('./data/sampleProducts');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dropx';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Save each product individually to trigger pre-save calculation hooks
    for (const prodData of sampleProducts) {
      const product = new Product(prodData);
      await product.save();
    }
    console.log(`✅ Successfully seeded ${sampleProducts.length} sample products with price histories!`);

    // Create a demo user if doesn't exist
    const demoEmail = 'demo@dropx.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Hunter',
        email: demoEmail,
        password: 'password123'
      });
      console.log('✅ Created demo user: demo@dropx.com / password123');
    }

    // Attach sample watchlist & alert to demo user
    const seededProducts = await Product.find({});
    if (seededProducts.length >= 2) {
      demoUser.watchlist = [seededProducts[0]._id, seededProducts[1]._id];
      await demoUser.save();

      // Clear alerts and add sample alert
      await Alert.deleteMany({ user: demoUser._id });
      await Alert.create({
        user: demoUser._id,
        product: seededProducts[0]._id,
        targetPrice: 85000,
        active: true
      });
      console.log('✅ Attached demo watchlist and demo alert.');
    }

    console.log('🚀 Seeding complete!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;

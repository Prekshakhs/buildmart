const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const connectDB = require('./db');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');

(async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Products cleared');

    const sellers = await User.find({ role: 'seller' });
    const categories = await Category.find({});

    if (!sellers.length || !categories.length) {
      console.log('❌ Need sellers and categories first');
      process.exit(1);
    }

    console.log(`📦 Found ${sellers.length} sellers and ${categories.length} categories`);

    const products = [
      { name: 'Cement Bag 50KG', desc: 'Portland cement for construction', cat: 0, price: 450, stock: 100, seller: 0 },
      { name: 'Steel Rods 12MM', desc: 'High strength steel rods', cat: 0, price: 650, stock: 150, seller: 1 },
      { name: 'Red Bricks Box', desc: 'Quality clay bricks', cat: 0, price: 800, stock: 200, seller: 2 },
      { name: 'LED Bulb 18W Warm', desc: 'Energy efficient LED lighting', cat: 1, price: 250, stock: 500, seller: 0 },
      { name: 'Power Adapter 30W USB', desc: 'Fast charging adapter', cat: 1, price: 1200, stock: 80, seller: 1 },
      { name: 'USB-C Cable 2Meter', desc: 'High speed data cable', cat: 1, price: 350, stock: 200, seller: 2 },
      { name: 'Hammer Tool 2KG', desc: 'Durable hammer for construction', cat: 2, price: 450, stock: 150, seller: 3 },
      { name: 'Screwdriver Set Professional', desc: 'Complete professional set', cat: 2, price: 800, stock: 100, seller: 4 },
      { name: 'Power Drill Cordless', desc: 'Lithium ion power drill', cat: 2, price: 3500, stock: 30, seller: 0 },
      { name: 'Door Lock Cylinder', desc: 'Security lock cylinder', cat: 3, price: 250, stock: 300, seller: 1 },
      { name: 'Brass Door Handle', desc: 'Stylish brass handle', cat: 3, price: 180, stock: 250, seller: 2 },
      { name: 'Brass Hinge 3 Inch', desc: 'Heavy duty hinge', cat: 3, price: 120, stock: 400, seller: 3 },
      { name: 'Shovel Garden Tool', desc: 'Sturdy garden shovel', cat: 4, price: 350, stock: 80, seller: 4 },
      { name: 'Garden Fork Spade', desc: 'Professional garden fork', cat: 4, price: 420, stock: 60, seller: 0 },
      { name: 'Hose Pipe 30M Green', desc: 'Quality water hose', cat: 4, price: 1200, stock: 40, seller: 1 },
      { name: 'Emulsion Paint White 20L', desc: 'Interior wall paint', cat: 5, price: 2500, stock: 50, seller: 2 },
      { name: 'Wood Varnish 5L Glossy', desc: 'Wood protective coating', cat: 5, price: 1800, stock: 35, seller: 3 },
      { name: 'Primer White 10L Undercoat', desc: 'Surface primer coating', cat: 5, price: 1200, stock: 45, seller: 4 },
    ];

    const productDocs = products.map((p, idx) => {
      // Sample specifications based on product type
      let specs = [];
      if (idx % 6 === 0) { // Cement
        specs = [
          { label: 'Type', value: 'Portland Cement' },
          { label: 'Strength Grade', value: '53 Grade' },
          { label: 'Weight', value: '50 kg' },
          { label: 'Shelf Life', value: '3 months' },
        ];
      } else if (idx % 6 === 1) { // Steel
        specs = [
          { label: 'Diameter', value: '12mm' },
          { label: 'Grade', value: 'Fe500D' },
          { label: 'Length', value: 'Standard (40 ft)' },
          { label: 'Finish', value: 'Black' },
        ];
      } else if (idx % 6 === 2) { // Bricks
        specs = [
          { label: 'Dimensions', value: '225 x 112 x 75 mm' },
          { label: 'Type', value: 'Clay Brick' },
          { label: 'Compressive Strength', value: '3.5 N/mm²' },
          { label: 'Per Box', value: '500 pcs' },
        ];
      } else if (idx % 6 === 3) { // LED
        specs = [
          { label: 'Power', value: '18W' },
          { label: 'Color Temperature', value: '3000K (Warm)' },
          { label: 'Lumens', value: '1600' },
          { label: 'Lifespan', value: '25,000 hours' },
        ];
      } else if (idx % 6 === 4) { // Adapter/Cable
        specs = [
          { label: 'Output', value: '30W' },
          { label: 'Type', value: 'USB-C / USB-A' },
          { label: 'Compatibility', value: 'Universal' },
          { label: 'Safety Rating', value: 'FCC Certified' },
        ];
      } else { // Tools/Hardware
        specs = [
          { label: 'Material', value: 'High Carbon Steel' },
          { label: 'Weight', value: 'Varies' },
          { label: 'Warranty', value: '1 Year' },
          { label: 'Origin', value: 'India' },
        ];
      }

      return {
        name: p.name,
        description: p.desc,
        category: categories[p.cat]._id,
        retailPrice: p.price,
        stock: p.stock,
        seller: sellers[p.seller % sellers.length]._id,
        unit: 'piece',
        isActive: true,
        specifications: specs,
      };
    });

    // Use create() instead of insertMany() to trigger pre-save hooks
    let created = 0;
    for (const doc of productDocs) {
      try {
        await Product.create(doc);
        created++;
      } catch (err) {
        if (err.code !== 11000) {
          console.log(`⊘ Skipped: ${doc.name} (${err.message})`);
        }
      }
    }
    console.log(`✅ Created ${created} products`);

    // Count by category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
    ]);

    console.log('\n📊 Products by category:');
    counts.forEach((c) => {
      console.log(`   ${c.cat.name}: ${c.count} products`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();

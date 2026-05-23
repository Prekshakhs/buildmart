const mongoose = require('mongoose');
const FAQ = require('./models/FAQ.model.js');
const User = require('./models/User.model.js');

const SAMPLE_FAQS = [
  {
    title: "How do I create an account?",
    content: "To create an account, click the Register button on the home page and fill in your details including email, password, and role (buyer/seller).",
    category: "Getting Started",
    tags: ["account", "registration"]
  },
  {
    title: "What payment methods do you accept?",
    content: "We accept payments through Razorpay, which supports credit cards, debit cards, net banking, UPI, and digital wallets.",
    category: "Payments",
    tags: ["payment", "razorpay"]
  },
  {
    title: "How do I place an order?",
    content: "Browse products, add items to your cart, proceed to checkout, and complete payment. You'll receive an order confirmation via email.",
    category: "Buying",
    tags: ["orders", "checkout"]
  },
  {
    title: "What is the return policy?",
    content: "You can return delivered products within 30 days. Sellers must approve returns, and refunds are processed within 5-7 business days.",
    category: "Returns",
    tags: ["returns", "refunds"]
  },
  {
    title: "How do I become a seller?",
    content: "Register as a seller, complete your profile with business details, and wait for admin approval. Once approved, you can list products.",
    category: "Selling",
    tags: ["seller", "registration"]
  },
  {
    title: "How long does shipping take?",
    content: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days delivery in select cities.",
    category: "Shipping",
    tags: ["shipping", "delivery"]
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/marketplace_db');

    // Get first admin user or create one
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@buildmart.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
    }

    // Clear existing FAQs
    await FAQ.deleteMany({});

    // Add createdBy to all FAQs
    const faqs = SAMPLE_FAQS.map(faq => ({ ...faq, createdBy: admin._id }));

    // Insert sample FAQs
    const result = await FAQ.insertMany(faqs);
    console.log(`✓ Created ${result.length} sample FAQs`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

mongoose.connect('mongodb://localhost:27017/marketplace_db').then(async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✓ Admin already exists:', existingAdmin.email);
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@buildmart.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });
    
    await admin.save();
    console.log('✓ Admin user created');
    console.log('  Email: admin@buildmart.com');
    console.log('  Password: admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});

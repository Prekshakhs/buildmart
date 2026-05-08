const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

mongoose.connect('mongodb://localhost:27017/marketplace_db').then(async () => {
  try {
    const password = 'admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const updated = await User.findOneAndUpdate(
      { role: 'admin' },
      { password: hashedPassword },
      { new: true }
    );
    
    console.log('✓ Admin password reset');
    console.log('  Email:', updated.email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});

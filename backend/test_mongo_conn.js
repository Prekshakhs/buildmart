const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/marketplace_db';
console.log(`Testing: ${mongoURI}`);

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
})
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
      const result = await mongoose.connection.db.collection('categories').findOne({});
      console.log('✅ Query successful - Found:', result ? 'data' : 'collection is empty');
      mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Query failed:', err.message);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.error('❌ Timeout after 15 seconds');
  process.exit(1);
}, 15000);

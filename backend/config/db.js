const mongoose = require("mongoose");

const connectDB = async () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    })
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Add listeners for connection events
        mongoose.connection.on('connected', () => {
          console.log('📡 Mongoose connection event fired - connected');
        });
        mongoose.connection.on('error', (err) => {
          console.error('❌ Mongoose connection error:', err);
        });
        mongoose.connection.on('disconnected', () => {
          console.log('⚠️  Mongoose disconnected');
        });

        resolve(true);
      })
      .catch((error) => {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // In development, continue anyway
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️  Running in offline mode - features requiring database will be limited");
          resolve(false); // Continue server startup
        } else {
          reject(error);
        }
      });
  });
};

module.exports = connectDB;

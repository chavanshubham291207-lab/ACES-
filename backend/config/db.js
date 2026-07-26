const mongoose = require('mongoose');
const dns = require('dns');

// Configure Google & Cloudflare DNS servers for Node.js SRV record resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

const connectDB = async () => {
  try {
    console.log('✅ Connecting to MongoDB...');

    // Disable Mongoose query buffering to prevent timeouts when DB is disconnected
    mongoose.set('bufferCommands', false);

    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://ACES:ACES%40123@cluster00.vujlpwx.mongodb.net/aces?retryWrites=true&w=majority&appName=Cluster00';

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 TROUBLESHOOTING ATLAS CONNECTION:');
    console.error('   1. Ensure MongoDB Atlas IP Access List has 0.0.0.0/0 enabled in Network Access.');
    console.error('   2. Verify username & password (URL encoded ACES%40123 for ACES@123).');
    console.error('   3. Check DNS/Internet connectivity for MongoDB Atlas cluster00.vujlpwx.mongodb.net.');
    throw error;
  }
};

// Graceful Shutdown Handlers
process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed (SIGINT)');
    }
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed (SIGTERM)');
    }
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

module.exports = connectDB;

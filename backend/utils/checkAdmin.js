const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config();
const User = require('../models/User');

const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://ACES:ACES%40123@cluster00.vujlpwx.mongodb.net/aces?retryWrites=true&w=majority&appName=Cluster00';

const check = async () => {
  await mongoose.connect(connStr);
  const users = await User.find({}).select('name email role status');
  console.log('📋 ALL USERS IN MONGODB ATLAS:');
  console.dir(users, { depth: null });
  process.exit(0);
};

check();

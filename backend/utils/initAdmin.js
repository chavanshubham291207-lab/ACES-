const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const User = require('../models/User');
const Role = require('../models/Role');

const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://ACES:ACES%40123@cluster00.vujlpwx.mongodb.net/aces?retryWrites=true&w=majority&appName=Cluster00';

const initSuperAdmin = async () => {
  try {
    await mongoose.connect(connStr);
    console.log('⚡ Initializing Super Admin Account...');

    // 1. Create Roles if not existing
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      await Role.insertMany([
        { name: 'Super Admin', level: 1, permissions: ['all'] },
        { name: 'President', level: 2, permissions: ['manage_all', 'reports', 'events'] },
        { name: 'Vice President', level: 3, permissions: ['manage_teams', 'events', 'reports'] },
        { name: 'Secretary', level: 4, permissions: ['attendance', 'minutes', 'events'] },
        { name: 'Treasurer', level: 5, permissions: ['finance', 'points', 'reports'] },
        { name: 'Team Lead', level: 6, permissions: ['manage_team', 'take_attendance'] },
        { name: 'Faculty Coordinator', level: 7, permissions: ['all_view', 'reports'] },
        { name: 'Member', level: 8, permissions: ['scan_attendance', 'view_events'] }
      ]);
      console.log('✅ 8 System Roles initialized.');
    }

    // 2. Create Initial Super Admin
    const adminExists = await User.findOne({ email: 'admin@aces.org' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      await User.create({
        name: 'Super Admin',
        email: 'admin@aces.org',
        password: hashedPassword,
        rollNumber: 'ADMIN-001',
        department: 'Computer Engineering',
        year: 'BE',
        role: 'Super Admin',
        status: 'active'
      });
      console.log('✅ Initial Super Admin Created (Email: admin@aces.org | Password: Admin@123)');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Init Error:', err.message);
    process.exit(1);
  }
};

initSuperAdmin();

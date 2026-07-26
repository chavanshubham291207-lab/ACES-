const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const User = require('../models/User');
const Role = require('../models/Role');
const Team = require('../models/Team');
const Position = require('../models/Position');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const ActivityLog = require('../models/ActivityLog');

const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://ACES:ACES%40123@cluster00.vujlpwx.mongodb.net/aces?retryWrites=true&w=majority&appName=Cluster00';

const purgeAllData = async () => {
  try {
    console.log('🧹 Purging all records from MongoDB Atlas...');
    await mongoose.connect(connStr);

    await User.deleteMany({});
    await Role.deleteMany({});
    await Team.deleteMany({});
    await Position.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Attendance.deleteMany({});
    await Event.deleteMany({});
    await Gallery.deleteMany({});
    await Notification.deleteMany({});
    await Certificate.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('✅ All dummy, sample, and mock data successfully removed from MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Purge Error:', error.message);
    process.exit(1);
  }
};

purgeAllData();

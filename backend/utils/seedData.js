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

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB:', connStr);
    await mongoose.connect(connStr);
    console.log('[Seed] Database Connected...');

    // Clear existing
    try {
      await mongoose.connection.db.collection('positions').dropIndexes();
    } catch (e) {
      console.log('[Seed] Drop indexes note:', e.message);
    }
    await User.deleteMany();
    await Role.deleteMany();
    await Team.deleteMany();
    await Position.deleteMany();
    await AttendanceSession.deleteMany();
    await Attendance.deleteMany();
    await Event.deleteMany();
    await Gallery.deleteMany();
    await Notification.deleteMany();
    await Certificate.deleteMany();
    await ActivityLog.deleteMany();

    console.log('[Seed] Cleared existing data...');

    // 1. Roles
    const rolesData = [
      { name: 'Super Admin', level: 1, permissions: ['all'] },
      { name: 'President', level: 2, permissions: ['manage_all', 'reports', 'events'] },
      { name: 'Vice President', level: 3, permissions: ['manage_teams', 'events', 'reports'] },
      { name: 'Secretary', level: 4, permissions: ['attendance', 'minutes', 'events'] },
      { name: 'Treasurer', level: 5, permissions: ['finance', 'points', 'reports'] },
      { name: 'Team Lead', level: 6, permissions: ['manage_team', 'take_attendance'] },
      { name: 'Faculty Coordinator', level: 7, permissions: ['all_view', 'reports'] },
      { name: 'Member', level: 8, permissions: ['scan_attendance', 'view_events'] }
    ];
    await Role.insertMany(rolesData);

    // 2. Teams
    const teamsData = [
      { name: 'Technical Team', description: 'Web dev, Cloud, AI/ML, CP & Systems development', banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' },
      { name: 'Design Team', description: 'UI/UX, Visual Branding, Motion & Graphics', banner: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80' },
      { name: 'Content Team', description: 'Technical Writing, Documentation & Editorial', banner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80' },
      { name: 'PR Team', description: 'Public Relations, Sponsorships & Corporate Outreach', banner: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80' },
      { name: 'Social Media Team', description: 'Community engagement, Reels & Digital Marketing', banner: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80' },
      { name: 'Event Team', description: 'Logistics, On-ground operations & Workshop management', banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
      { name: 'Photography Team', description: 'Event coverage, After-movies & Media archiving', banner: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' }
    ];
    const createdTeams = await Team.insertMany(teamsData);
    const techTeam = createdTeams.find(t => t.name === 'Technical Team');
    const designTeam = createdTeams.find(t => t.name === 'Design Team');

    // 3. Users (Password: Aces@2026 for all)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Aces@2026', salt);

    const usersData = [
      {
        name: 'Alex Johnson (Super Admin)',
        email: 'admin@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43210',
        rollNumber: 'COMP-2026-001',
        department: 'Computer Engineering',
        year: 'BE',
        team: techTeam._id,
        role: 'Super Admin',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com/in/alex-johnson',
        github: 'https://github.com/alexjohnson',
        contributionPoints: 450
      },
      {
        name: 'Sarah Connor (President)',
        email: 'president@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43211',
        rollNumber: 'COMP-2026-002',
        department: 'Computer Engineering',
        year: 'BE',
        team: techTeam._id,
        role: 'President',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com/in/sarahconnor',
        github: 'https://github.com/sarahconnor',
        contributionPoints: 390
      },
      {
        name: 'Michael Chang (Vice President)',
        email: 'vp@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43212',
        rollNumber: 'COMP-2026-003',
        department: 'Computer Engineering',
        year: 'TE',
        team: designTeam._id,
        role: 'Vice President',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com/in/michaelchang',
        github: 'https://github.com/michaelchang',
        contributionPoints: 310
      },
      {
        name: 'Emily Watson (Secretary)',
        email: 'secretary@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43213',
        rollNumber: 'COMP-2026-004',
        department: 'Computer Engineering',
        year: 'TE',
        team: techTeam._id,
        role: 'Secretary',
        profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        contributionPoints: 280
      },
      {
        name: 'David Miller (Treasurer)',
        email: 'treasurer@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43214',
        rollNumber: 'COMP-2026-005',
        department: 'Computer Engineering',
        year: 'TE',
        team: techTeam._id,
        role: 'Treasurer',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        contributionPoints: 260
      },
      {
        name: 'Rohan Sharma (Tech Lead)',
        email: 'techlead@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43215',
        rollNumber: 'COMP-2026-006',
        department: 'Computer Engineering',
        year: 'TE',
        team: techTeam._id,
        role: 'Team Lead',
        profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        contributionPoints: 240
      },
      {
        name: 'Priya Patel (Member)',
        email: 'member@aces.org',
        password: defaultPassword,
        phone: '+91 98765 43216',
        rollNumber: 'COMP-2026-007',
        department: 'Computer Engineering',
        year: 'SE',
        team: techTeam._id,
        role: 'Member',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        contributionPoints: 120
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    const adminUser = createdUsers[0];
    const presUser = createdUsers[1];
    const vpUser = createdUsers[2];
    const secUser = createdUsers[3];
    const treasUser = createdUsers[4];
    const techLeadUser = createdUsers[5];
    const memberUser = createdUsers[6];

    await Team.findByIdAndUpdate(techTeam._id, { lead: techLeadUser._id });

    // 4. Positions
    const positionsData = [
      { memberName: 'Sarah Connor', positionName: 'President', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', displayOrder: 1 },
      { memberName: 'Michael Chang', positionName: 'Vice President', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', displayOrder: 2 },
      { memberName: 'Emily Watson', positionName: 'Secretary', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', displayOrder: 3 },
      { memberName: 'David Miller', positionName: 'Treasurer', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', displayOrder: 4 },
      { memberName: 'Rohan Sharma', positionName: 'Technical Head', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', displayOrder: 5 }
    ];

    const createdPositions = await Position.insertMany(positionsData);
    await User.findByIdAndUpdate(presUser._id, { position: createdPositions[0]._id });
    await User.findByIdAndUpdate(vpUser._id, { position: createdPositions[1]._id });
    await User.findByIdAndUpdate(secUser._id, { position: createdPositions[2]._id });
    await User.findByIdAndUpdate(treasUser._id, { position: createdPositions[3]._id });
    await User.findByIdAndUpdate(techLeadUser._id, { position: createdPositions[4]._id });

    // 5. Attendance Session
    const activeToken = 'ACES-LIVE-QR-2026';
    const activeSession = await AttendanceSession.create({
      meetingTitle: 'ACES General Body Meeting & Hackathon Briefing',
      meetingType: 'General Body',
      venue: 'Main Auditorium - Computer Dept',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      qrExpiryTime: new Date(Date.now() + 45 * 60 * 1000),
      qrToken: activeToken,
      description: 'Quarterly all-members assembly to introduce new hackathon themes and committee announcements.',
      createdBy: adminUser._id
    });

    const pastSession = await AttendanceSession.create({
      meetingTitle: 'React & Cloud Architecture Workshop',
      meetingType: 'Workshop',
      venue: 'Lab 402 - Technical Wing',
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      qrExpiryTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      qrToken: 'ACES-PAST-QR-1001',
      description: 'Hands-on session covering Vite, React 18, State Management, and Serverless deployment.',
      createdBy: techLeadUser._id
    });

    // 6. Attendance records
    await Attendance.create([
      { session: pastSession._id, member: memberUser._id, memberName: memberUser.name, meetingTitle: pastSession.meetingTitle, date: new Date().toISOString().split('T')[0], checkInTime: '10:05 AM', status: 'Present', scanTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { session: pastSession._id, member: techLeadUser._id, memberName: techLeadUser.name, meetingTitle: pastSession.meetingTitle, date: new Date().toISOString().split('T')[0], checkInTime: '10:02 AM', status: 'Present', scanTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000) },
      { session: pastSession._id, member: secUser._id, memberName: secUser.name, meetingTitle: pastSession.meetingTitle, date: new Date().toISOString().split('T')[0], checkInTime: '10:20 AM', status: 'Late', scanTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000) }
    ]);

    // 7. Events
    await Event.create([
      {
        title: 'Hack-ACES 2026: 24-Hour Hackathon',
        banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80',
        venue: 'Engineering Complex Lab 1 & 2',
        startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        description: 'Annual flagship 24-hour hackathon with tracks in AI/ML, Web3, FinTech, and IoT. Cash prizes worth $5,000!',
        chiefGuest: 'Dr. Robert Vance, CTO at TechCorp',
        category: 'Hackathon',
        registeredMembers: [memberUser._id, techLeadUser._id],
        createdBy: adminUser._id
      },
      {
        title: 'UI/UX Masterclass & Design Sprint',
        banner: 'https://images.unsplash.com/photo-1542744094-3a3172720189?w=1000&auto=format&fit=crop&q=80',
        venue: 'Seminar Hall B',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        description: 'Interactive session exploring Figma design systems, motion graphics, and user research methodologies.',
        chiefGuest: 'Elena Rostova, Product Designer at Studio Grid',
        category: 'Workshop',
        registeredMembers: [memberUser._id, vpUser._id],
        createdBy: vpUser._id
      }
    ]);

    // 8. Gallery
    await Gallery.create([
      { title: 'TechFest Annual Keynote 2025', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80', category: 'Events', uploadedBy: adminUser._id },
      { title: 'Full-Stack Web Dev Workshop', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', category: 'Workshops', uploadedBy: techLeadUser._id },
      { title: 'Hackathon Winner Ceremony', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', category: 'Hackathons', uploadedBy: presUser._id },
      { title: 'Core Committee Meet', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', category: 'Team', uploadedBy: secUser._id }
    ]);

    // 9. Certificates
    await Certificate.create([
      {
        title: 'Certificate of Excellence - Web Dev Bootcamp 2025',
        description: 'Awarded for outstanding performance in building React & Node full-stack applications.',
        issueDate: new Date(),
        recipient: memberUser._id,
        fileUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80',
        issuedBy: adminUser._id
      }
    ]);

    // 10. Notifications
    await Notification.create([
      { recipient: null, title: 'Upcoming General Body Assembly', message: 'Scan QR at venue tomorrow 10:00 AM to mark attendance.', type: 'meeting' },
      { recipient: memberUser._id, title: 'Certificate Issued!', message: 'Your Web Dev Certificate is now available for download.', type: 'general' }
    ]);

    // 11. Activity Log
    await ActivityLog.create({
      user: adminUser._id,
      userName: adminUser.name,
      action: 'System Seed Initialized',
      module: 'System',
      details: 'Populated initial database records with 7 roles, teams, positions, and mock users.'
    });

    console.log('[Seed] Database Seed Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seed();

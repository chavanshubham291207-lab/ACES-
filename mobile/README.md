# ACES Mobile Attendance Application (Expo / React Native)

Official mobile application for the Association of Computer Engineering Students (ACES) Club Management Portal.

## 📱 Features

- **MongoDB Authentication**: Authenticates against the same Node.js & MongoDB Atlas backend.
- **Expo Camera QR Scanner**: Scans dynamic attendance QR codes generated on the Admin Web Portal (`ACES-QR-...`).
- **Read-Only Auto-Filled Confirmation Screen**: Auto-fills Member Name, Team, Position, Date, Time, Venue, and Session Name directly from MongoDB.
- **Duplicate Prevention**: Enforces database layer duplicate scan checks.
- **Turnout Metrics**: View personal attendance history, turnout percentage, and contribution points.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Backend API Endpoint
Open `src/services/api.js`:
```javascript
// For Android Emulator:
const API_URL = 'http://10.0.2.2:5000/api';

// For Physical Device running Expo Go:
const API_URL = 'http://YOUR_LOCAL_IP:5000/api'; // e.g. http://192.168.1.10:5000/api
```

### 3. Launch Expo Dev Server
```bash
npm start
```
- Press `a` to launch on Android Emulator
- Press `i` to launch on iOS Simulator
- Scan the QR code using the Expo Go app on a physical device!

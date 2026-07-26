# ACES Club Management Portal 🚀
**Association of Computer Engineering Students (ACES)**

A production-ready, full-stack web application designed for student club administration, dynamic session-based QR attendance tracking, event organization, team management, certificate issuance, analytics, and member engagement.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Access Control (7 Roles)
- **Super Admin (`admin@aces.org`)**: Full administrative access, user creation, security audit logs, configuration.
- **President (`president@aces.org`)**: Executive management, event approvals, team oversight.
- **Vice President (`vp@aces.org`)**: Departmental supervision, event leadership.
- **Secretary (`secretary@aces.org`)**: Attendance session creation, meeting records, member reports.
- **Treasurer (`treasurer@aces.org`)**: Financial statistics, contribution points management.
- **Team Lead (`techlead@aces.org`)**: Departmental member oversight, session management.
- **Member (`member@aces.org`)**: Camera-based QR code scanning, certificate downloads, event registration, contribution points tracking.

### 2. 📱 Dynamic Session QR Attendance System
- **Dynamic Session Creation**: Define Meeting Title, Type, Team, Venue, Start/End Time, and QR Expiry Timer.
- **Auto-Expiring QR Token**: Prevents static code sharing; QR expires automatically after session window.
- **Camera-Based Scan & Auto-Fill**: Members scan via camera -> auto-fills member details, venue, date, time -> prevents duplicate scans per session.
- **Live Attendance Reports**: Real-time present count, late arrivals, absent count, attendance percentage gauge.
- **Multi-Format Export**: Export attendance session reports directly to **Excel (.xlsx)** and printable **PDF (.pdf)**.

### 3. 👥 Member & Team Management
- Full CRUD capabilities for student members (Name, Email, Roll Number, Phone, Department, Year, Team, Position, Avatar, Socials).
- Team Management (Technical, Design, Content, PR, Social Media, Event, Photography) with assigned leads & members.
- Club Positions Showcase (President, VP, Secretary, Treasurer, Heads) with rich cards & social buttons.

### 4. 🏆 Events, Certificates & Analytics
- Event management & 1-click member registration (+20 contribution points).
- Certificate Uploader & instant member PDF download.
- Recharts Data Visualizations: Attendance trends, team performance bar charts, top active vs least active members.
- Audit Trail: Logged activity trail for every create, update, delete, and security operation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3 (Glassmorphism & Dark Mode), React Router v6, Axios, Framer Motion, Lucide Icons, Recharts, `html5-qrcode`, `qrcode.react`, `xlsx`, `jspdf`.
- **Backend**: Node.js, Express.js, Mongoose ODM, JWT Authentication, bcryptjs, Helmet, CORS, Rate Limit, Mongo Sanitize, Morgan.
- **Database**: MongoDB Atlas / Local MongoDB (`mongodb://127.0.0.1:27017/aces_portal`).

---

## 🔑 Demo Account Credentials (Default Password: `Aces@2026`)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@aces.org` | `Aces@2026` | Full Portal Access + Audit Logs |
| **President** | `president@aces.org` | `Aces@2026` | Executive Access + Approvals |
| **Vice President** | `vp@aces.org` | `Aces@2026` | Team & Event Management |
| **Secretary** | `secretary@aces.org` | `Aces@2026` | Attendance & Meetings |
| **Treasurer** | `treasurer@aces.org` | `Aces@2026` | Reports & Points |
| **Team Lead** | `techlead@aces.org` | `Aces@2026` | Team Lead Dashboard |
| **Member** | `member@aces.org` | `Aces@2026` | Member Portal & QR Scanner |

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+ installed)
- MongoDB instance (MongoDB Atlas URI or local `mongodb://localhost:27017`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate database with roles, teams, positions & sample sessions
npm run dev      # Runs Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite app on http://localhost:3000
```

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
1. Push project to GitHub.
2. Import `frontend/` directory in Vercel.
3. Build Command: `npm run build`, Output Directory: `dist`.

### Backend (Render / Railway / Heroku)
1. Root directory: `backend/`.
2. Environment Variables:
   - `PORT=5000`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=aces_super_secret_jwt_key_2026`
3. Build Command: `npm install`, Start Command: `npm start`.

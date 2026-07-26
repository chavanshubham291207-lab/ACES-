import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import PWAQRScanHandlerPage from './pages/public/PWAQRScanHandlerPage';

import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManagementPage from './pages/admin/AdminManagementPage';
import MembersPage from './pages/admin/MembersPage';
import TeamsPage from './pages/admin/TeamsPage';
import PositionsPage from './pages/admin/PositionsPage';
import AttendanceSessionsPage from './pages/admin/AttendanceSessionsPage';
import AttendanceReportsPage from './pages/admin/AttendanceReportsPage';
import TasksAdminPage from './pages/admin/TasksAdminPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import GalleryAdminPage from './pages/admin/GalleryAdminPage';
import CertificatesAdminPage from './pages/admin/CertificatesAdminPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

import MemberDashboard from './pages/member/MemberDashboard';
import MemberTasksPage from './pages/member/MemberTasksPage';
import MemberCertificatesPage from './pages/member/MemberCertificatesPage';
import ProfilePage from './pages/member/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Public Web Portal */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/attendance/scan" element={<PWAQRScanHandlerPage />} />

      {/* Admin & Executive Dashboard */}
      <Route path="/admin" element={<AdminLayout requireAdmin={true} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="admins" element={<AdminManagementPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="tasks" element={<TasksAdminPage />} />
        <Route path="attendance" element={<AttendanceSessionsPage />} />
        <Route path="attendance/sessions" element={<AttendanceSessionsPage />} />
        <Route path="attendance/records" element={<AttendanceReportsPage />} />
        <Route path="attendance/reports" element={<AttendanceReportsPage />} />
        <Route path="events" element={<EventsAdminPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="certificates" element={<CertificatesAdminPage />} />
        <Route path="logs" element={<ActivityLogsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Member Portal */}
      <Route path="/dashboard" element={<AdminLayout />}>
        <Route index element={<MemberDashboard />} />
        <Route path="tasks" element={<MemberTasksPage />} />
        <Route path="scan" element={<MemberDashboard />} />
        <Route path="certificates" element={<MemberCertificatesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

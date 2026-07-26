import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  QrCode,
  Award,
  Calendar,
  Image,
  BarChart2,
  FileText,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Cpu,
  UserCheck,
  Search,
  Settings,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const adminMenu = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'] },
    { title: 'Admin Control', path: '/admin/admins', icon: ShieldCheck, roles: ['Super Admin', 'President'] },
    { title: 'Members', path: '/admin/members', icon: Users, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Team Lead'] },
    { title: 'Task Management', path: '/admin/tasks', icon: CheckSquare, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'] },
    { title: 'Attendance Sessions', path: '/admin/attendance/sessions', icon: QrCode, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Team Lead'] },
    { title: 'Attendance Records', path: '/admin/attendance/records', icon: FileText, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'] },
    { title: 'Club Positions', path: '/admin/positions', icon: UserCheck, roles: ['Super Admin', 'President', 'Vice President'] },
    { title: 'Events', path: '/admin/events', icon: Calendar, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Team Lead'] },
    { title: 'Gallery', path: '/admin/gallery', icon: Image, roles: ['Super Admin', 'President', 'Vice President', 'Team Lead'] },
    { title: 'Analytics', path: '/admin/analytics', icon: BarChart2, roles: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer'] },
    { title: 'Certificates', path: '/admin/certificates', icon: Award, roles: ['Super Admin', 'President', 'Vice President', 'Secretary'] },
    { title: 'Activity Logs', path: '/admin/logs', icon: ShieldAlert, roles: ['Super Admin', 'President'] }
  ];

  const memberMenu = [
    { title: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { title: 'My Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { title: 'Scan Attendance', path: '/dashboard/scan', icon: QrCode },
    { title: 'Certificates', path: '/dashboard/certificates', icon: Award },
    { title: 'My Profile', path: '/dashboard/profile', icon: Settings }
  ];

  const menuItems = isAdmin ? adminMenu.filter(item => item.roles.includes(user?.role)) : memberMenu;

  return (
    <aside className={`h-screen sticky top-0 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 z-40 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg text-white tracking-tight">
                ACES<span className="text-blue-500"> Portal</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* User Badge */}
        {!collapsed && user && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <img
              src={(user?.profilePhoto && user.profilePhoto.trim() !== '')
                ? user.profilePhoto
                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/50 bg-slate-800"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-white truncate">{user.name}</h4>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Nav List */}
        <nav className="px-3 mt-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.title : ''}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          {!collapsed && <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout Account</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

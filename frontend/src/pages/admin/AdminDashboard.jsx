import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../../components/common/Badge';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Mail,
  Phone,
  Edit2,
  CheckCircle2,
  Award,
  Clock,
  Upload,
  Trash2,
  Loader2,
  Building,
  UserCheck,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Teams & Positions for Edit Modal
  const [teamsList, setTeamsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    team: '',
    position: '',
    profilePhoto: ''
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    API.get('/teams').then(res => setTeamsList(res.data.teams || [])).catch(() => {});
    API.get('/positions').then(res => setPositionsList(res.data.positions || [])).catch(() => {});
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    API.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEditModal = () => {
    const photoUrl = user?.profilePhoto || defaultAvatar;
    setEditForm({
      name: user?.name || user?.fullName || '',
      phone: user?.phone || '',
      team: user?.team?._id || user?.team || '',
      position: user?.position?._id || user?.position || '',
      profilePhoto: photoUrl
    });
    setPhotoPreview(photoUrl);
    setIsEditModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const photoDataUrl = reader.result;
      setEditForm(prev => ({ ...prev, profilePhoto: photoDataUrl }));
      setPhotoPreview(photoDataUrl);

      // Direct photo upload endpoint POST /api/admin/profile/photo
      setPhotoUploading(true);
      try {
        const res = await API.post('/admin/profile/photo', { profilePhoto: photoDataUrl });
        if (res.data.success) {
          updateUserProfile(res.data.user);
        }
      } catch (err) {
        console.error('Photo upload notice:', err);
      } finally {
        setPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setEditForm(prev => ({ ...prev, profilePhoto: defaultAvatar }));
    setPhotoPreview(defaultAvatar);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await API.put('/admin/profile', editForm);
      if (res.data.success) {
        updateUserProfile(res.data.user);
        setIsEditModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating admin profile');
    } finally {
      setUpdating(false);
    }
  };

  const summary = data?.summary || {};
  const mostActive = data?.mostActiveMembers || [];
  const teamPerf = data?.teamPerformance || [];

  const avatarSrc = (user?.profilePhoto && user.profilePhoto.trim() !== '')
    ? user.profilePhoto
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`;

  const adminPosition = user?.position?.positionName || user?.position?.title || user?.role || 'Super Admin';
  const adminTeam = user?.team?.name || 'Executive Council';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Premium Admin Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          
          {/* Circular Profile Photo */}
          <div className="relative group">
            <img
              src={avatarSrc}
              alt={user?.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/40 shadow-2xl bg-slate-800 group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md" title="Account Active"></span>
          </div>

          {/* User Information */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={user?.role} />
              <span className="inline-block px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
                {adminPosition}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {user?.name || user?.fullName || 'Super Admin'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-500" /> {user?.department || 'Department of Computer Engineering'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> ACES {adminTeam}</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-300 pt-1 font-medium">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> {user?.email}</span>
              {user?.phone ? (
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-500" /> {user.phone}</span>
              ) : null}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                🟢 Active Account
              </span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            <Edit2 className="w-4 h-4 text-blue-500" />
            <span>Edit Profile</span>
          </button>

          <Link
            to="/admin/attendance/sessions"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Session</span>
          </Link>
        </div>

      </motion.div>

      {/* 2. Quick Statistics Cards Below Profile Header */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* 👥 Total Members */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Members</span>
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalMembers || 0}</h2>
            <p className="text-[11px] text-slate-400 font-medium">MongoDB Profiles</p>
          </motion.div>

          {/* 📅 Active Attendance Sessions */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Sessions</span>
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{summary.activeSessions || 0}</h2>
            <p className="text-[11px] text-emerald-500 font-bold">Live QR Sessions</p>
          </motion.div>

          {/* ✅ Attendance Today */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Attendance Today</span>
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{summary.attendanceToday || 0}</h2>
            <p className="text-[11px] text-indigo-400 font-bold">Scans Recorded Today</p>
          </motion.div>

          {/* 📝 Pending Tasks / Events */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Events</span>
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{summary.pendingTasks || 0}</h2>
            <p className="text-[11px] text-amber-400 font-bold">Scheduled Activities</p>
          </motion.div>

          {/* 🏆 Executive Members */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Executive Council</span>
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{summary.executiveMembers || 0}</h2>
            <p className="text-[11px] text-purple-400 font-bold">Club Positions</p>
          </motion.div>

        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Active Members */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Top Active Members</h3>
              <p className="text-xs text-slate-400">Ranked by contribution points in MongoDB</p>
            </div>
            <Link to="/admin/members" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {mostActive.length === 0 ? (
            <EmptyState title="No Members Found" message="Members added to MongoDB will be listed here." />
          ) : (
            <div className="space-y-3">
              {mostActive.map((m, idx) => {
                const photo = (m.profilePhoto && m.profilePhoto.trim() !== '')
                  ? m.profilePhoto
                  : defaultAvatar;

                return (
                  <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-bold text-slate-400 text-xs text-center">#{idx + 1}</span>
                      <img src={photo} alt={m.name} className="w-9 h-9 rounded-full object-cover border border-blue-500/30" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{m.name}</h4>
                        <span className="text-[11px] text-slate-400">{m.rollNumber} • {m.team?.name || 'General Member'}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                      {m.contributionPoints} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Performance */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Team Participation Overview</h3>
              <p className="text-xs text-slate-400">Member counts and attendance metrics</p>
            </div>
            <Link to="/admin/teams" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
              Manage Teams <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {teamPerf.length === 0 ? (
            <EmptyState title="No Teams Found" message="Teams created in MongoDB will be listed here." />
          ) : (
            <div className="space-y-3">
              {teamPerf.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{t.teamName}</h4>
                    <span className="text-xs text-slate-400">{t.memberCount} Members enrolled</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-extrabold text-sm text-indigo-500">{t.totalAttended} Presences</span>
                    <span className="text-[10px] text-slate-400">Avg {t.avgPoints} Points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Edit Admin Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Admin Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Upload Profile Photo */}
          <div className="p-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              📷 Profile Photo (JPG, JPEG, PNG, WEBP max 5MB)
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl group-hover:opacity-80 transition-opacity"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                <Upload className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <span>Upload Photo</span>
              </button>
              {photoPreview !== defaultAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input required type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email (Read-Only)</label>
              <input disabled type="email" value={user?.email || ''} className="w-full px-3.5 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 text-xs text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Role (Read-Only)</label>
              <input disabled type="text" value={user?.role || ''} className="w-full px-3.5 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 text-xs text-slate-400 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input type="text" placeholder="9876543210" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Position</label>
              <select value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                <option value="">Default Position</option>
                {positionsList.map(p => <option key={p._id} value={p._id}>{p.positionName || p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Team</label>
              <select value={editForm.team} onChange={(e) => setEditForm({ ...editForm, team: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                <option value="">Executive Council</option>
                {teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={updating} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import QRScannerModal from '../../components/attendance/QRScannerModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { QrCode, MapPin, Mail, Phone, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      API.get('/attendance/my-history'),
      API.get('/events')
    ])
      .then(([attRes, evRes]) => {
        setHistoryData(attRes.data);
        setEvents(evRes.data.events || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRegisterEvent = async (eventId) => {
    try {
      const res = await API.post(`/events/${eventId}/register`);
      if (res.data.success) {
        alert(res.data.message);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register for event');
    }
  };

  const stats = historyData?.stats || {};
  const records = historyData?.records || [];

  // Dynamic Avatar Logic: Always use MongoDB user.profilePhoto if present; fallback to neutral initials avatar
  const avatarSrc = (user?.profilePhoto && user.profilePhoto.trim() !== '')
    ? user.profilePhoto
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.fullName || 'Member')}`;

  const memberPosition = user?.position?.positionName || user?.position?.title || user?.role || 'Member';
  const memberTeam = user?.team?.name || 'General Member';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Member Profile Overview Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex items-center gap-6 relative z-10">
          {/* ○ Dynamic Profile Photo from MongoDB */}
          <div className="relative">
            <img
              src={avatarSrc}
              alt={user?.name || user?.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/30 shadow-xl bg-slate-800"
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md" title="Account Active"></span>
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
              {memberTeam} • {memberPosition}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {user?.name || user?.fullName || 'Member Profile'} 🚀
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-mono">{user?.rollNumber}</span>
              <span>•</span>
              <span>{user?.department} ({user?.year})</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-500" /> {user?.email}</span>
              {user?.phone ? (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-500" /> {user.phone}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:scale-105 transition-all relative z-10"
        >
          <QrCode className="w-6 h-6" />
          <span>Scan Attendance QR</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Attendance Rate</span>
          <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.percentage || 0}%</h2>
          <p className="text-xs text-slate-400">{stats.myAttended || 0} of {stats.totalSessions || 0} Sessions Attended</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Contribution Points</span>
          <h2 className="text-3xl font-extrabold text-amber-500">{user?.contributionPoints || 0} pts</h2>
          <p className="text-xs text-slate-400">Earned via attendance & event participation</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Assigned Team</span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{memberTeam}</h2>
          <p className="text-xs text-indigo-400 font-semibold">{memberPosition}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Account Status</span>
          <h2 className="text-xl font-extrabold text-emerald-500 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Active Member
          </h2>
          <p className="text-xs text-slate-400">Verified MongoDB User</p>
        </div>
      </div>

      {/* Main Grid: Attendance History & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance History */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">My Attendance History</h3>

          {loading ? (
            <CardSkeleton />
          ) : records.length === 0 ? (
            <EmptyState title="No Attendance Records" message="Scan QR code during an active session to record attendance." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="py-3 px-4">Session Title</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Scan Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.session?.meetingTitle}</td>
                      <td className="py-3 px-4 text-slate-400">{r.session?.venue}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{new Date(r.scanTime).toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Events & Workshops</h3>

          {events.length === 0 ? (
            <EmptyState title="No Events Available" message="Scheduled events will appear here." />
          ) : (
            <div className="space-y-4">
              {events.map((ev) => {
                const isRegistered = ev.registeredMembers?.includes(user?._id);
                return (
                  <div key={ev._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-blue-500">{ev.category}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ev.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {ev.venue}
                    </p>
                    
                    {isRegistered ? (
                      <span className="block text-center py-2 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-xl">
                        ✓ Registered (+20 pts)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterEvent(ev._id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* QR Scanner Camera Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={fetchDashboard}
      />

    </div>
  );
};

export default MemberDashboard;

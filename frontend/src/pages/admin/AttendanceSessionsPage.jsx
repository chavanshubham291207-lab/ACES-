import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import QRGeneratorModal from '../../components/attendance/QRGeneratorModal';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  QrCode,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Users,
  Play,
  Square,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Trash,
  Loader2,
  CheckCircle2,
  Search,
  Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AttendanceSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [recycleBinSessions, setRecycleBinSessions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'recycleBin'
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const [selectedQRSession, setSelectedQRSession] = useState(null);
  const [deletingPermanent, setDeletingPermanent] = useState(false);

  // Toast Notice State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const initialForm = {
    meetingTitle: '',
    meetingType: 'General Body',
    team: '',
    venue: '',
    startTime: '',
    endTime: '',
    qrExpiryMinutes: 30,
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const showToastNotice = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const [actRes, binRes] = await Promise.all([
        API.get('/attendance/sessions'),
        API.get('/attendance/sessions/recycle-bin')
      ]);
      setSessions(actRes.data.sessions || []);
      setRecycleBinSessions(binRes.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    API.get('/teams').then(res => setTeams(res.data.teams || [])).catch(() => {});
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSession(null);
    setFormData(initialForm);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingSession(s);
    setFormData({
      meetingTitle: s.meetingTitle || '',
      meetingType: s.meetingType || 'General Body',
      team: s.team?._id || '',
      venue: s.venue || '',
      startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : '',
      endTime: s.endTime ? new Date(s.endTime).toISOString().slice(0, 16) : '',
      qrExpiryMinutes: 30,
      description: s.description || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSession) {
        const res = await API.put(`/attendance/sessions/${editingSession._id}`, formData);
        if (res.data.success) {
          setIsCreateModalOpen(false);
          showToastNotice('Attendance Session Updated Successfully.');
          fetchSessions();
        }
      } else {
        const res = await API.post('/attendance/sessions', formData);
        if (res.data.success) {
          setIsCreateModalOpen(false);
          setFormData(initialForm);
          showToastNotice('Attendance Session Created Successfully.');
          fetchSessions();
          setSelectedQRSession(res.data.session);
        }
      }
    } catch (err) {
      showToastNotice(err.response?.data?.message || 'Error saving session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDelete = async (sessionId) => {
    setDeletingPermanent(true);
    try {
      const res = await API.delete(`/attendance/sessions/${sessionId}`);
      if (res.data.success) {
        setDeletingSession(null);
        showToastNotice('Attendance Session Moved to Recycle Bin.');
        fetchSessions();
      }
    } catch (err) {
      showToastNotice(err.response?.data?.message || 'Failed to delete session', 'error');
    } finally {
      setDeletingPermanent(false);
    }
  };

  const handlePermanentDelete = async (sessionId) => {
    setDeletingPermanent(true);
    try {
      const res = await API.delete(`/attendance/sessions/${sessionId}/permanent`);
      if (res.data.success) {
        setDeletingSession(null);
        showToastNotice('Attendance Session Deleted Successfully.');
        fetchSessions();
      }
    } catch (err) {
      showToastNotice(err.response?.data?.message || 'Failed to permanently delete session', 'error');
    } finally {
      setDeletingPermanent(false);
    }
  };

  const handleRestore = async (sessionId) => {
    try {
      const res = await API.put(`/attendance/sessions/${sessionId}/restore`);
      if (res.data.success) {
        showToastNotice('Attendance Session Restored Successfully.');
        fetchSessions();
      }
    } catch (err) {
      showToastNotice(err.response?.data?.message || 'Failed to restore session', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await API.put(`/attendance/sessions/${id}/toggle`);
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err) {
      showToastNotice('Error updating session status', 'error');
    }
  };

  const displayList = activeTab === 'active' ? sessions : recycleBinSessions;
  const filteredList = displayList.filter(s =>
    (s.meetingTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.venue || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.meetingType || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all border ${
          toast.type === 'error'
            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
            : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Attendance Sessions Management</h1>
          <p className="text-xs text-slate-500">Manage QR attendance sessions, track live attendance, edit, and recycle deleted sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'active' ? 'recycleBin' : 'active')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              activeTab === 'recycleBin'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>{activeTab === 'active' ? `Recycle Bin (${recycleBinSessions.length})` : 'Active Sessions'}</span>
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Attendance Session
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-card p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search sessions by title, venue, or meeting type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Professional Attendance Sessions Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title={activeTab === 'active' ? "No Active Sessions" : "Recycle Bin is Empty"}
          message={activeTab === 'active' ? "Click 'Create Attendance Session' to start a new attendance session." : "No deleted sessions found in Recycle Bin."}
        />
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3.5 px-6">Session Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time Window</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">QR Status</th>
                  <th className="py-3.5 px-4">Total Attendance</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredList.map((s) => {
                  const isExpired = new Date() > new Date(s.qrExpiryTime);
                  const dateStr = s.startTime ? new Date(s.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                  const startTimeStr = s.startTime ? new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                  const endTimeStr = s.endTime ? new Date(s.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                        {s.meetingTitle}
                        <span className="block text-[10px] text-slate-400 font-normal">{s.team?.name || 'All ACES Members'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-500">{s.meetingType}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{dateStr}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{startTimeStr} - {endTimeStr}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{s.venue}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          s.isActive && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {s.isActive && !isExpired ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">{s.presentCount || 0} Present</td>
                      <td className="py-3.5 px-4 text-slate-500">{s.createdBy?.name || 'Admin'}</td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {activeTab === 'active' ? (
                          <>
                            <button
                              onClick={() => setSelectedQRSession(s)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                              title="👁 View QR Code & Details"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              to={`/admin/attendance/reports?sessionId=${s._id}`}
                              className="inline-block p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                              title="👁 View Attendance Records"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleOpenEditModal(s)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                              title="✏ Edit Session"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingSession(s)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                              title="🗑 Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(s._id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Restore Session"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingSession(s)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                              title="Permanently Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Session Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingSession ? 'Edit Attendance Session' : 'Create Attendance Session'}
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Title *</label>
            <input required type="text" placeholder="e.g. ACES Core Committee Meeting" value={formData.meetingTitle} onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Type</label>
              <select value={formData.meetingType} onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                {['General Body', 'Team Meeting', 'Workshop', 'Event', 'Executive Session'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Team</label>
              <select value={formData.team} onChange={(e) => setFormData({ ...formData, team: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                <option value="">All ACES Members</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue / Location *</label>
              <input required type="text" placeholder="e.g. Auditorium / Lab 402" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">QR Expiry (Minutes)</label>
              <input required type="number" value={formData.qrExpiryMinutes} onChange={(e) => setFormData({ ...formData, qrExpiryMinutes: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingSession ? 'Save Changes' : 'Generate Session & QR')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal Popup */}
      <Modal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        title="Delete Attendance Session?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete "{deletingSession?.meetingTitle}"?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this attendance session?
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold">
              ⚠️ Warning: Permanent deletion will also remove all attendance records linked to this session from MongoDB.
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3">
            {activeTab === 'active' && (
              <button
                type="button"
                disabled={deletingPermanent}
                onClick={() => handleSoftDelete(deletingSession._id)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {deletingPermanent && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Move to Recycle Bin (Soft Delete)</span>
              </button>
            )}

            <button
              type="button"
              disabled={deletingPermanent}
              onClick={() => handlePermanentDelete(deletingSession._id)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {deletingPermanent && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete Permanently</span>
            </button>

            <button
              type="button"
              onClick={() => setDeletingSession(null)}
              className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Dynamic QR Display Modal */}
      {selectedQRSession && (
        <QRGeneratorModal
          isOpen={!!selectedQRSession}
          onClose={() => setSelectedQRSession(null)}
          session={selectedQRSession}
        />
      )}

    </div>
  );
};

export default AttendanceSessionsPage;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Award,
  ShieldCheck,
  Tag
} from 'lucide-react';

const AttendanceReportsPage = () => {
  // Session Grid State
  const [sessions, setSessions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionTeamFilter, setSessionTeamFilter] = useState('');

  // Selected Session Attendance View State
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalEligible: 0,
    presentCount: 0,
    lateCount: 0,
    totalAttended: 0,
    attendancePercentage: 0
  });
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Detail View Filters & Sorting
  const [memberSearch, setMemberSearch] = useState('');
  const [detailTeamFilter, setDetailTeamFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Modals
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  useEffect(() => {
    fetchSessions();
    API.get('/teams').then(res => setTeams(res.data.teams || [])).catch(() => {});
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await API.get('/attendance/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Error loading attendance sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const openSessionDetail = (sessionId) => {
    setActiveSessionId(sessionId);
    setLoadingDetails(true);
    API.get(`/attendance/sessions/${sessionId}`)
      .then(res => {
        setActiveSession(res.data.session);
        setStats(res.data.stats || {});
        setRecords(res.data.records || []);
      })
      .catch(err => alert(err.response?.data?.message || 'Error fetching session attendance'))
      .finally(() => setLoadingDetails(false));
  };

  const handleBackToSessions = () => {
    setActiveSessionId(null);
    setActiveSession(null);
    setRecords([]);
    fetchSessions();
  };

  const handleDeleteRecord = async (id) => {
    setDeleting(true);
    try {
      const res = await API.delete(`/attendance/${id}`);
      if (res.data.success) {
        setDeletingRecordId(null);
        if (activeSessionId) {
          openSessionDetail(activeSessionId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting attendance record');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    const dataToExport = filteredRecords.map((r, idx) => ({
      'Serial No.': idx + 1,
      'Member Name': r.memberName || r.member?.name,
      'Roll Number': r.member?.rollNumber || 'N/A',
      'Team': r.team || r.member?.team?.name || 'General Member',
      'Position': r.position || r.member?.position?.title || 'Member',
      'Status': r.status,
      'Check-in Time': r.checkInTime || new Date(r.scanTime).toLocaleTimeString(),
      'Session Title': activeSession?.meetingTitle,
      'Venue': activeSession?.venue,
      'Date': r.date || new Date(r.scanTime).toLocaleDateString(),
      'Remarks': r.remarks || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Attendance_${activeSession?.meetingTitle || 'Session'}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`ACES Portal - Session Attendance Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Session: ${activeSession?.meetingTitle || 'N/A'} | Venue: ${activeSession?.venue || 'N/A'}`, 14, 22);
    doc.text(`Present: ${stats.totalAttended} / ${stats.totalEligible} (${stats.attendancePercentage}%)`, 14, 28);

    const tableColumn = ['Serial No.', 'Member Name', 'Roll No', 'Team', 'Position', 'Status', 'Check-in Time'];
    const tableRows = filteredRecords.map((r, idx) => [
      idx + 1,
      r.memberName || r.member?.name,
      r.member?.rollNumber || 'N/A',
      r.team || 'General',
      r.position || 'Member',
      r.status,
      r.checkInTime || new Date(r.scanTime).toLocaleTimeString()
    ]);

    doc.autoTable({
      startY: 34,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`Attendance_${activeSession?.meetingTitle || 'Session'}.pdf`);
  };

  // Session Grid Filtered
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.meetingTitle?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
                          s.venue?.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchesTeam = !sessionTeamFilter || (s.team && (s.team._id === sessionTeamFilter || s.team.name === sessionTeamFilter));
    return matchesSearch && matchesTeam;
  });

  // Member Attendance Details Filtered & Sorted
  const filteredRecords = records
    .filter(r => {
      const nameMatch = (r.memberName || r.member?.name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
                        (r.member?.rollNumber || '').toLowerCase().includes(memberSearch.toLowerCase());
      const teamMatch = !detailTeamFilter || r.team === detailTeamFilter || r.member?.team?.name === detailTeamFilter;
      return nameMatch && teamMatch;
    })
    .sort((a, b) => {
      const nameA = (a.memberName || a.member?.name || '').toLowerCase();
      const nameB = (b.memberName || b.member?.name || '').toLowerCase();
      if (sortOrder === 'asc') return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <AnimatePresence mode="wait">
        {!activeSessionId ? (
          
          /* ========================================================= */
          /* VIEW STATE 1: SESSION-WISE CARDS GRID OVERVIEW            */
          /* ========================================================= */
          <motion.div
            key="sessions-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  📋 Session-Wise Attendance System
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Attendance Records</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select an attendance session card below to view detailed member check-in lists.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search Session Title or Venue..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={sessionTeamFilter}
                  onChange={(e) => setSessionTeamFilter(e.target.value)}
                  className="w-full sm:w-56 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Teams</option>
                  {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {/* Session Cards Grid */}
            {loadingSessions ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs font-semibold">Loading attendance sessions from MongoDB...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <EmptyState
                title="No Attendance Sessions Found"
                message="Sessions created by admins will appear here as attendance cards."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => {
                  const startTimeDate = new Date(session.startTime);
                  const formattedDate = startTimeDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  const formattedTime = startTimeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                  const presentCount = session.presentCount || 0;
                  const totalEligible = session.team ? (session.team.memberCount || 50) : 50;

                  return (
                    <motion.div
                      key={session._id}
                      whileHover={{ y: -6 }}
                      className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 hover:border-blue-500/50 transition-all cursor-pointer group"
                      onClick={() => openSessionDetail(session._id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
                            {session.meetingType || 'General Body'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${session.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                            {session.isActive ? '🟢 Active' : 'Closed'}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                          📅 {session.meetingTitle}
                        </h3>

                        <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>📍 {session.venue}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>📆 {formattedDate}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>🕒 {formattedTime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-900 dark:text-white">
                              👥 Present: {presentCount} Members
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-500 shrink-0" />
                            <span>🏷 Team: {session.team?.name || 'All Teams'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSessionDetail(session._id);
                        }}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
                      >
                        <span>➡ View Attendance</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (

          /* ========================================================= */
          /* VIEW STATE 2: DETAILED SESSION ATTENDANCE LIST & TABLE    */
          /* ========================================================= */
          <motion.div
            key="session-details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Top Back Navigation & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleBackToSessions}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Attendance Sessions</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Attendance
                </button>
              </div>
            </div>

            {/* Session Top Header Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                    {activeSession?.meetingType || 'Session Attendance'}
                  </span>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    {activeSession?.meetingTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-sm border border-emerald-500/20">
                    {stats.attendancePercentage}% Turnout Rate
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(activeSession?.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(activeSession?.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeSession?.venue}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Present</span>
                  <span className="font-black text-emerald-500 text-sm">{stats.totalAttended || records.length}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Members</span>
                  <span className="font-black text-blue-500 text-sm">{stats.totalEligible || 50}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Scope</span>
                  <span className="font-bold text-indigo-500">{activeSession?.team?.name || 'All Teams'}</span>
                </div>
              </div>
            </div>

            {/* Member Search & Filters Toolbar */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search Member Name or Roll..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={detailTeamFilter}
                  onChange={(e) => setDetailTeamFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Teams</option>
                  {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="asc">Sort Name (A - Z)</option>
                  <option value="desc">Sort Name (Z - A)</option>
                </select>
              </div>
            </div>

            {/* Professional College ERP Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              {loadingDetails ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-xs font-semibold">Loading session attendance records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <EmptyState
                  title="No Attendance Scans Found"
                  message="Members who check into this session will be listed here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                        <th className="py-4 px-4 w-16 text-center">Serial No.</th>
                        <th className="py-4 px-6">Member Name</th>
                        <th className="py-4 px-4">Roll Number</th>
                        <th className="py-4 px-4">Team</th>
                        <th className="py-4 px-4">Position</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Check-in Time</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {filteredRecords.map((r, idx) => {
                        const memberName = r.memberName || r.member?.name || 'Member';
                        const rollNumber = r.member?.rollNumber || 'N/A';
                        const photoUrl = (r.member?.profilePhoto && r.member.profilePhoto.trim() !== '')
                          ? r.member.profilePhoto
                          : defaultAvatar;

                        return (
                          <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-400 text-center">{idx + 1}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={photoUrl}
                                  alt={memberName}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/30 shadow-md bg-slate-800"
                                />
                                <span className="font-bold text-slate-900 dark:text-white block">{memberName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{rollNumber}</td>
                            <td className="py-4 px-4 font-semibold text-indigo-500">{r.team || r.member?.team?.name || 'General Member'}</td>
                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{r.position || r.member?.position?.title || 'Member'}</td>
                            <td className="py-4 px-4"><StatusBadge status={r.status} /></td>
                            <td className="py-4 px-4 font-mono text-slate-500">{r.checkInTime || new Date(r.scanTime).toLocaleTimeString()}</td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => setDeletingRecordId(r._id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                                title="Delete Attendance Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Record Confirmation Modal */}
      {deletingRecordId && (
        <Modal
          isOpen={!!deletingRecordId}
          onClose={() => setDeletingRecordId(null)}
          title="Delete Attendance Record?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Attendance Record?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete this member attendance record from MongoDB Atlas?
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingRecordId(null)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteRecord(deletingRecordId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AttendanceReportsPage;

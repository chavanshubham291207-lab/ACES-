import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const PWAQRScanHandlerPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (!token) {
      setError('Invalid attendance link. No QR token provided.');
      setLoading(false);
      return;
    }

    verifyToken(token);
  }, [user, authLoading, token]);

  const verifyToken = async (qrToken) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/attendance/verify-qr/${qrToken}`);
      if (res.data.success) {
        setConfirmationData(res.data.confirmationData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid, expired, or closed QR session.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await API.post('/attendance/submit', {
        qrToken: confirmationData.qrToken,
        sessionId: confirmationData.sessionId,
        remarks
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || '✅ Attendance marked successfully.');
        setCompleted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="pt-28 pb-16 px-4 max-w-lg mx-auto w-full flex-1 flex flex-col justify-center">
        
        {authLoading || loading ? (
          <div className="text-center p-8 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Verifying signed QR token with MongoDB...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl border border-rose-500/20 text-center space-y-4 bg-slate-900/90"
          >
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">QR Verification Failed</h2>
            <p className="text-xs text-rose-400 font-medium">{error}</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors pt-2">
              <ArrowLeft className="w-4 h-4" /> Go to Member Portal
            </Link>
          </motion.div>
        ) : completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl border border-emerald-500/20 text-center space-y-4 bg-slate-900/90"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Attendance Marked!</h2>
            <p className="text-xs text-emerald-400 font-bold">{successMsg}</p>
            <Link to="/dashboard" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all pt-2">
              Go to Member Dashboard
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-extrabold text-2xl text-white">Attendance Confirmation</h2>
              <p className="text-xs text-slate-400">Review auto-filled details before saving to MongoDB.</p>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <img
                src={confirmationData?.profilePhoto}
                alt={confirmationData?.memberName}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50"
              />
              <div>
                <h4 className="font-bold text-base text-white">{confirmationData?.memberName}</h4>
                <span className="text-xs font-mono text-slate-400 block">{confirmationData?.rollNumber}</span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase">
                  {confirmationData?.memberTeam} • {confirmationData?.memberPosition}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">📅 Date</span>
                <span className="font-mono text-slate-200">{confirmationData?.date}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">🕒 Time</span>
                <span className="font-mono text-slate-200">{confirmationData?.checkInTime}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">📍 Venue</span>
                <span className="font-bold text-slate-200">{confirmationData?.venue}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">🎯 Type</span>
                <span className="font-bold text-indigo-400">{confirmationData?.meetingType}</span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">📚 Meeting Title</span>
                <span className="font-extrabold text-sm text-white">{confirmationData?.meetingTitle}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">📝 Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Add optional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  to="/dashboard"
                  className="flex-1 py-3.5 text-center rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Attendance'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default PWAQRScanHandlerPage;

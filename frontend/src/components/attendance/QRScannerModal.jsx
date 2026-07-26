import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import API from '../../services/api';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, AlertCircle, Loader2, Camera, ShieldCheck, Upload, Lock, FileImage, RefreshCw } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onSuccess }) => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step State: 'SCAN', 'CONFIRM', 'SUCCESS'
  const [step, setStep] = useState('SCAN');
  const [confirmationData, setConfirmationData] = useState(null);
  
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [isSecure, setIsSecure] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef(null);

  // Check if browser context is secure (HTTPS or localhost)
  useEffect(() => {
    const checkSecureContext = () => {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';
      const secure = window.isSecureContext || isLocal || isHttps;
      setIsSecure(secure);
    };
    checkSecureContext();
  }, []);

  // Initialize Web Camera scanner only in secure context
  useEffect(() => {
    let html5QrcodeInstance = null;

    if (isOpen && step === 'SCAN' && isSecure) {
      const elementId = 'pwa-qr-reader';
      
      const timer = setTimeout(async () => {
        try {
          html5QrcodeInstance = new Html5Qrcode(elementId);
          const cameraConfig = { facingMode: 'environment' }; // Rear camera preference
          
          await html5QrcodeInstance.start(
            cameraConfig,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (html5QrcodeInstance && html5QrcodeInstance.isScanning) {
                html5QrcodeInstance.stop().then(() => {
                  handleVerifyToken(decodedText);
                }).catch(() => handleVerifyToken(decodedText));
              }
            },
            () => {}
          );
          setCameraActive(true);
        } catch (e) {
          setCameraActive(false);
          // Graceful handling of camera permission denied or insecure origin
          if (e?.name === 'NotAllowedError') {
            setError('Camera permission was denied. Please allow camera access in browser settings.');
          } else if (e?.name === 'NotFoundError') {
            setError('No back camera found on this device.');
          } else {
            console.warn('Camera setup notice:', e);
          }
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeInstance && html5QrcodeInstance.isScanning) {
          html5QrcodeInstance.stop().catch(() => {});
        }
      };
    }
  }, [isOpen, step, isSecure]);

  // Image file QR scanner fallback for development / HTTP
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setLoading(true);
    try {
      const html5Qrcode = new Html5Qrcode('pwa-qr-reader-temp');
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleVerifyToken(decodedText);
    } catch (err) {
      setError('Could not detect a valid QR code in the uploaded image. Please try another image.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (tokenStr) => {
    setError('');
    setLoading(true);
    try {
      let rawToken = tokenStr;
      if (tokenStr.includes('token=')) {
        rawToken = tokenStr.split('token=')[1].split('&')[0];
      } else if (tokenStr.includes('/')) {
        rawToken = tokenStr.split('/').pop();
      }
      
      const res = await API.get(`/attendance/verify-qr/${rawToken.trim()}`);
      
      if (res.data.success) {
        setConfirmationData(res.data.confirmationData);
        setStep('CONFIRM');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired QR Code.');
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
        setStep('SUCCESS');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('SCAN');
    setConfirmationData(null);
    setManualToken('');
    setRemarks('');
    setError('');
    setSuccessMsg('');
    setCameraActive(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetModal} title="Web Attendance Scanner">
      <div id="pwa-qr-reader-temp" style={{ display: 'none' }}></div>
      <AnimatePresence mode="wait">
        
        {/* STEP 1: CAMERA / FILE SCANNER / MANUAL CODE */}
        {step === 'SCAN' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {error && (
              <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* HTTPS Warning Notice for HTTP Development */}
            {!isSecure ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> HTTPS Required for Live Camera
                </div>
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  Camera scanning requires HTTPS. Please open the deployed HTTPS version or upload a QR image below.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" /> Upload QR Screenshot / Image
                </button>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                  <Camera className="w-3.5 h-3.5" /> Rear Camera Active
                </div>
                <p className="text-xs text-slate-400">Point your camera at the attendance QR code.</p>
              </div>
            )}

            {/* Camera Frame */}
            {isSecure && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 p-2 shadow-inner">
                <div id="pwa-qr-reader" className="w-full text-white overflow-hidden rounded-2xl"></div>
              </div>
            )}

            {/* Upload File Fallback Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <FileImage className="w-4 h-4 text-blue-400" /> Scan QR Image File
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-700 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-widest absolute">Or Manual Link / Code</span>
            </div>

            {/* Manual Entry */}
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyToken(manualToken); }} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste token or URL..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !manualToken}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: ATTENDANCE CONFIRMATION POPUP MODAL */}
        {step === 'CONFIRM' && confirmationData && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Attendance Confirmation</h3>
              <p className="text-xs text-slate-400">Review auto-filled details before saving to MongoDB.</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile & Auto-filled Read-Only Card */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <img
                  src={(confirmationData.profilePhoto && confirmationData.profilePhoto.trim() !== '')
                    ? confirmationData.profilePhoto
                    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(confirmationData.memberName || 'Member')}`}
                  alt={confirmationData.memberName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-md bg-slate-800"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{confirmationData.memberName}</h4>
                  <span className="text-xs font-mono text-slate-400 block">{confirmationData.rollNumber}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold text-[10px] uppercase">
                    {confirmationData.memberTeam} • {confirmationData.memberPosition}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">📅 Date</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{confirmationData.date}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">🕒 Time</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{confirmationData.checkInTime}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">📍 Venue</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{confirmationData.venue}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">🎯 Category</span>
                  <span className="font-bold text-indigo-500">{confirmationData.meetingType}</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">📚 Meeting Title</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{confirmationData.meetingTitle}</span>
                </div>
              </div>

            </div>

            <form onSubmit={handleConfirmAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">📝 Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Add optional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('SCAN')}
                  className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Attendance'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS ANIMATION STATE */}
        {step === 'SUCCESS' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Attendance Marked!</h3>
            <p className="text-xs text-emerald-500 font-bold">{successMsg}</p>
            
            <button
              onClick={resetModal}
              className="px-8 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Close Window
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </Modal>
  );
};

export default QRScannerModal;

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../common/Modal';
import { Clock, MapPin, Users, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';

const QRGeneratorModal = ({ isOpen, onClose, session }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session || !session.qrExpiryTime) return;

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((new Date(session.qrExpiryTime) - new Date()) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft === 0;

  // Signed JWT QR URL
  const qrUrl = session.qrUrl || `http://localhost:3000/attendance/scan?token=${session.qrToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dynamic Attendance QR Code" maxWidth="max-w-md">
      <div className="text-center space-y-6">
        
        {/* Meeting Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
          <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">{session.meetingTitle}</h4>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {session.venue}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-500" /> {session.team?.name || 'All Members'}</span>
          </div>
        </div>

        {/* URL-Based QR Code Container */}
        <div className="relative inline-block p-6 bg-white rounded-3xl shadow-xl border border-slate-200">
          {isExpired ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center bg-rose-50 text-rose-600 rounded-2xl p-4">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p className="font-bold text-base">QR Code Expired</p>
              <p className="text-xs text-rose-500 mt-1">Generate a new session to refresh the signed JWT QR code.</p>
            </div>
          ) : (
            <QRCodeSVG
              value={qrUrl}
              size={240}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        {/* Expiry Timer */}
        <div className="flex items-center justify-center gap-2 text-sm font-semibold">
          <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-amber-500 animate-pulse'}`} />
          <span className="text-slate-600 dark:text-slate-400">
            {isExpired ? 'Expired' : `Expires in: ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`}
          </span>
        </div>

        {/* Copy Link Action for Testing */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
            {qrUrl}
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Scan using any mobile camera or browser to open the attendance verification portal.
        </p>

      </div>
    </Modal>
  );
};

export default QRGeneratorModal;

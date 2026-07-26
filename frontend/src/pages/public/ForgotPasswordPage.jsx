import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          
          <h2 className="text-xl font-bold text-white">Reset ACES Password</h2>
          <p className="text-xs text-slate-400">Enter your registered email address to generate a password reset token.</p>

          {message ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-xs space-y-2">
                <CheckCircle2 className="w-6 h-6" />
                <p className="font-bold">{message}</p>
                <p className="font-mono bg-slate-950 p-2 rounded text-[11px] text-emerald-300">
                  Token: {resetToken}
                </p>
              </div>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="block text-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Proceed to Password Reset
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="member@aces.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl"
              >
                {loading ? 'Sending...' : 'Request Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { motion } from 'framer-motion';
import { LogIn, Users, Shield, Award, Calendar, Loader2 } from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalTeams: 0,
    totalExecutiveMembers: 0,
    totalEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/public-stats')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error('Failed to fetch landing stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-4xl w-full mx-auto relative z-10 my-auto py-12 flex flex-col items-center space-y-10">
        
        {/* 1. Official ACES Logo Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src="/aces_logo.jpg"
              alt="Official ACES Logo - Association of Computer Engineering Students"
              className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-[18px] object-cover shadow-[0_0_35px_rgba(59,130,246,0.4)] border-2 border-blue-500/30 hover:scale-105 transition-transform"
            />
          </motion.div>

          <div className="space-y-1.5">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
              ACES
            </h1>
            <p className="text-sm sm:text-base font-bold text-blue-400 tracking-wide uppercase">
              Association of Computer Engineering Students
            </p>
            <div className="pt-1 text-xs sm:text-sm text-slate-400 font-medium space-y-0.5">
              <p className="font-semibold text-slate-300">Department of Computer Engineering</p>
              <p className="text-slate-400">JSPM Rajarshi Shahu College of Engineering</p>
            </div>
          </div>
        </motion.div>

        {/* 2. Tagline & Portal Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-3 max-w-2xl"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight">
            Empowering Computer Engineers <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              To Innovate & Lead.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal px-4">
            The official ACES Portal for attendance management, member management, task assignment,
            executive committee operations, and technical club activities.
          </p>
        </motion.div>

        {/* 3. Single Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/login"
            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 backdrop-blur-xl border border-blue-400/30 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Login to Portal</span>
          </Link>
        </motion.div>

        {/* 4. Live Statistics Fetched Directly from MongoDB */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full pt-6"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Portal Metrics from MongoDB</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full">
            
            {/* Stat 1: Total Members */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-blue-500/40 transition-colors shadow-lg">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-400 my-1" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalMembers}</span>
              )}
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Members</span>
            </div>

            {/* Stat 2: Total Teams */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-blue-500/40 transition-colors shadow-lg">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400 my-1" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalTeams}</span>
              )}
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Teams</span>
            </div>

            {/* Stat 3: Total Executive Members */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-blue-500/40 transition-colors shadow-lg">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-400 my-1" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalExecutiveMembers}</span>
              )}
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Executive Members</span>
            </div>

            {/* Stat 4: Total Events */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-blue-500/40 transition-colors shadow-lg">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400 my-1" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalEvents}</span>
              )}
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Events</span>
            </div>

          </div>
        </motion.div>

      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 text-[11px] text-slate-500 font-medium py-4">
        © {new Date().getFullYear()} ACES - Association of Computer Engineering Students. All Rights Reserved.
      </footer>

    </div>
  );
};

export default LandingPage;

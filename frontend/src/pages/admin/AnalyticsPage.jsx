import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart2, TrendingUp, Users, Award, ShieldCheck } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><CardSkeleton /></div>;

  const monthlyStats = data?.monthlyStats || [];
  const teamPerformance = data?.teamPerformance || [];
  const mostActive = data?.mostActiveMembers || [];
  const leastActive = data?.leastActiveMembers || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Club Analytics & Reports</h1>
        <p className="text-xs text-slate-500">Visual performance trends, team contributions, and member engagement statistics.</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Attendance & Event Trends */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Monthly Attendance Trend (%)
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="avgAttendance" name="Avg Attendance %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" /> Team Participation Breakdown
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="teamName" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="totalAttended" name="Total Attended" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Most & Least Active Members Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Active */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" /> Most Active Members (Top 5)
          </h3>
          <div className="space-y-3">
            {mostActive.map((m, idx) => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">#{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</h4>
                    <span className="text-[10px] text-slate-400">{m.rollNumber} • {m.team?.name || 'Member'}</span>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  {m.contributionPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Least Active */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" /> Least Active Members (Attention Required)
          </h3>
          <div className="space-y-3">
            {leastActive.map((m, idx) => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">#{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</h4>
                    <span className="text-[10px] text-slate-400">{m.rollNumber} • {m.team?.name || 'Member'}</span>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400">
                  {m.contributionPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsPage;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { ShieldAlert, Search, Filter } from 'lucide-react';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    let url = `/analytics/activity-logs?search=${search}`;
    if (moduleFilter) url += `&module=${moduleFilter}`;

    API.get(url)
      .then(res => setLogs(res.data.logs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Security & Audit Logs</h1>
        <p className="text-xs text-slate-500">Audit trail logging for every create, update, delete, and security operation.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
        >
          <option value="">All Modules</option>
          {['Auth', 'Member Management', 'Team Management', 'Club Positions', 'Attendance', 'Events', 'System'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : logs.length === 0 ? (
        <EmptyState title="No activity logs" message="No audit records match your filters." />
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-6">Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                      {log.userName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-500">{log.module}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{log.action}</td>
                    <td className="py-3.5 px-6 text-slate-400">{log.details}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityLogsPage;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { StatusBadge, RoleBadge } from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  Lock,
  Mail,
  Search,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react';

const ADMIN_ROLES = [
  'Super Admin',
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Team Lead',
  'Faculty Coordinator'
];

const AdminManagementPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team Lead',
    department: 'Computer Engineering',
    year: 'BE',
    status: 'active'
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAdmins = () => {
    setLoading(true);
    API.get('/users?isExecutive=true')
      .then(res => {
        setAdmins(res.data.users || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await API.post('/users', formData);
      if (res.data.success) {
        setSuccessMsg('Admin account created successfully in MongoDB!');
        fetchAdmins();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setFormData({ name: '', email: '', password: '', role: 'Team Lead', department: 'Computer Engineering', year: 'BE', status: 'active' });
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin.');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await API.put(`/users/${selectedAdmin._id}`, formData);
      if (res.data.success) {
        setSuccessMsg('Admin details updated successfully!');
        fetchAdmins();
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin.');
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete Admin account "${name}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        fetchAdmins();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete admin.');
      }
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await API.put(`/users/${admin._id}`, { status: newStatus });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change status.');
    }
  };

  const handleSystemReset = async () => {
    setResetting(true);
    try {
      const res = await API.post('/admin/profile/reset-system');
      if (res.data.success) {
        setIsResetModalOpen(false);
        alert('System reset completed successfully. The portal is now ready for new data.');
        navigate('/admin');
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing system data reset');
    } finally {
      setResetting(false);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      department: admin.department || 'Computer Engineering',
      year: admin.year || 'BE',
      status: admin.status
    });
    setIsEditModalOpen(true);
  };

  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> System Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage executive council members, role permissions, and access controls in MongoDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset System Data</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setFormData({ name: '', email: '', password: '', role: 'Team Lead', department: 'Computer Engineering', year: 'BE', status: 'active' });
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={fetchAdmins}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Admins Table */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading admin accounts from MongoDB...</div>
        ) : filteredAdmins.length === 0 ? (
          <EmptyState title="No Admin Accounts Found" message="Executive profiles will be listed here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-4 px-6">Admin Member</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created By</th>
                  <th className="py-4 px-6">Created At</th>
                  {isSuperAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredAdmins.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={a.profilePhoto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + a.name} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.name}</h4>
                          <span className="text-slate-400 font-mono text-[11px]">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <RoleBadge role={a.role} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {a.createdBy?.name ? `${a.createdBy.name}` : 'System'}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>

                    {isSuperAdmin && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(a)}
                            title={a.status === 'active' ? 'Deactivate' : 'Activate'}
                            className={`p-2 rounded-xl border transition-colors ${
                              a.status === 'active'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                            }`}
                          >
                            {a.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {a.role !== 'Super Admin' && (
                            <button
                              onClick={() => handleDeleteAdmin(a._id, a.name)}
                              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SYSTEM RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Reset System?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Reset System?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This action will permanently remove all club data and prepare the system for a fresh start. This cannot be undone.
              </p>
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-[11px] font-bold text-left space-y-1 border border-amber-500/20">
                <p>• All Members, Tasks, Sessions & Attendance logs will be deleted.</p>
                <p>• Super Admin account (admin@aces.org) will be preserved.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleSystemReset}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset System'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE ADMIN MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Executive Admin Account"
      >
        {error && <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl text-xs mb-4">{error}</div>}
        {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs mb-4">{successMsg}</div>}

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Prof. Alice Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Unique)</label>
            <input
              type="email"
              required
              placeholder="alice@aces.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Executive Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            Create Admin Account in MongoDB
          </button>
        </form>
      </Modal>

      {/* EDIT ADMIN MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Admin: ${selectedAdmin?.name}`}
      >
        {error && <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl text-xs mb-4">{error}</div>}
        {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs mb-4">{successMsg}</div>}

        <form onSubmit={handleUpdateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Change Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            Save Admin Updates
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default AdminManagementPage;

import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import { RoleBadge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Users, Plus, Search, Filter, Edit, Trash2, Mail, Phone, Upload, Image as ImageIcon, Power, Loader2 } from 'lucide-react';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const fileInputRef = useRef(null);
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  const initialFormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    department: 'Computer Engineering',
    year: 'TE',
    team: '',
    position: '',
    role: 'Member',
    profilePhoto: '',
    linkedin: '',
    github: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [photoPreview, setPhotoPreview] = useState(defaultAvatar);
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    let url = `/users?search=${search}`;
    if (filterTeam) url += `&team=${filterTeam}`;
    if (filterRole) url += `&role=${filterRole}`;

    API.get(url)
      .then(res => setMembers(res.data.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [search, filterTeam, filterRole]);

  useEffect(() => {
    API.get('/teams').then(res => setTeams(res.data.teams || [])).catch(() => {});
    API.get('/positions').then(res => setPositions(res.data.positions || [])).catch(() => {});
  }, []);

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      const photoUrl = member.profilePhoto || defaultAvatar;
      setFormData({
        name: member.name || member.fullName || '',
        email: member.email || '',
        password: '',
        phone: member.phone || '',
        rollNumber: member.rollNumber || '',
        department: member.department || 'Computer Engineering',
        year: member.year || 'TE',
        team: member.team?._id || '',
        position: member.position?._id || '',
        role: member.role || 'Member',
        profilePhoto: photoUrl,
        linkedin: member.linkedin || '',
        github: member.github || '',
        status: member.status || 'Active'
      });
      setPhotoPreview(photoUrl);
    } else {
      setEditingMember(null);
      setFormData(initialFormState);
      setPhotoPreview(defaultAvatar);
    }
    setIsModalOpen(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: defaultAvatar }));
    setPhotoPreview(defaultAvatar);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMember) {
        await API.put(`/users/${editingMember._id}`, formData);
      } else {
        await API.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving member profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.put(`/users/${id}/status`);
      if (res.data.success) {
        fetchMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this member profile?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Member Directory</h1>
          <p className="text-xs text-slate-500">Manage member profiles, profile photos, team assignments, roles, and status.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Member
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
        >
          <option value="">All Teams</option>
          {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
        >
          <option value="">All Roles</option>
          {['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead', 'Member'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Members Directory Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : members.length === 0 ? (
        <EmptyState title="No members found" message="Try searching with a different term or filter." />
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3.5 px-6">Member Profile</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Role & Team</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {members.map((m) => {
                  const isActive = m.isActive !== false && (m.status || '').toLowerCase() !== 'inactive';
                  const photoUrl = m.profilePhoto || defaultAvatar;

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoUrl}
                            alt={m.name}
                            loading="lazy"
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/30 shadow-md"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{m.name || m.fullName}</span>
                            <span className="text-[11px] text-slate-400">{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{m.rollNumber}</td>
                      <td className="py-3.5 px-4 space-y-1">
                        <RoleBadge role={m.role} />
                        <span className="block text-[10px] text-slate-400">{m.team?.name || 'General Member'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {m.position?.title || m.position?.positionName || m.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(m._id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle Activate / Deactivate account status"
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button onClick={() => handleOpenModal(m)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors" title="Edit Member & Photo">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m._id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors" title="Delete Member">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Member Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Member Profile' : 'Add New Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Prominent Mandatory Profile Photo Upload Box */}
          <div className="p-5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              📷 Profile Photo (JPG, JPEG, PNG, WEBP max 5MB)
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/50 shadow-xl group-hover:opacity-80 transition-opacity"
              />
              <span className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                <Upload className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                + Upload Photo
              </button>
              {photoPreview !== defaultAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input required type="text" placeholder="e.g. Shubham Chavan" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input required type="email" placeholder="shubham@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input type="text" placeholder="9876543210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number *</label>
              <input required type="text" placeholder="CE101" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
              <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                {['FE', 'SE', 'TE', 'BE', 'Alumni'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                {['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead', 'Member'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Team</label>
              <select value={formData.team} onChange={(e) => setFormData({ ...formData, team: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                <option value="">None</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Position</label>
              <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                <option value="">Member</option>
                {positions.map(p => <option key={p._id} value={p._id}>{p.positionName || p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password {editingMember && '(Leave blank to keep current)'}</label>
              <input type={editingMember ? "password" : "text"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default MembersPage;

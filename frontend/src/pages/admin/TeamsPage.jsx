import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Briefcase, Plus, Users, Edit, Trash2, ShieldCheck, UserCheck } from 'lucide-react';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const initialForm = {
    name: '',
    description: '',
    lead: '',
    banner: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeams = () => {
    setLoading(true);
    API.get('/teams')
      .then(res => setTeams(res.data.teams || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeams();
    API.get('/users').then(res => setMembers(res.data.users || [])).catch(() => {});
  }, []);

  const handleOpenModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name || '',
        description: team.description || '',
        lead: team.lead?._id || '',
        banner: team.banner || ''
      });
    } else {
      setEditingTeam(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await API.put(`/teams/${editingTeam._id}`, formData);
      } else {
        await API.post('/teams', formData);
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving team');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await API.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting team');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Team Management</h1>
          <p className="text-xs text-slate-500">Configure ACES teams, lead assignments, and department banners.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div key={t._id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-40 relative">
                  <img src={t.banner} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => handleOpenModal(t)} className="p-2 bg-slate-900/80 text-white rounded-xl hover:bg-blue-600 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 bg-slate-900/80 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">{t.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.description}</p>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Lead</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-white">{t.lead?.name || 'No Lead Assigned'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" /> {t.membersCount || 0} Members</span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Active Wing</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeam ? 'Edit Team' : 'Create Team'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Team Name</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Team Lead</label>
            <select value={formData.lead} onChange={(e) => setFormData({ ...formData, lead: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
              <option value="">Select Member</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.role})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Image URL</label>
            <input type="text" placeholder="https://..." value={formData.banner} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md">Save Team</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default TeamsPage;

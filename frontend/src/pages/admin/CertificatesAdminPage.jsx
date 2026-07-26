import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import { Award, Plus, Trash2, Download } from 'lucide-react';

const CertificatesAdminPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    recipient: '',
    fileUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCerts = () => {
    API.get('/certificates').then(res => setCertificates(res.data.certificates || [])).catch(() => {});
  };

  useEffect(() => {
    fetchCerts();
    API.get('/users').then(res => setMembers(res.data.users || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/certificates', formData);
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchCerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing certificate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete certificate?')) return;
    try {
      await API.delete(`/certificates/${id}`);
      fetchCerts();
    } catch (err) {
      alert('Error deleting certificate');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Certificate Issuer</h1>
          <p className="text-xs text-slate-500">Issue official ACES certificates for workshops and hackathons.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.map((c) => (
          <div key={c._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">{c.title}</h3>
              <p className="text-xs text-slate-400">{c.description}</p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs space-y-1">
                <p className="text-slate-400">Recipient:</p>
                <p className="font-bold text-slate-800 dark:text-white">{c.recipient?.name} ({c.recipient?.rollNumber})</p>
                <p className="text-[10px] text-slate-500">Issued: {new Date(c.issueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <a href={c.fileUrl} target="_blank" rel="noreferrer" className="w-full py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-center font-bold text-xs rounded-xl flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" /> Preview Certificate
            </a>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Certificate">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Title</label>
            <input required type="text" placeholder="e.g. Hack-ACES Winner Certificate" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Member</label>
            <select required value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
              <option value="">Select Member</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.rollNumber})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Image / PDF Link</label>
            <input required type="text" placeholder="https://..." value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Achievement Remarks</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md">Issue Certificate</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default CertificatesAdminPage;

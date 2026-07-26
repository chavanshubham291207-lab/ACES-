import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import { Image, Plus, Trash2 } from 'lucide-react';

const GalleryAdminPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', category: 'Events' });

  const fetchGallery = () => {
    setLoading(true);
    API.get('/gallery')
      .then(res => setItems(res.data.items || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/gallery', formData);
      setIsModalOpen(false);
      setFormData({ title: '', imageUrl: '', category: 'Events' });
      fetchGallery();
    } catch (err) {
      alert('Error uploading gallery image');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete image?')) return;
    try {
      await API.delete(`/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      alert('Error deleting image');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Gallery Showcase</h1>
          <p className="text-xs text-slate-500">Upload photos to the public homepage gallery.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="relative group rounded-3xl overflow-hidden h-64 border border-slate-200 dark:border-slate-800 bg-slate-900">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent p-4 flex flex-col justify-between">
              <div className="flex justify-end">
                <button onClick={() => handleDelete(item._id)} className="p-2 bg-slate-900/80 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400">{item.category}</span>
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Gallery Image">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image Title</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Tag</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
              {['Events', 'Workshops', 'Hackathons', 'Team', 'Campus'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Direct Image URL</label>
            <input required type="text" placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md">Upload Photo</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GalleryAdminPage;

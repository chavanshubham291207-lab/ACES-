import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, Search, Upload, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Faculty Coordinator',
  'Technical Head',
  'Technical Team Lead',
  'Design Head',
  'Content Head',
  'PR Head',
  'Social Media Head',
  'Event Head',
  'Team Lead'
];

const PositionsPage = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  
  const [memberName, setMemberName] = useState('');
  const [positionName, setPositionName] = useState('President');
  const [customPosition, setCustomPosition] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/positions');
      setPositions(res.data.positions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPosition(null);
    setMemberName('');
    setPositionName('President');
    setCustomPosition('');
    setPhoto('');
    setPhotoPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pos) => {
    setEditingPosition(pos);
    setMemberName(pos.memberName || '');
    
    const posName = pos.positionName || pos.title || '';
    if (PRESET_POSITIONS.includes(posName)) {
      setPositionName(posName);
      setCustomPosition('');
    } else {
      setPositionName('Custom');
      setCustomPosition(posName);
    }

    setPhoto(pos.photo || '');
    setPhotoPreview(pos.photo || '');
    setIsModalOpen(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!photo) {
      alert('Please upload a member photo.');
      return;
    }
    if (!memberName.trim()) {
      alert('Please enter member name.');
      return;
    }

    const finalPosition = positionName === 'Custom' ? customPosition.trim() : positionName;
    if (!finalPosition) {
      alert('Please enter or select a position name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPosition) {
        // Edit Position
        const res = await API.put(`/positions/${editingPosition._id}`, {
          memberName: memberName.trim(),
          positionName: finalPosition,
          photo
        });
        if (res.data.success) {
          setIsModalOpen(false);
          fetchPositions();
        }
      } else {
        // Create Position
        const res = await API.post('/positions', {
          memberName: memberName.trim(),
          positionName: finalPosition,
          photo
        });
        if (res.data.success) {
          setIsModalOpen(false);
          fetchPositions();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving member position.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await API.delete(`/positions/${id}`);
      fetchPositions();
    } catch (err) {
      alert('Error deleting position');
    }
  };

  const handleReorder = async (currentIndex, direction) => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= positions.length) return;

    const newPositions = [...positions];
    const [movedItem] = newPositions.splice(currentIndex, 1);
    newPositions.splice(targetIndex, 0, movedItem);

    setPositions(newPositions);

    const orderedIds = newPositions.map(p => p._id);
    try {
      await API.put('/positions/reorder', { orderedIds });
    } catch (err) {
      console.error(err);
      fetchPositions();
    }
  };

  const filteredPositions = positions.filter(p => {
    const nameMatch = (p.memberName || '').toLowerCase().includes(searchName.toLowerCase());
    const posMatch = (p.positionName || p.title || '').toLowerCase().includes(searchPosition.toLowerCase());
    return nameMatch && posMatch;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            Executive Committee Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Club Positions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage executive council members, circular profile photos, and role positions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Executive Member
        </button>
      </div>

      {/* Dual Search Filters (Name & Position) */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by Member Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by Position Name..."
            value={searchPosition}
            onChange={(e) => setSearchPosition(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Executive Members Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-semibold">Loading executive members directly from MongoDB...</p>
        </div>
      ) : filteredPositions.length === 0 ? (
        <EmptyState
          title="No Executive Members Found"
          message="Click 'Add Executive Member' to add club council members."
          actionLabel="+ Add Executive Member"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPositions.map((pos, idx) => {
              const name = pos.memberName || 'Executive Member';
              const position = pos.positionName || pos.title || 'Position';
              const photoUrl = pos.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

              return (
                <motion.div
                  key={pos._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-between text-center space-y-5 shadow-lg hover:shadow-2xl transition-all group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl"
                >
                  
                  {/* Position Card Content */}
                  <div className="flex flex-col items-center space-y-3 pt-2">
                    {/* Circular Photo */}
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={name}
                        loading="lazy"
                        className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/20 group-hover:border-blue-500 shadow-xl transition-all group-hover:scale-105"
                      />
                      <span className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Member Name */}
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                      {name}
                    </h3>

                    {/* Position Name */}
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                      {position}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleReorder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(idx, 'down')}
                        disabled={idx === filteredPositions.length - 1}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(pos)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pos._id, name)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPosition ? 'Edit Executive Member' : 'Add Executive Member'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          
          {/* 1. Upload Member Photo */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 space-y-1 group-hover:border-blue-500 transition-colors">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Photo
            </button>
          </div>

          {/* 2. Member Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Member Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Shubham Chavan"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 3. Position Name Dropdown & Custom Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Position Name <span className="text-rose-500">*</span>
            </label>
            <select
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {PRESET_POSITIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="Custom">Custom Position...</option>
            </select>

            {positionName === 'Custom' && (
              <input
                required
                type="text"
                placeholder="Enter custom position name..."
                value={customPosition}
                onChange={(e) => setCustomPosition(e.target.value)}
                className="mt-2.5 w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* Buttons: Upload Photo / Save / Cancel */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default PositionsPage;

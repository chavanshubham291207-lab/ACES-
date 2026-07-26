import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { RoleBadge } from '../../components/common/Badge';
import { User, Mail, Phone, Linkedin, Github, Award, CheckCircle2, ShieldCheck, Upload, Trash2, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    profilePhoto: user?.profilePhoto || defaultAvatar,
    password: ''
  });

  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || defaultAvatar);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    // Check allowed format: JPG, JPEG, PNG, WEBP
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
    setLoading(true);
    setMessage('');
    try {
      const res = await API.put('/auth/profile', formData);
      if (res.data.success) {
        updateUserProfile(res.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Profile</h1>
        <p className="text-xs text-slate-500">Manage your contact information, profile photo, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Overview Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          
          <div className="relative inline-block group">
            <img
              src={photoPreview}
              alt={user?.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/30 mx-auto shadow-xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md transition-transform hover:scale-110"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.rollNumber}</p>
            <div className="mt-2 flex justify-center">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs space-y-2 border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-bold text-slate-800 dark:text-white">{user?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Year:</span>
              <span className="font-bold text-slate-800 dark:text-white">{user?.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Team Domain:</span>
              <span className="font-bold text-blue-500">{user?.team?.name || 'General Member'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Points:</span>
              <span className="font-bold text-amber-500">{user?.contributionPoints || 0} pts</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Profile Details</h3>

          {message && (
            <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Prominent Profile Photo Upload Box */}
            <div className="p-5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                📷 Profile Photo (JPG, PNG, WEBP max 5MB)
              </span>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Upload className="w-4 h-4" /> Upload New Photo
                </button>
                {photoPreview !== defaultAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Photo
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL</label>
                <input type="text" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile URL</label>
                <input type="text" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password (Leave blank to keep current)</label>
              <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all">
              {loading ? 'Saving Profile Updates...' : 'Save Profile Updates'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

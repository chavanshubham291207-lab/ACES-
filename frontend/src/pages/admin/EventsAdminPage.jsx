import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Calendar, Plus, MapPin, Users, Trash2, Tag, Star } from 'lucide-react';

const EventsAdminPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    title: '',
    banner: '',
    venue: '',
    startTime: '',
    endTime: '',
    description: '',
    chiefGuest: '',
    category: 'Workshop'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEvents = () => {
    setLoading(true);
    API.get('/events')
      .then(res => setEvents(res.data.events || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', formData);
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete event?')) return;
    try {
      await API.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert('Error deleting event');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Event Management</h1>
          <p className="text-xs text-slate-500">Organize hackathons, workshops, guest lectures, and manage registrations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((ev) => (
            <div key={ev._id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-48 relative">
                  <img src={ev.banner} alt={ev.title} className="w-full h-full object-cover" />
                  <button onClick={() => handleDelete(ev._id)} className="absolute top-3 right-3 p-2 bg-slate-950/80 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase rounded-full">
                    {ev.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ev.description}</p>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {ev.venue}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {new Date(ev.startTime).toLocaleString()}</p>
                    <p className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-500" /> Chief Guest: {ev.chiefGuest}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" /> {ev.registeredMembers?.length || 0} Registered</span>
                <span className="font-semibold text-emerald-500">Live Event</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
            <input required type="text" placeholder="e.g. Hack-ACES 2026" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none">
                {['Hackathon', 'Workshop', 'Seminar', 'TechFest', 'Cultural'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Chief Guest</label>
              <input type="text" placeholder="e.g. Dr. Vance" value={formData.chiefGuest} onChange={(e) => setFormData({ ...formData, chiefGuest: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
              <input required type="text" placeholder="Auditorium" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Image URL</label>
              <input type="text" placeholder="https://..." value={formData.banner} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input required type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input required type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md">Create Event</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default EventsAdminPage;

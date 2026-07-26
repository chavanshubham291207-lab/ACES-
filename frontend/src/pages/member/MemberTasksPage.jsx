import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Github,
  ExternalLink,
  Upload,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Send
} from 'lucide-react';

const MemberTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Work Modal State
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    submissionNotes: '',
    githubLink: '',
    liveDemoLink: '',
    submissionFiles: []
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks/my-tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Error fetching member tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSubmissionForm(prev => ({
        ...prev,
        submissionFiles: [...prev.submissionFiles, reader.result]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.put(`/tasks/${submittingTask._id}/submit`, submissionForm);
      if (res.data.success) {
        setSubmittingTask(null);
        setSubmissionForm({ submissionNotes: '', githubLink: '', liveDemoLink: '', submissionFiles: [] });
        fetchMyTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting task work');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            📝 Assigned ACES Tasks
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View assigned tasks from club executives and submit your work files for review.
          </p>
        </div>
      </div>

      {/* Tasks Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-semibold">Loading assigned tasks from MongoDB...</p>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No Tasks Assigned Yet"
          message="Tasks assigned to you by club executive admins will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isSubmitted = task.status === 'Submitted' || task.status === 'Approved';

            const priorityColors = {
              High: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
              Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            };

            return (
              <motion.div
                key={task._id}
                whileHover={{ y: -4 }}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                      {task.priority} Priority
                    </span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{task.taskTitle}</h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {task.description || 'No detailed instructions provided.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
                    <div className="flex justify-between">
                      <span>Assigned By:</span>
                      <strong className="text-slate-800 dark:text-white">{task.assignedBy}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <strong className="text-rose-500">{new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </div>
                  </div>
                </div>

                {/* Submit / Status Button */}
                <button
                  onClick={() => {
                    setSubmittingTask(task);
                    setSubmissionForm({
                      submissionNotes: task.submissionNotes || '',
                      githubLink: task.githubLink || '',
                      liveDemoLink: task.liveDemoLink || '',
                      submissionFiles: task.submissionFiles || []
                    });
                  }}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isSubmitted
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-[1.02]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitted ? 'View / Update Submission' : 'Submit Work'}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submit Work Modal */}
      {submittingTask && (
        <Modal
          isOpen={!!submittingTask}
          onClose={() => setSubmittingTask(null)}
          title={`Submit Work: ${submittingTask.taskTitle}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitWork} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repository Link (Optional)</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={submissionForm.githubLink}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, githubLink: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo Link (Optional)</label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  placeholder="https://myproject.vercel.app"
                  value={submissionForm.liveDemoLink}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, liveDemoLink: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Submission File (PDF, DOCX, ZIP, Images max 10MB)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx,.zip,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700/50"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>{submissionForm.submissionFiles.length > 0 ? `${submissionForm.submissionFiles.length} File(s) Attached ✓` : '+ Click to Upload Submission File'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Submission Notes & Remarks</label>
              <textarea
                rows={3}
                placeholder="Write optional comments or remarks for executive review..."
                value={submissionForm.submissionNotes}
                onChange={(e) => setSubmissionForm({ ...submissionForm, submissionNotes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setSubmittingTask(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Work Now'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default MemberTasksPage;

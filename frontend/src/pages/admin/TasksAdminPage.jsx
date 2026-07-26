import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  Github,
  ExternalLink,
  Paperclip,
  Upload,
  Loader2,
  UserCheck,
  Building
} from 'lucide-react';

const TasksAdminPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Assign New Task Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [taskForm, setTaskForm] = useState({
    taskTitle: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    attachment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // View Submission Modal
  const [viewingTask, setViewingTask] = useState(null);

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    taskTitle: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    attachment: ''
  });

  // Delete Modal
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, search]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (statusFilter) queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const res = await API.get(`/tasks${queryString}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Member Search Handler
  useEffect(() => {
    if (!memberSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchingMembers(true);
      API.get(`/users?search=${encodeURIComponent(memberSearchQuery)}`)
        .then(res => setSearchResults(res.data.users || []))
        .catch(() => {})
        .finally(() => setSearchingMembers(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  const handleAttachmentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTaskForm(prev => ({ ...prev, attachment: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('Please search and select a member from the results list.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/tasks', {
        ...taskForm,
        assignedTo: selectedMember._id
      });

      if (res.data.success) {
        setIsAssignModalOpen(false);
        setSelectedMember(null);
        setMemberSearchQuery('');
        setTaskForm({ taskTitle: '', description: '', priority: 'Medium', deadline: '', attachment: '' });
        fetchTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchTasks();
        if (viewingTask && viewingTask._id === taskId) {
          setViewingTask(res.data.task);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task status');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/tasks/${editingTask._id}`, editForm);
      if (res.data.success) {
        setEditingTask(null);
        fetchTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      const res = await API.delete(`/tasks/${deletingTaskId}`);
      if (res.data.success) {
        setDeletingTaskId(null);
        fetchTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Top Action & Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            📝 Task Assignment & Delegation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assign tasks to members, track submission files, and review work.
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>+ Assign New Task</span>
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Title, Member Name, or Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-56 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 3. Task Management Data Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-semibold">Loading assigned tasks from MongoDB Atlas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No Tasks Assigned"
            message="Click '+ Assign New Task' above to assign work to ACES club members."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-4 px-6">Task Title & Info</th>
                  <th className="py-4 px-6">Assigned Member</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Deadline</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {tasks.map((task) => {
                  const photo = (task.assignedTo?.profilePhoto && task.assignedTo.profilePhoto.trim() !== '')
                    ? task.assignedTo.profilePhoto
                    : defaultAvatar;

                  const priorityColors = {
                    High: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                    Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  };

                  return (
                    <tr key={task._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 max-w-xs">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{task.taskTitle}</h4>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{task.description || 'No description provided.'}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">Assigned by: {task.assignedBy}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={photo} alt={task.memberName} className="w-9 h-9 rounded-full object-cover border border-blue-500/30 bg-slate-800" />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{task.memberName}</h4>
                            <span className="text-slate-400 font-mono text-[11px]">{task.assignedTo?.rollNumber || 'Member'} • {task.team}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={task.status} />
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5">
                        {/* View Submissions */}
                        <button
                          onClick={() => setViewingTask(task)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                          title="View Submission Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => handleStatusChange(task._id, 'Approved')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="Approve Task Work"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Request Changes */}
                        <button
                          onClick={() => handleStatusChange(task._id, 'Changes Requested')}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                          title="Request Changes"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleStatusChange(task._id, 'Rejected')}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Reject Task Work"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setEditForm({
                              taskTitle: task.taskTitle,
                              description: task.description,
                              priority: task.priority,
                              deadline: new Date(task.deadline).toISOString().slice(0, 10),
                              attachment: task.attachment || ''
                            });
                          }}
                          className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                          title="Edit Task Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingTaskId(task._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Assign New Task Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign New Task to Member"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          
          {/* Member Search Input */}
          <div className="space-y-2 relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Member (Search by Name, Email, or Roll Number) *
            </label>

            {selectedMember ? (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={selectedMember.profilePhoto || defaultAvatar} alt="Member" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedMember.name}</h4>
                    <span className="text-xs text-blue-500">{selectedMember.rollNumber} • {selectedMember.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Change Member
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Type name, email, or roll number to search..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                  {searchingMembers && <Loader2 className="w-4 h-4 animate-spin text-blue-500 absolute right-3 top-3" />}
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-800">
                    {searchResults.map(m => (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedMember(m);
                          setSearchResults([]);
                        }}
                        className="p-3 hover:bg-blue-600/20 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={m.profilePhoto || defaultAvatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-xs text-white">{m.name}</h4>
                            <span className="text-[10px] text-slate-400">{m.rollNumber} • {m.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-400">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Design ACES Event Poster"
              value={taskForm.taskTitle}
              onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Requirements</label>
            <textarea
              rows={3}
              placeholder="Detailed instructions for the assigned task..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline Date *</label>
              <input
                required
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Attachment upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attachment (Optional File/Image)</label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAttachmentUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700/50"
            >
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span>{taskForm.attachment ? 'Attachment File Uploaded ✓' : 'Click to Upload Attachment'}</span>
            </button>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Task Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. View Task Submission Modal */}
      {viewingTask && (
        <Modal
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          title="Task Submission Details"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{viewingTask.taskTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingTask.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Assigned To: <strong className="text-blue-500">{viewingTask.memberName}</strong></span>
                <StatusBadge status={viewingTask.status} />
              </div>
            </div>

            {/* Submission Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Submission Files & Links</h4>

              {viewingTask.githubLink && (
                <a href={viewingTask.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-white hover:bg-slate-800">
                  <Github className="w-4 h-4 text-purple-400" />
                  <span>GitHub Repository: {viewingTask.githubLink}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
              )}

              {viewingTask.liveDemoLink && (
                <a href={viewingTask.liveDemoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 hover:bg-blue-500/20">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>Live Demo Link: {viewingTask.liveDemoLink}</span>
                </a>
              )}

              {viewingTask.submissionFiles && viewingTask.submissionFiles.length > 0 && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Uploaded Submission Files:</span>
                  {viewingTask.submissionFiles.map((fileUrl, idx) => (
                    <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className="block text-xs font-bold text-blue-500 hover:underline truncate">
                      📄 View Submission File #{idx + 1}
                    </a>
                  ))}
                </div>
              )}

              {viewingTask.submissionNotes && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Member Submission Notes:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">{viewingTask.submissionNotes}</p>
                </div>
              )}
            </div>

            {/* Admin Decision Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => handleStatusChange(viewingTask._id, 'Approved')}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Work
              </button>

              <button
                onClick={() => handleStatusChange(viewingTask._id, 'Changes Requested')}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Changes
              </button>

              <button
                onClick={() => handleStatusChange(viewingTask._id, 'Rejected')}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Work
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <Modal
          isOpen={!!deletingTaskId}
          onClose={() => setDeletingTaskId(null)}
          title="Delete Task?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Task Permanently?</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete this task document from MongoDB Atlas?</p>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDeletingTaskId(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" onClick={handleDeleteTask} className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md">Delete Permanently</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default TasksAdminPage;

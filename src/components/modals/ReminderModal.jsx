import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReminderModal({ isOpen, onClose, onSave, onDelete, reminder = null }) {
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    type: 'assignment',
    priority: 'high',
    completed: false,
  });

  useEffect(() => {
    if (reminder) {
      // Find priority based on color mapping if needed, or fallback
      let priority = 'high';
      if (reminder.color === 'secondary') priority = 'medium';
      if (reminder.color === 'tertiary') priority = 'low';

      // Find type based on icon mapping if needed, or fallback
      let type = 'assignment';
      if (reminder.icon === 'quiz') type = 'quiz';
      if (reminder.icon === 'school') type = 'exam';
      if (reminder.icon === 'groups') type = 'study session';

      setFormData({
        title: reminder.title || '',
        desc: reminder.desc || '',
        type: type,
        priority: priority,
        completed: reminder.completed || false,
      });
    } else {
      setFormData({
        title: '',
        desc: '',
        type: 'assignment',
        priority: 'high',
        completed: false,
      });
    }
  }, [reminder, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Map type to material icon name
    let icon = 'assignment';
    if (formData.type === 'quiz') icon = 'quiz';
    if (formData.type === 'exam') icon = 'school';
    if (formData.type === 'study session') icon = 'groups';

    // Map priority to theme color name
    let color = 'primary'; // high -> primary
    if (formData.priority === 'medium') color = 'secondary';
    if (formData.priority === 'low') color = 'tertiary';

    onSave({
      title: formData.title,
      desc: formData.desc,
      icon,
      color,
      completed: formData.completed,
    });
    onClose();
  };

  const handleDeleteClick = () => {
    if (reminder && onDelete) {
      if (window.confirm("Are you sure you want to delete this reminder?")) {
        onDelete(reminder.id);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface dark:bg-surface-container-low border border-outline-variant rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-lg border-b border-outline-variant">
            <h2 className="font-headline-md text-on-surface">
              {reminder ? 'Edit Reminder' : 'Add New Reminder'}
            </h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-lg overflow-y-auto max-h-[70vh] custom-scrollbar">
            <form id="reminder-form" onSubmit={handleSubmit} className="space-y-md">
              
              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Reminder Title</label>
                <input 
                  required 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm" 
                  placeholder="e.g. Algorithms Programming Lab" 
                />
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Description</label>
                <input 
                  required
                  name="desc" 
                  value={formData.desc} 
                  onChange={handleChange} 
                  className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm" 
                  placeholder="e.g. Due tomorrow at 5 PM • Chapter 4" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="study session">Study Session</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Priority Level</label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleChange} 
                    className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {reminder && (
                <div className="flex items-center gap-sm p-sm bg-surface-container-low dark:bg-surface-container-high rounded-xl">
                  <input
                    type="checkbox"
                    id="completed"
                    name="completed"
                    checked={formData.completed}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-outline text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <label htmlFor="completed" className="text-body-sm font-semibold text-on-surface cursor-pointer select-none">
                    Mark as Completed
                  </label>
                </div>
              )}

            </form>
          </div>
          
          <div className="p-lg border-t border-outline-variant flex justify-between items-center bg-surface-container-low dark:bg-surface">
            <div>
              {reminder && (
                <button 
                  onClick={handleDeleteClick}
                  type="button" 
                  className="px-md py-sm text-error hover:bg-error/10 rounded-xl font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              )}
            </div>
            <div className="flex gap-sm">
              <button onClick={onClose} type="button" className="px-lg py-sm rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
                Cancel
              </button>
              <button type="submit" form="reminder-form" className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                {reminder ? 'Save Changes' : 'Add Reminder'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

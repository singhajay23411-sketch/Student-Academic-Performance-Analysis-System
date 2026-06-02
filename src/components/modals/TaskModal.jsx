import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

export default function TaskModal({ isOpen, onClose, onSave, task = null }) {
  const subjects = useStore(state => state.subjects);
  const [formData, setFormData] = useState({
    text: '',
    time: 30,
    priority: 'MEDIUM',
    subjectId: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        text: task.text || '',
        time: task.time || 30,
        priority: task.priority || 'MEDIUM',
        subjectId: task.subjectId || '',
      });
    } else {
      setFormData({
        text: '',
        time: 30,
        priority: 'MEDIUM',
        subjectId: subjects.length > 0 ? subjects[0].id : '',
      });
    }
  }, [task, isOpen, subjects]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'time' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              {task ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-lg">
            <form id="task-form" onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Task Description</label>
                <input required name="text" value={formData.text} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" placeholder="e.g. Review Heap Sort Complexity" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Estimated Time (Mins)</label>
                  <input type="number" required min="5" step="5" name="time" value={formData.time} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Related Subject</label>
                <select name="subjectId" value={formData.subjectId} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface">
                  <option value="">No Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          
          <div className="p-lg border-t border-outline-variant flex justify-end gap-sm bg-surface-container-low dark:bg-surface">
            <button onClick={onClose} type="button" className="px-lg py-sm rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
              Cancel
            </button>
            <button type="submit" form="task-form" className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

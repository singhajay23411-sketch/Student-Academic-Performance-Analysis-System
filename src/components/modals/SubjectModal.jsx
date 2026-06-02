import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectModal({ isOpen, onClose, onSave, subject = null }) {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    icon: 'book',
    color: 'primary',
    schedule: '',
    score: 0,
    maxScore: 100,
    attendance: 100,
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        shortName: subject.shortName || '',
        icon: subject.icon || 'book',
        color: subject.color || 'primary',
        schedule: subject.schedule || '',
        score: subject.score || 0,
        maxScore: subject.maxScore || 100,
        attendance: subject.attendance || 100,
      });
    } else {
      setFormData({
        name: '',
        shortName: '',
        icon: 'book',
        color: 'primary',
        schedule: '',
        score: 0,
        maxScore: 100,
        attendance: 100,
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'score' || name === 'maxScore' || name === 'attendance') ? Number(value) : value
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
              {subject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-lg overflow-y-auto max-h-[70vh] custom-scrollbar">
            <form id="subject-form" onSubmit={handleSubmit} className="space-y-md">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Subject Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" placeholder="e.g. Data Structures" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Short Code</label>
                  <input required name="shortName" value={formData.shortName} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm" placeholder="e.g. DS" maxLength={8} />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Schedule</label>
                <input name="schedule" value={formData.schedule} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" placeholder="e.g. Mon, Wed • 10:00 AM" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Current Score</label>
                  <input type="number" required min="0" max={formData.maxScore} name="score" value={formData.score} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Max Score</label>
                  <input type="number" required min="1" name="maxScore" value={formData.maxScore} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Attendance (%)</label>
                  <input type="number" required min="0" max="100" name="attendance" value={formData.attendance} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Icon</label>
                  <select name="icon" value={formData.icon} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface">
                    <option value="book">Book</option>
                    <option value="code">Code</option>
                    <option value="database">Database</option>
                    <option value="payments">Economics</option>
                    <option value="functions">Math</option>
                    <option value="science">Science</option>
                    <option value="bar_chart">Statistics</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase">Color Theme</label>
                  <select name="color" value={formData.color} onChange={handleChange} className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface">
                    <option value="primary">Golden (Primary)</option>
                    <option value="secondary">Orange (Secondary)</option>
                    <option value="tertiary">Peach (Tertiary)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-lg border-t border-outline-variant flex justify-end gap-sm bg-surface-container-low dark:bg-surface">
            <button onClick={onClose} type="button" className="px-lg py-sm rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
              Cancel
            </button>
            <button type="submit" form="subject-form" className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
              {subject ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

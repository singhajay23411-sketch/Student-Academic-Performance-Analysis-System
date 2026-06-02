import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoalModal({ isOpen, onClose, onSave, currentMetrics }) {
  const [formData, setFormData] = useState({
    targetCGPA: 8.50,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentMetrics) {
      setFormData({
        targetCGPA: currentMetrics.targetCGPA || 8.50,
      });
    }
  }, [currentMetrics, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    if (val < 1.00 || val > 10.00) {
      setError('Target CGPA must be between 1.00 and 10.00');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.targetCGPA < 1.00 || formData.targetCGPA > 10.00) {
      setError('Target CGPA must be between 1.00 and 10.00');
      return;
    }
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
          className="bg-surface dark:bg-surface-container-low border border-outline-variant rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-lg border-b border-outline-variant">
            <h2 className="font-headline-md text-on-surface">Update CGPA Goal</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-lg">
            <form id="goal-form" onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md font-bold text-on-surface-variant uppercase">Target CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="1.00" 
                  max="10.00" 
                  required 
                  name="targetCGPA" 
                  value={formData.targetCGPA} 
                  onChange={handleChange} 
                  className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-center font-bold text-headline-sm" 
                />
                {error && <p className="text-error text-xs font-semibold text-center">{error}</p>}
              </div>
            </form>
          </div>
          
          <div className="p-lg border-t border-outline-variant flex justify-end gap-sm bg-surface-container-low dark:bg-surface">
            <button onClick={onClose} type="button" className="px-lg py-sm rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
              Cancel
            </button>
            <button type="submit" form="goal-form" className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
              Save Target
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ViewAllSubjectsModal({ isOpen, onClose, subjects = [], onEditSubject, onDeleteSubject }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Memoized Filter & Search Logic with defensive empty string / default checks
  const filteredSubjects = useMemo(() => {
    return (subjects || []).filter(sub => {
      const subName = sub?.name || '';
      const subShort = sub?.shortName || '';
      const matchesSearch = subName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            subShort.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (statusFilter !== 'ALL') {
        const progress = sub?.progress ?? 0;
        const attendance = sub?.attendance ?? 100;
        if (statusFilter === 'EXCELLENT') {
          matchesFilter = progress >= 85;
        } else if (statusFilter === 'STEADY') {
          matchesFilter = progress >= 70 && progress < 85;
        } else if (statusFilter === 'NEEDS ATTENTION') {
          matchesFilter = progress < 70 || attendance < 75;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [subjects, searchQuery, statusFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface dark:bg-surface-container-low border border-outline-variant rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] h-fit"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-lg border-b border-outline-variant bg-surface dark:bg-surface-container-low">
              <div>
                <h2 className="font-headline-md text-on-surface">All Enrolled Courses</h2>
                <p className="text-body-sm text-on-surface-variant">Manage your academic subjects ({(subjects || []).length}/6 maximum)</p>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-lg bg-surface-container-lowest dark:bg-surface border-b border-outline-variant flex flex-col md:flex-row gap-md items-center justify-between">
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search by course name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl pl-10 pr-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm"
                />
              </div>
              <div className="flex gap-sm w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-48 bg-surface-container-high dark:bg-surface-variant border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="EXCELLENT">Projected A+ / Excellent</option>
                  <option value="STEADY">Steady Progress</option>
                  <option value="NEEDS ATTENTION">Needs Attention / High Risk</option>
                </select>
              </div>
            </div>

            {/* Main Grid View */}
            <div 
              className="p-lg overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest dark:bg-surface-container-lowest"
              style={{
                overflowY: 'auto',
                maxHeight: '60vh',
                contain: 'content',
                willChange: 'scroll-position',
                transform: 'translate3d(0, 0, 0)',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-2xl">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-md">menu_book</span>
                  <p className="text-body-lg font-bold text-on-surface-variant">No subjects found</p>
                  <p className="text-body-sm text-on-surface-variant/60">Try updating your search query or status filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {filteredSubjects.map((sub) => {
                    const progress = sub?.progress ?? 0;
                    const attendance = sub?.attendance ?? 100;
                    const color = sub?.color || 'primary';
                    const icon = sub?.icon || 'book';
                    
                    return (
                      <div
                        key={sub.id}
                        className="bg-white/95 dark:bg-[#1a140b]/95 p-md rounded-2xl border border-outline-variant hover:border-primary/30 transition-all duration-300 group flex flex-col justify-between min-h-[200px]"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-md">
                            <div className={`p-base rounded-lg text-${color} bg-${color}-fixed`}>
                              <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <div className="flex items-center gap-xs">
                              <span className={`px-xs py-[2px] rounded-full text-[10px] font-bold ${
                                sub?.statusType === 'success' ? 'bg-tertiary-container text-on-tertiary-container' :
                                sub?.statusType === 'error' ? 'bg-error-container text-on-error-container' :
                                'bg-surface-container-highest text-on-surface-variant'
                              }`}>
                                {sub?.status || 'STEADY'}
                              </span>
                              <button
                                onClick={() => onEditSubject(sub)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => onDeleteSubject(sub.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-error/20 text-error transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                          <h4 className="font-headline-md text-body-lg mb-base group-hover:text-primary transition-colors">
                            {sub?.name || ''} <span className="text-on-surface-variant/40 text-xs font-normal">({sub?.shortName || ''})</span>
                          </h4>
                          <div className="flex items-center gap-xs text-on-surface-variant text-body-sm mb-base">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{sub?.schedule || 'No Schedule'}</span>
                          </div>
                          <div className="flex items-center gap-xs text-on-surface-variant text-body-sm mb-md">
                            <span className="material-symbols-outlined text-sm">co_present</span>
                            <span>Attendance: <strong className={attendance < 75 ? "text-error" : "text-on-surface"}>{attendance}%</strong></span>
                          </div>
                        </div>
                        
                        <div className="space-y-base">
                          <div className="flex justify-between text-label-md text-on-surface-variant">
                            <span>Current Score</span>
                            <span className="font-bold text-on-surface">{sub?.score ?? 0}/{sub?.maxScore ?? 100}</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div className={`bg-${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-lg border-t border-outline-variant flex justify-end bg-surface-container-low dark:bg-surface">
              <button onClick={onClose} className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

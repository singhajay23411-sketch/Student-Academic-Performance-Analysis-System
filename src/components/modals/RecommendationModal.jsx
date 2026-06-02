import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

export default function RecommendationModal({ isOpen, onClose }) {
  const subjects = useStore((state) => state.subjects) || [];
  const metrics = useStore((state) => state.metrics) || {};

  const predictedCGPA = metrics.predictedCGPA || 0.00;
  const targetCGPA = metrics.targetCGPA || 8.50;

  // 1. Math and logical values for dynamic AI overview
  const avgAttendance = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + (s.attendance ?? 100), 0) / subjects.length) 
    : 100;

  const lowAttendanceSubjects = subjects.filter(s => (s.attendance ?? 100) < 75);
  const lowAttendanceCount = lowAttendanceSubjects.length;

  const highRiskSubjects = subjects.filter(s => (s.progress ?? 0) < 50);
  const highRiskCount = highRiskSubjects.length;

  // 2. Concrete Action Checklist (Right Column)
  const improvementActions = [];
  subjects.forEach(sub => {
    const subCode = sub.shortName || sub.name;
    if ((sub.attendance ?? 100) < 75) {
      improvementActions.push(`Attend all remaining lectures for ${subCode} to pull attendance to >= 75%.`);
      improvementActions.push(`Score above 80% on the upcoming ${subCode} quizzes.`);
    }
    if ((sub.progress ?? 0) < 50) {
      improvementActions.push(`Complete outstanding core lab sheets and consult professors for ${subCode}.`);
    } else if ((sub.progress ?? 0) >= 85) {
      improvementActions.push(`Lock in the projected A+ in ${subCode} by revising exam modules.`);
    }
  });

  if (improvementActions.length === 0) {
    improvementActions.push("Maintain your current steady study planner task logs daily.");
    improvementActions.push("Review mock exam papers weekly to sustain high results.");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface dark:bg-surface-container-low border border-outline-variant rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] h-fit"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-lg border-b border-outline-variant bg-surface dark:bg-surface-container-low">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-on-surface">AI Academic Improvement Plan</h2>
                  <p className="text-body-sm text-on-surface-variant">Personalized learning path based on your current performance metrics</p>
                </div>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div 
              className="p-lg overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest dark:bg-surface-container-lowest"
              style={{
                overflowY: 'auto',
                maxHeight: '65vh',
                contain: 'content',
                willChange: 'scroll-position',
                transform: 'translate3d(0, 0, 0)',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Split Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
                
                {/* LEFT COLUMN: AI Contextual Overview Panel */}
                <div className="space-y-md">
                  
                  {/* AI Illustration Icon & Heading Header */}
                  <div className="flex items-center gap-md p-xs bg-surface-container-low dark:bg-surface-container-high/40 rounded-2xl border border-outline-variant/50">
                    <div className="w-12 h-12 shrink-0 rounded-xl golden-gradient text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[28px]">psychology</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-body-lg font-bold text-on-surface">SAPAS Intelligence Engine</h3>
                      <p className="text-[11px] text-on-surface-variant">Diagnostic & Automated Synthesis • v1.0</p>
                    </div>
                  </div>

                  {/* Concise Academic Health Summary Card */}
                  <div className="p-md bg-white dark:bg-[#1a140b] rounded-2xl border border-outline-variant space-y-sm shadow-sm">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Academic Health Summary</h4>
                    <div className="grid grid-cols-2 gap-sm pt-xs">
                      <div className="p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                        <span className="text-[10px] text-on-surface-variant uppercase block">Projected CGPA</span>
                        <strong className="text-body-md font-bold text-on-surface">{predictedCGPA ? predictedCGPA.toFixed(2) : 'Not Set'}</strong>
                      </div>
                      <div className="p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                        <span className="text-[10px] text-on-surface-variant uppercase block">Overall Attendance</span>
                        <strong className={`text-body-md font-bold ${avgAttendance < 75 ? 'text-error' : 'text-on-surface'}`}>{avgAttendance}%</strong>
                      </div>
                      <div className="p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                        <span className="text-[10px] text-on-surface-variant uppercase block">Low Attendance</span>
                        <strong className={`text-body-md font-bold ${lowAttendanceCount > 0 ? 'text-error font-extrabold' : 'text-on-surface'}`}>{lowAttendanceCount} Courses</strong>
                      </div>
                      <div className="p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                        <span className="text-[10px] text-on-surface-variant uppercase block">High-Risk Courses</span>
                        <strong className={`text-body-md font-bold ${highRiskCount > 0 ? 'text-error font-extrabold' : 'text-on-surface'}`}>{highRiskCount} Courses</strong>
                      </div>
                    </div>
                  </div>

                  {/* "Why this plan was generated" Section */}
                  <div className="p-md bg-white dark:bg-[#1a140b] rounded-2xl border border-outline-variant space-y-xs shadow-sm">
                    <h4 className="text-xs font-bold text-on-surface mb-xs flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">info</span> Why this plan was generated
                    </h4>
                    <ul className="space-y-[6px] text-[11px] text-on-surface-variant">
                      {lowAttendanceCount > 0 && (
                        <li className="flex items-center gap-xs text-error font-medium">
                          <span className="material-symbols-outlined text-[12px]">circle</span>
                          Attendance below target (75%) in {lowAttendanceCount} course(s).
                        </li>
                      )}
                      {highRiskCount > 0 && (
                        <li className="flex items-center gap-xs text-error font-medium">
                          <span className="material-symbols-outlined text-[12px]">circle</span>
                          Predicted grade drop risk detected in lower progress courses.
                        </li>
                      )}
                      <li className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[12px] text-primary">circle</span>
                        Upcoming quizzes and exams detected.
                      </li>
                      <li className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[12px] text-primary">circle</span>
                        System identified grade improvement opportunities.
                      </li>
                    </ul>
                  </div>

                  {/* Expected Outcomes Card */}
                  <div className="p-md bg-surface-container-low dark:bg-surface-container-high/40 rounded-2xl border border-outline-variant/60 space-y-xs">
                    <h4 className="text-xs font-bold text-on-surface mb-xs">Expected Outcomes</h4>
                    <div className="grid grid-cols-2 gap-xs text-[11px] text-on-surface-variant font-medium">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary text-[14px]">arrow_forward</span>
                        <span>Attendance → 75%+</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary text-[14px]">arrow_forward</span>
                        <span>CGPA Uplift potential</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary text-[14px]">arrow_forward</span>
                        <span>Reduced academic risk</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary text-[14px]">arrow_forward</span>
                        <span>Full exam readiness</span>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Insight Banner */}
                  <div className="p-sm rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-[11px] font-semibold text-primary italic">
                      "Complete these recommendations and you can significantly improve your semester performance."
                    </p>
                  </div>

                </div>

                {/* RIGHT COLUMN: Action Improvement Checklist Card */}
                <div className="bg-white dark:bg-[#1a140b] p-md rounded-2xl border border-outline-variant space-y-sm shadow-sm h-fit">
                  <div className="flex items-center gap-sm pb-xs border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-[22px]">task_alt</span>
                    <h3 className="text-body-lg font-bold text-on-surface">Improvement Checklist</h3>
                  </div>
                  <div className="space-y-sm max-h-[400px] overflow-y-auto pr-xs custom-scrollbar">
                    {improvementActions.map((action, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-sm items-start p-xs rounded-xl hover:bg-surface-container-low transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-[2px]">check_box</span>
                        <span className="text-xs text-on-surface-variant leading-relaxed font-medium">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-lg border-t border-outline-variant flex justify-end bg-surface-container-low dark:bg-surface">
              <button onClick={onClose} className="px-lg py-sm bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

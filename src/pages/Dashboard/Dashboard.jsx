import { useState } from 'react';
import useStore from '../../store/useStore';
import { motion } from 'framer-motion';
import SubjectModal from '../../components/modals/SubjectModal';
import GoalModal from '../../components/modals/GoalModal';
import ViewAllSubjectsModal from '../../components/modals/ViewAllSubjectsModal';
import ReminderModal from '../../components/modals/ReminderModal';
import RecommendationModal from '../../components/modals/RecommendationModal';

export default function Dashboard() {
  const metrics = useStore((state) => state.metrics) || {};
  const subjects = useStore((state) => state.subjects) || [];
  const reminders = useStore((state) => state.reminders) || [];
  const rawAiInsights = useStore((state) => state.aiInsights);
  // Defensive null guard — if aiInsights is missing for any reason, provide safe defaults
  const aiInsights = rawAiInsights?.dashboard
    ? rawAiInsights
    : {
        dashboard: { title: 'Smart Improvement Insight', desc: "You're on a steady path. Try to push your scores higher to reach excellence." },
        performance: { desc: 'Keep performing well across all subjects.' },
        planner: { desc: 'Stay on track with your study plan.' },
        progress: { desc: 'Keep going! You are making progress.' },
      };

  
  const deleteSubject = useStore((state) => state.deleteSubject);
  const addSubject = useStore((state) => state.addSubject);
  const updateSubject = useStore((state) => state.updateSubject);
  const updateMetrics = useStore((state) => state.updateMetrics);
  
  const addReminder = useStore((state) => state.addReminder);
  const updateReminder = useStore((state) => state.updateReminder);
  const deleteReminder = useStore((state) => state.deleteReminder);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);

  const handleSaveSubject = (subjectData) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
    } else {
      addSubject(subjectData);
    }
  };

  const handleSaveReminder = (reminderData) => {
    if (editingReminder) {
      updateReminder(editingReminder.id, reminderData);
    } else {
      addReminder(reminderData);
    }
  };

  return (
    <div className="flex gap-lg flex-col xl:flex-row">
      {/* Left Column */}
      <div className="flex-1 space-y-lg">
        {/* Goal Completion Card */}
        <section className="rounded-[32px] p-xl golden-gradient text-on-primary-fixed relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-xl">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" fill="transparent" r="56" stroke="rgba(0,0,0,0.08)" strokeWidth="12"></circle>
                <circle className="text-on-primary-fixed" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * metrics.goalCompletion) / 100} strokeLinecap="round" strokeWidth="12"></circle>
              </svg>
              <span className="absolute font-display-lg text-headline-lg text-on-primary-fixed">{metrics.goalCompletion}%</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-headline-lg text-on-primary-fixed mb-xs">Overall Goal Completion</h2>
              <p className="font-body-md text-on-primary-fixed/80 max-w-md">Congratulations! You've achieved an impressive {metrics.goalCompletion}% of your goals for this term. You're well on your way to that {metrics.targetCGPA ? metrics.targetCGPA.toFixed(2) : 'Not Set'} CGPA.</p>
              <button onClick={() => setIsRecommendationModalOpen(true)} className="mt-md px-md py-sm bg-on-primary-fixed/10 hover:bg-on-primary-fixed/20 text-on-primary-fixed rounded-xl font-semibold backdrop-blur-sm transition-all border border-on-primary-fixed/20">
                View Detailed Report
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">auto_graph</span>
          </div>
        </section>

        {/* My Courses */}
        <section className="space-y-sm">
          <div className="flex justify-between items-center px-xs">
            <h3 className="font-headline-md text-on-surface">My Courses</h3>
            <div className="flex items-center gap-sm">
              <button onClick={() => { setEditingSubject(null); setIsSubjectModalOpen(true); }} className="flex items-center gap-1 text-primary font-bold text-body-sm hover:underline cursor-pointer bg-transparent border-none p-0 outline-none">
                <span className="material-symbols-outlined text-sm">add</span> Add Subject
              </button>
              <span className="text-outline-variant">|</span>
              <button onClick={() => setIsViewAllModalOpen(true)} className="text-on-surface-variant font-bold text-body-sm hover:underline cursor-pointer bg-transparent border-none p-0 outline-none">View All</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {subjects.slice(0, 3).map((sub, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={sub.id} 
                className="glass-card p-md rounded-2xl border border-outline-variant hover:border-primary/30 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-md">
                  <div className={`p-base rounded-lg text-${sub.color} bg-${sub.color}-fixed`}>
                    <span className="material-symbols-outlined">{sub.icon}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`px-xs py-[2px] rounded-full text-[10px] font-bold ${
                      sub.statusType === 'success' ? 'bg-tertiary-container text-on-tertiary-container' :
                      sub.statusType === 'error' ? 'bg-error-container text-on-error-container' :
                      'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {sub.status}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingSubject(sub); setIsSubjectModalOpen(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubject(sub.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full hover:bg-error/20 text-error"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <h4 className={`font-headline-md text-body-lg mb-base group-hover:text-${sub.color}`}>{sub.name}</h4>
                <div className="flex items-center gap-xs text-on-surface-variant text-body-sm mb-md">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{sub.schedule}</span>
                </div>
                <div className="space-y-base">
                  <div className="flex justify-between text-label-md text-on-surface-variant">
                    <span>Current Score</span>
                    <span className="font-bold text-on-surface">{sub.score}/{sub.maxScore}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div className={`bg-${sub.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${sub.progress}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Insight */}
        <section className="p-[1px] rounded-[24px] golden-gradient shadow-xl">
          <div className="bg-white/90 dark:bg-[#1a140b]/90 backdrop-blur-xl rounded-[23px] p-lg flex flex-col md:flex-row items-start md:items-center gap-md">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-display-lg">smart_toy</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-xs mb-xs">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">AI Intelligence</span>
                <div className="h-1 flex-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full w-1/3 golden-gradient rounded-full"></div>
                </div>
              </div>
              <h4 className="font-headline-md text-on-surface">{aiInsights.dashboard.title}</h4>
              <p className="font-body-md text-on-surface-variant mt-1" dangerouslySetInnerHTML={{__html: aiInsights.dashboard.desc.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-bold">$1</span>')}} />
            </div>
            <button onClick={() => setIsRecommendationModalOpen(true)} className="px-md py-sm bg-on-surface text-white dark:bg-white dark:text-on-surface rounded-xl font-bold hover:scale-105 transition-all shadow-md whitespace-nowrap w-full md:w-auto cursor-pointer">
              View Plan
            </button>
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="w-full xl:w-80 space-y-lg shrink-0">
        {/* Goal Tracker */}
        <div className="glass-card rounded-3xl p-md">
          <div className="flex justify-between items-center mb-md">
            <h4 className="font-headline-md text-body-lg">My Goal Tracker</h4>
            <button onClick={() => setIsGoalModalOpen(true)} className="text-on-surface-variant hover:text-primary bg-transparent border-none p-0 outline-none">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="h-48 flex items-end justify-between px-xs">
            {subjects.map((sub, i) => (
              <div key={i} className="flex flex-col items-center gap-xs h-full justify-end">
                <div 
                  className={`w-4 rounded-t-sm transition-all duration-1000 ${i % 2 === 0 ? 'golden-gradient' : 'bg-primary-fixed-dim'}`} 
                  style={{ height: `${sub.progress}%` }}
                ></div>
                <span className="text-[10px] font-bold text-on-surface-variant">{sub.shortName}</span>
              </div>
            ))}
          </div>
          <div className="mt-md grid grid-cols-2 gap-sm">
            <div className="p-sm bg-surface-container-low rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-xs tracking-wider">Weekly Streak</span>
              <span className="text-[24px] font-bold text-primary tabular-nums">{metrics.streak} 🔥</span>
            </div>
            <div className="p-sm bg-surface-container-low rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-xs tracking-wider">Projected CGPA</span>
              <span className="text-[24px] font-bold text-primary tabular-nums">{metrics.predictedCGPA ? metrics.predictedCGPA.toFixed(2) : 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="glass-card rounded-3xl p-md">
          <h4 className="font-headline-md text-body-lg mb-md">Reminders</h4>
          <div className="space-y-sm max-h-[300px] overflow-y-auto pr-xs custom-scrollbar">
            {reminders.map((rem) => (
              <div 
                key={rem.id} 
                onClick={() => { setEditingReminder(rem); setIsReminderModalOpen(true); }}
                className={`flex gap-sm p-sm bg-${rem.color}/5 rounded-xl border-l-4 border-${rem.color} cursor-pointer hover:bg-${rem.color}/10 transition-all ${rem.completed ? 'opacity-65' : ''}`}
              >
                <div className={`text-${rem.color}`}>
                  <span className="material-symbols-outlined">{rem.completed ? 'check_circle' : rem.icon}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-body-sm font-bold text-on-surface ${rem.completed ? 'line-through text-on-surface-variant/70' : ''}`}>{rem.title}</p>
                  <p className="text-[11px] text-on-surface-variant">{rem.desc}</p>
                </div>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="text-body-sm text-on-surface-variant text-center py-base">No active reminders</p>
            )}
          </div>
          <button 
            onClick={() => { setEditingReminder(null); setIsReminderModalOpen(true); }}
            className="w-full mt-md py-xs text-body-sm font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all cursor-pointer"
          >
            + Add Reminder
          </button>
        </div>

        {/* Study Session Promo */}
        <div className="relative rounded-3xl overflow-hidden group cursor-pointer">
          <img 
            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAXrqvsRYImmtjJXffiovHOLaOfzqDvEhgEwNHWURyfVTvy1JZ4_c-8beD_NWrcO7XjYOSFIpGgcACuK5W6RPBhbBVcqCM11E6L-b314LDkxw47dgZQh4ECxZh50GG1IsbwrR7fDDl--zz7HffqLVvtCpyMhhy5yL-JdBqwXW1tDfk2i9qFxzz8zbUZ1rs-kIAkGLanxFavVdOSG-JsTO2a3wi0b4KtDxdAPZm-jn2JCwz6EgrJOW2tDSs21i-Sumozo_JRodoOw"
            alt="Study Session"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex flex-col justify-end p-md">
            <p className="text-white font-bold text-body-md">Study Session</p>
            <p className="text-white/70 text-xs">Join the group study for Algorithms tonight at 8 PM.</p>
          </div>
        </div>
      </div>

      <SubjectModal 
        isOpen={isSubjectModalOpen} 
        onClose={() => setIsSubjectModalOpen(false)} 
        onSave={handleSaveSubject} 
        subject={editingSubject} 
      />
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={updateMetrics}
        currentMetrics={metrics}
      />
      <ViewAllSubjectsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        subjects={subjects}
        onEditSubject={(sub) => {
          setEditingSubject(sub);
          setIsSubjectModalOpen(true);
        }}
        onDeleteSubject={deleteSubject}
      />
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => { setIsReminderModalOpen(false); setEditingReminder(null); }}
        onSave={handleSaveReminder}
        onDelete={deleteReminder}
        reminder={editingReminder}
      />
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
      />
    </div>
  );
}

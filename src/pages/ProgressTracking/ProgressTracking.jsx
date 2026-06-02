import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Utility helpers ──────────────────────────────────────────────────────────

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sun
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayDiff + i + weekOffset * 7);
    return {
      label,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    };
  });
};

const getMilestoneStatus = (ms) => {
  if (ms.status === 'completed' || Number(ms.progress) >= 100) return 'completed';
  if (ms.deadline) {
    const dl = new Date(ms.deadline);
    dl.setHours(23, 59, 59, 0);
    if (dl < new Date()) return 'overdue';
  }
  return Number(ms.progress) > 0 ? 'in_progress' : 'not_started';
};

const STATUS_CFG = {
  completed:   { label: 'Completed',   bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500'   },
  in_progress: { label: 'In Progress', bg: 'bg-primary-container/30',             text: 'text-primary',                       dot: 'bg-primary'     },
  not_started: { label: 'Not Started', bg: 'bg-surface-container-highest',        text: 'text-on-surface-variant',            dot: 'bg-outline'     },
  overdue:     { label: 'Overdue',     bg: 'bg-error-container/30',               text: 'text-error',                         dot: 'bg-error'       },
};

const PRIORITY_CFG = {
  Low:      { color: 'text-on-surface-variant', bg: 'bg-surface-container-highest' },
  Medium:   { color: 'text-tertiary',           bg: 'bg-tertiary-container/20'     },
  High:     { color: 'text-secondary',          bg: 'bg-secondary-container/20'    },
  Critical: { color: 'text-error',              bg: 'bg-error-container/20'        },
};

const getLetterGrade = (p) => {
  if (p >= 90) return 'A+'; if (p >= 85) return 'A';  if (p >= 80) return 'A-';
  if (p >= 75) return 'B+'; if (p >= 70) return 'B';  if (p >= 65) return 'B-';
  if (p >= 60) return 'C+'; if (p >= 50) return 'C';  return 'F';
};

// ─── Badge catalogue ──────────────────────────────────────────────────────────

const BADGES = [
  { id: 'streak_7',   title: '7-Day Streak',        category: 'Streak',       icon: 'local_fire_department', level: 'Bronze',   hex: '#cd7f32', check: (s) => (s.metrics?.streak||0) >= 7,   prog: (s) => Math.min(100, ((s.metrics?.streak||0)/7)*100),    desc: 'Study 7 days in a row' },
  { id: 'streak_15',  title: '15-Day Streak',       category: 'Streak',       icon: 'local_fire_department', level: 'Silver',   hex: '#a8a9ad', check: (s) => (s.metrics?.streak||0) >= 15,  prog: (s) => Math.min(100, ((s.metrics?.streak||0)/15)*100),   desc: 'Study 15 days in a row' },
  { id: 'streak_30',  title: '30-Day Streak',       category: 'Streak',       icon: 'local_fire_department', level: 'Gold',     hex: '#ffd700', check: (s) => (s.metrics?.streak||0) >= 30,  prog: (s) => Math.min(100, ((s.metrics?.streak||0)/30)*100),   desc: 'Study 30 days in a row' },
  { id: 'streak_100', title: '100-Day Streak',      category: 'Streak',       icon: 'local_fire_department', level: 'Platinum', hex: '#b9f2ff', check: (s) => (s.metrics?.streak||0) >= 100, prog: (s) => Math.min(100, ((s.metrics?.streak||0)/100)*100),  desc: 'Study 100 days in a row' },
  { id: 'cgpa_7',     title: 'CGPA 7+',             category: 'CGPA',         icon: 'school',                level: 'Bronze',   hex: '#cd7f32', check: (s) => (s.metrics?.predictedCGPA||0) >= 7,  prog: (s) => Math.min(100, ((s.metrics?.predictedCGPA||0)/7)*100),   desc: 'Achieve CGPA above 7.0' },
  { id: 'cgpa_8',     title: 'CGPA 8+',             category: 'CGPA',         icon: 'school',                level: 'Silver',   hex: '#a8a9ad', check: (s) => (s.metrics?.predictedCGPA||0) >= 8,  prog: (s) => Math.min(100, ((s.metrics?.predictedCGPA||0)/8)*100),   desc: 'Achieve CGPA above 8.0' },
  { id: 'cgpa_9',     title: 'CGPA 9+',             category: 'CGPA',         icon: 'school',                level: 'Gold',     hex: '#ffd700', check: (s) => (s.metrics?.predictedCGPA||0) >= 9,  prog: (s) => Math.min(100, ((s.metrics?.predictedCGPA||0)/9)*100),   desc: 'Achieve CGPA above 9.0' },
  { id: 'attn_85',    title: '85% Attendance',      category: 'Attendance',   icon: 'how_to_reg',            level: 'Bronze',   hex: '#cd7f32', check: (s) => s.subjects.length > 0 && s.subjects.every(x => (x.attendance||0) >= 85), prog: (s) => s.subjects.length > 0 ? Math.min(100, (s.subjects.reduce((a,x) => a+(x.attendance||0),0)/s.subjects.length/85)*100) : 0, desc: '85% attendance in all subjects' },
  { id: 'attn_90',    title: '90% Attendance',      category: 'Attendance',   icon: 'how_to_reg',            level: 'Silver',   hex: '#a8a9ad', check: (s) => s.subjects.length > 0 && s.subjects.every(x => (x.attendance||0) >= 90), prog: (s) => s.subjects.length > 0 ? Math.min(100, (s.subjects.reduce((a,x) => a+(x.attendance||0),0)/s.subjects.length/90)*100) : 0, desc: '90% attendance in all subjects' },
  { id: 'attn_95',    title: '95% Attendance',      category: 'Attendance',   icon: 'how_to_reg',            level: 'Gold',     hex: '#ffd700', check: (s) => s.subjects.length > 0 && s.subjects.every(x => (x.attendance||0) >= 95), prog: (s) => s.subjects.length > 0 ? Math.min(100, (s.subjects.reduce((a,x) => a+(x.attendance||0),0)/s.subjects.length/95)*100) : 0, desc: '95% attendance in all subjects' },
  { id: 'focus_50',   title: '50 Focus Sessions',   category: 'Productivity', icon: 'bolt',                  level: 'Bronze',   hex: '#cd7f32', check: (s) => ((s.focusStats?.totalTime||0)/30) >= 50,  prog: (s) => Math.min(100, (((s.focusStats?.totalTime||0)/30)/50)*100),  desc: 'Complete 50 focus sessions (30 min each)' },
  { id: 'focus_100',  title: '100 Focus Sessions',  category: 'Productivity', icon: 'bolt',                  level: 'Silver',   hex: '#a8a9ad', check: (s) => ((s.focusStats?.totalTime||0)/30) >= 100, prog: (s) => Math.min(100, (((s.focusStats?.totalTime||0)/30)/100)*100), desc: 'Complete 100 focus sessions' },
  { id: 'hours_500',  title: '500 Study Hours',     category: 'Productivity', icon: 'menu_book',             level: 'Gold',     hex: '#ffd700', check: (s) => (s.focusStats?.totalTime||0) >= 30000,    prog: (s) => Math.min(100, ((s.focusStats?.totalTime||0)/30000)*100),    desc: 'Accumulate 500 total study hours' },
];

// ─── AI Milestone Prediction ──────────────────────────────────────────────────

const getMilestonePrediction = (ms) => {
  const status = getMilestoneStatus(ms);
  if (status === 'completed') return { text: '🎉 Milestone completed! Great work.', type: 'success' };
  if (status === 'overdue')   return { text: '⚠️ Past its deadline. Reschedule or mark complete.', type: 'error' };
  if (!ms.deadline || !ms.createdAt) return null;

  const daysLeft  = Math.ceil((new Date(ms.deadline) - new Date()) / 86400000);
  const daysSpent = Math.max(1, Math.ceil((new Date() - new Date(ms.createdAt)) / 86400000));
  const ratePerDay = Number(ms.progress) / daysSpent;

  if (ratePerDay > 0) {
    const projected = Number(ms.progress) + ratePerDay * daysLeft;
    if (projected >= 100) return { text: `AI predicts you'll complete this milestone ahead of schedule! 🚀`, type: 'success' };
    return { text: `At current pace: ~${Math.round(projected)}% by deadline. This milestone is at risk.`, type: 'warning' };
  }

  if (daysLeft <= 5 && Number(ms.progress) < 70) {
    return { text: `Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left. Accelerate your progress now!`, type: 'error' };
  }
  return null;
};

// ─── AI Insights Engine ───────────────────────────────────────────────────────

const buildInsights = (subjects, metrics, focusStats, studyLog, milestones) => {
  const results = [];

  // 1. Performance
  const riskSubs  = subjects.filter(s => s.progress < 50);
  const topSubs   = subjects.filter(s => s.progress >= 85);
  const avgProg   = subjects.length ? Math.round(subjects.reduce((a,s) => a+s.progress, 0)/subjects.length) : 0;
  if (riskSubs.length > 0) {
    results.push({ category: 'Performance', type: 'error',   icon: 'warning',      title: 'Risk Alert',         desc: `${riskSubs.map(s=>s.name).join(', ')} ${riskSubs.length===1?'is':'are'} below 50%. Immediate attention required.` });
  } else if (topSubs.length > 0) {
    results.push({ category: 'Performance', type: 'success', icon: 'trending_up',  title: 'Top Performance',    desc: `${topSubs[0].name} is at ${topSubs[0].progress}% — A+ projected! Average overall: ${avgProg}%.` });
  } else {
    results.push({ category: 'Performance', type: 'info',    icon: 'school',       title: 'Steady Progress',    desc: `Avg performance: ${avgProg}% across all subjects. Push to 85%+ for A-grade projections.` });
  }

  // 2. Attendance
  const lowAttn = subjects.filter(s => (s.attendance||0) < 75);
  const avgAttn = subjects.length ? Math.round(subjects.reduce((a,s) => a+(s.attendance||0), 0)/subjects.length) : 0;
  if (lowAttn.length > 0) {
    results.push({ category: 'Attendance', type: 'error',   icon: 'person_off',  title: 'Attendance Warning',  desc: `${lowAttn.map(s=>s.name).join(', ')} attendance below 75%. Academic penalty risk.` });
  } else {
    results.push({ category: 'Attendance', type: 'success', icon: 'how_to_reg',  title: 'Good Attendance',     desc: `Average attendance: ${avgAttn}% across all subjects. Keep attending regularly!` });
  }

  // 3. Productivity
  const totalHrs  = Math.round((focusStats?.totalTime||0) / 60);
  const weekMins  = (studyLog||[]).filter(e => (new Date() - new Date(e.date)) < 7*86400000).reduce((a,e) => a+e.minutes, 0);
  const weekHrs   = Math.round(weekMins / 60 * 10) / 10;
  results.push({ category: 'Productivity', type: weekMins > 300 ? 'success' : 'warning', icon: 'schedule', title: 'Study Productivity', desc: `${totalHrs} total study hours logged. This week: ${weekHrs}h. ${weekMins > 300 ? 'Excellent consistency! Keep going.' : 'Aim for at least 5 hours/week.'}` });

  // 4. Goals
  const overdueMSs    = milestones.filter(m => getMilestoneStatus(m) === 'overdue').length;
  const completedMSs  = milestones.filter(m => getMilestoneStatus(m) === 'completed').length;
  if (overdueMSs > 0) {
    results.push({ category: 'Goals', type: 'error',   icon: 'assignment_late', title: 'Overdue Milestones', desc: `${overdueMSs} milestone${overdueMSs>1?'s are':' is'} past deadline. Review and reschedule them.` });
  } else {
    results.push({ category: 'Goals', type: completedMSs > 0 ? 'success' : 'info', icon: 'flag', title: 'Goal Progress', desc: `${completedMSs} of ${milestones.length} milestones completed. ${metrics?.goalCompletion||0}% overall goal achievement.` });
  }

  return results;
};

const INSIGHT_STYLE = {
  error:   { border: 'border-error/30',    bg: 'bg-error-container/10',             icon: 'text-error',    badge: 'bg-error-container text-on-error-container'   },
  warning: { border: 'border-amber-400/50',bg: 'bg-amber-50 dark:bg-amber-900/10',  icon: 'text-amber-500',badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
  success: { border: 'border-green-400/50',bg: 'bg-green-50 dark:bg-green-900/10',  icon: 'text-green-600',badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  info:    { border: 'border-primary/30',  bg: 'bg-primary-container/10',           icon: 'text-primary',  badge: 'bg-primary-container text-on-primary-container' },
};

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', description: '', deadline: '', priority: 'Medium', progress: 0, subjectId: '' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressTracking() {
  // Store reads
  const metrics    = useStore(s => s.metrics)    || {};
  const subjects   = useStore(s => s.subjects)   || [];
  const focusStats = useStore(s => s.focusStats) || {};
  const studyLog   = useStore(s => s.studyLog)   || [];
  const milestones = useStore(s => s.milestones) || [];

  // Store actions
  const addMilestone    = useStore(s => s.addMilestone);
  const updateMilestone = useStore(s => s.updateMilestone);
  const deleteMilestone = useStore(s => s.deleteMilestone);

  // UI state
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingMs,     setEditingMs]     = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [hoveredBar,    setHoveredBar]    = useState(null); // day label
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Streak data ────────────────────────────────────────────────────────────
  const streak        = metrics.streak || 0;
  const longestStreak = metrics.longestStreak || streak || 1;
  const monthlyActiveDays = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    return (studyLog||[]).filter(e => new Date(e.date) >= cutoff && e.minutes > 0).length;
  }, [studyLog]);

  const streakInsight = () => {
    if (streak >= 100) return `🏆 Legendary! ${streak}-day streak — you are in the top 0.1% of learners!`;
    if (streak >= 30)  return `🏆 Incredible! Your ${streak}-day streak puts you in the top 1% of active learners!`;
    if (streak >= 15)  return `🔥 You're in the top 10% this month! ${streak} days strong — keep it up!`;
    if (streak >= 7)   return `⚡ ${streak} days in! Serious momentum building. Don't break the chain!`;
    if (streak >= 3)   return `✨ ${streak}-day streak started! Every consistent day builds mastery.`;
    if (streak === 0)  return 'Log your first study session today to start building your streak!';
    return `${streak} day${streak>1?'s':''} in — great start! Keep going!`;
  };

  // ── Weekly chart ───────────────────────────────────────────────────────────
  const thisWeekDates = useMemo(() => getWeekDates(0), []);
  const lastWeekDates = useMemo(() => getWeekDates(-1), []);

  const thisWeekData = useMemo(() => thisWeekDates.map(d => {
    const entry = studyLog.find(l => l.date === d.date);
    const mins  = entry ? entry.minutes : 0;
    return { ...d, minutes: mins, hours: Math.round(mins / 60 * 10) / 10 };
  }), [thisWeekDates, studyLog]);

  const lastWeekTotal  = useMemo(() => lastWeekDates.reduce((a, d) => {
    const entry = studyLog.find(l => l.date === d.date);
    return a + (entry ? entry.minutes : 0);
  }, 0), [lastWeekDates, studyLog]);

  const thisWeekTotal  = thisWeekData.reduce((a, d) => a + d.minutes, 0);
  const growthPct      = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : (thisWeekTotal > 0 ? 100 : 0);
  const maxMins        = Math.max(...thisWeekData.map(d => d.minutes), 60);

  const activeDays         = thisWeekData.filter(d => d.minutes > 0);
  const mostProductiveDay  = activeDays.length ? activeDays.reduce((m, d) => d.minutes > m.minutes ? d : m) : null;
  const leastProductiveDay = activeDays.length > 1 ? activeDays.reduce((m, d) => d.minutes < m.minutes ? d : m) : null;

  // ── Badges ─────────────────────────────────────────────────────────────────
  const storeSnap      = { metrics, subjects, focusStats };
  const unlockedBadges = BADGES.filter(b => b.check(storeSnap));
  const lockedBadges   = BADGES.filter(b => !b.check(storeSnap));
  const displayBadges  = showAllBadges ? BADGES : [...unlockedBadges, ...lockedBadges].slice(0, 6);

  // ── AI Insights ────────────────────────────────────────────────────────────
  const progressInsights = useMemo(() =>
    buildInsights(subjects, metrics, focusStats, studyLog, milestones),
    [subjects, metrics, focusStats, studyLog, milestones]
  );

  // ── Milestone modal handlers ───────────────────────────────────────────────
  const openAdd  = ()   => { setEditingMs(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (ms) => { setEditingMs(ms); setForm({ title: ms.title, description: ms.description||'', deadline: ms.deadline||'', priority: ms.priority||'Medium', progress: ms.progress||0, subjectId: ms.subjectId||'' }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingMs(null); setForm(EMPTY_FORM); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = { ...form, progress: Number(form.progress) };
    editingMs ? updateMilestone(editingMs.id, data) : addMilestone(data);
    closeModal();
  };

  const handleMarkComplete = (ms) => updateMilestone(ms.id, { status: 'completed', progress: 100 });

  const handleDelete = (id) => { deleteMilestone(id); setDeleteConfirm(null); };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportReport = () => {
    const hr = '─'.repeat(48);
    const lines = [
      'SAPAS – Academic Progress Report',
      `Generated: ${new Date().toLocaleString()}`,
      '═'.repeat(48), '',
      'COURSE PERFORMANCE', hr,
      ...subjects.map(s => `${s.name.padEnd(26)} Grade: ${getLetterGrade(s.progress).padEnd(4)} Progress: ${s.progress}%  Attendance: ${s.attendance||0}%`),
      '', 'STREAK & ACTIVITY', hr,
      `Current Streak   : ${streak} days`,
      `Longest Streak   : ${longestStreak} days`,
      `Monthly Active   : ${monthlyActiveDays} days`,
      `Total Study Hours: ${Math.round((focusStats?.totalTime||0)/60)}h`,
      '', 'MILESTONES', hr,
      ...milestones.map(m => `[${getMilestoneStatus(m).toUpperCase().padEnd(12)}]  ${m.title} — ${m.progress}%`),
      '', 'CGPA', hr,
      `Predicted CGPA : ${metrics.predictedCGPA?.toFixed(2) || 'N/A'}`,
      `Target CGPA    : ${metrics.targetCGPA || 'Not Set'}`,
      `Overall Goal   : ${metrics.goalCompletion||0}%`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'sapas_progress_report.txt' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const riskFirst = [...subjects].sort((a, b) => a.progress - b.progress);

  return (
    <>
    <div className="space-y-lg">

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1 — Momentum + Weekly Chart
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-lg">

        {/* Current Momentum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="col-span-12 md:col-span-4 glass-card rounded-xl p-lg flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="z-10">
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-bold">Current Momentum</span>
            <div className="flex items-end gap-sm mt-xs">
              <h3 className="text-display-lg font-display-lg gradient-text leading-none">{streak}</h3>
              <span className="text-headline-sm text-on-surface-variant mb-1 font-bold">days</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-sm leading-relaxed">{streakInsight()}</p>

            <div className="mt-md grid grid-cols-2 gap-sm">
              <div className="bg-surface-container-low rounded-xl p-sm text-center">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-xs">Longest</p>
                <p className="text-headline-sm font-bold text-on-surface">{longestStreak}d 🏆</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-sm text-center">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-xs">This Month</p>
                <p className="text-headline-sm font-bold text-on-surface">{monthlyActiveDays}d 📅</p>
              </div>
            </div>
          </div>

          <div className="mt-lg z-10">
            <div className="flex justify-between text-label-sm text-on-surface-variant mb-xs">
              <span>Streak Progress</span>
              <span className="font-bold">{longestStreak > 0 ? Math.min(100, Math.round((streak / longestStreak) * 100)) : 0}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${longestStreak > 0 ? Math.min(100, (streak / longestStreak) * 100) : 0}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] opacity-5 group-hover:opacity-10 transition-opacity rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        </motion.div>

        {/* Weekly Study Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="col-span-12 md:col-span-8 glass-card rounded-xl p-lg flex flex-col"
        >
          {/* Header row */}
          <div className="flex flex-wrap justify-between items-start gap-md mb-md">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Weekly Study Growth</h3>
              <p className="text-body-sm text-on-surface-variant">Daily study hours · current vs last week</p>
            </div>
            <div className="flex items-center gap-lg">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">This Week</p>
                <p className="text-headline-sm font-bold text-primary">{Math.round(thisWeekTotal / 60 * 10) / 10}h</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Last Week</p>
                <p className="text-headline-sm font-bold text-on-surface-variant">{Math.round(lastWeekTotal / 60 * 10) / 10}h</p>
              </div>
              <div className={`flex items-center gap-xs font-bold text-headline-sm ${growthPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>
                <span className="material-symbols-outlined">{growthPct >= 0 ? 'trending_up' : 'trending_down'}</span>
                <span>{growthPct >= 0 ? '+' : ''}{growthPct}%</span>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div
            className="flex-1 flex items-end justify-between gap-sm relative"
            style={{ minHeight: '128px', height: '128px' }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {thisWeekData.map((d, i) => {
              const heightPct = maxMins > 0 ? (d.minutes / maxMins) * 100 : 0;
              // Always show at least a faint placeholder so the chart is never blank
              const renderPct  = d.minutes > 0 ? Math.max(heightPct, 6) : 8;
              const isToday    = d.date === getTodayStr();
              const isHovered  = hoveredBar === d.label;
              const isEmpty    = d.minutes === 0;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-xs flex-1 h-full justify-end relative"
                  onMouseEnter={() => setHoveredBar(d.label)}
                >
                  {isHovered && !isEmpty && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[11px] font-bold px-sm py-[3px] rounded-lg whitespace-nowrap z-20 shadow-lg pointer-events-none">
                      {d.hours}h
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface" />
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${renderPct}%`, opacity: isEmpty ? 0.35 : 1 }}
                    transition={{ duration: 0.65, delay: i * 0.07, ease: 'easeOut' }}
                    className={`w-full rounded-t-lg cursor-pointer transition-all ${
                      isEmpty
                        ? 'bg-surface-container-highest'
                        : isToday
                          ? 'golden-gradient shadow-md'
                          : isHovered
                            ? 'bg-primary/80'
                            : 'bg-primary'
                    }`}
                  />
                  <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-primary font-black' : 'text-on-surface-variant'}`}>{d.label}</span>
                </div>
              );
            })}
          </div>


          {/* Productivity footnotes */}
          {(mostProductiveDay || leastProductiveDay) && (
            <div className="mt-md flex flex-wrap gap-md text-body-sm">
              {mostProductiveDay && (
                <span className="flex items-center gap-xs text-green-600 dark:text-green-400 font-semibold">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Best day: {mostProductiveDay.label} ({mostProductiveDay.hours}h)
                </span>
              )}
              {leastProductiveDay && (
                <span className="flex items-center gap-xs text-on-surface-variant font-semibold">
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  Least: {leastProductiveDay.label} ({leastProductiveDay.hours}h)
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2 — Milestones + Side Column (Badges + AI Insights)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-lg">

        {/* Semester Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
          className="col-span-12 md:col-span-7 glass-card rounded-xl p-lg"
        >
          <div className="flex flex-wrap justify-between items-center mb-lg gap-sm">
            <div>
              <h3 className="font-headline-md text-headline-md">Semester Milestones</h3>
              <p className="text-body-sm text-on-surface-variant">
                {milestones.length} total · {milestones.filter(m => getMilestoneStatus(m) === 'completed').length} completed
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-xl font-bold text-body-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Milestone
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="text-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[56px] mb-sm opacity-20 block">flag</span>
              <p className="font-bold text-on-surface">No milestones yet</p>
              <p className="text-body-sm mt-xs">Add academic milestones to track your semester goals</p>
              <button onClick={openAdd} className="mt-md px-lg py-sm bg-primary text-on-primary rounded-xl font-bold text-body-sm hover:bg-primary/90 transition-all cursor-pointer">
                Create First Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-md relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              {milestones.map((ms, idx) => {
                const status = getMilestoneStatus(ms);
                const cfg    = STATUS_CFG[status];
                const pCfg   = PRIORITY_CFG[ms.priority] || PRIORITY_CFG.Medium;
                const pred   = getMilestonePrediction(ms);
                const subj   = subjects.find(s => s.id === ms.subjectId);
                const daysLeft = ms.deadline ? Math.ceil((new Date(ms.deadline) - new Date()) / 86400000) : null;

                return (
                  <motion.div
                    key={ms.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="relative pl-12 group/ms"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-[14px] top-4 w-[18px] h-[18px] rounded-full ${cfg.dot} ring-4 ring-surface z-10 flex items-center justify-center flex-shrink-0`}>
                      {status === 'completed' && <span className="material-symbols-outlined text-[11px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      {status === 'overdue' && <span className="material-symbols-outlined text-[11px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>}
                    </div>

                    <div className={`rounded-xl p-md border border-outline-variant/40 hover:border-primary/30 transition-all ${status === 'completed' ? 'opacity-70' : ''}`}>
                      {/* Header */}
                      <div className="flex flex-wrap justify-between items-start gap-sm mb-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-xs mb-xs">
                            <span className={`text-[10px] font-bold uppercase px-xs py-[2px] rounded-full ${pCfg.bg} ${pCfg.color}`}>{ms.priority}</span>
                            {subj && <span className={`text-[10px] font-bold px-xs py-[2px] rounded-full bg-${subj.color}/10 text-${subj.color}`}>{subj.shortName}</span>}
                            {daysLeft !== null && daysLeft > 0 && status !== 'completed' && (
                              <span className={`text-[10px] font-semibold ${daysLeft <= 3 ? 'text-error' : 'text-on-surface-variant'}`}>{daysLeft}d left</span>
                            )}
                          </div>
                          <h4 className={`font-bold text-on-surface ${status === 'completed' ? 'line-through opacity-70' : ''}`}>{ms.title}</h4>
                          {ms.description && <p className="text-body-sm text-on-surface-variant mt-xs line-clamp-1">{ms.description}</p>}
                        </div>
                        <div className="flex items-center gap-xs shrink-0">
                          <span className={`text-label-sm font-bold px-sm py-[3px] rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                          <div className="opacity-0 group-hover/ms:opacity-100 transition-opacity flex gap-xs">
                            {status !== 'completed' && (
                              <button onClick={() => handleMarkComplete(ms)} title="Mark Complete" className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 flex items-center justify-center cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-sm">check</span>
                              </button>
                            )}
                            <button onClick={() => openEdit(ms)} className="w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary flex items-center justify-center cursor-pointer transition-colors">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => setDeleteConfirm(ms.id)} className="w-7 h-7 rounded-lg bg-error-container/20 text-error hover:bg-error-container flex items-center justify-center cursor-pointer transition-colors">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-xs mt-sm">
                        <div className="flex justify-between text-label-sm text-on-surface-variant">
                          <span>Progress</span>
                          <span className="font-bold">{ms.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ms.progress}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className={`h-full rounded-full ${status === 'overdue' ? 'bg-error' : status === 'completed' ? 'bg-green-500' : 'golden-gradient'}`}
                          />
                        </div>
                      </div>

                      {/* AI prediction badge */}
                      {pred && (
                        <div className={`mt-sm text-[11px] font-semibold flex items-start gap-xs leading-snug ${pred.type === 'success' ? 'text-green-600 dark:text-green-400' : pred.type === 'error' ? 'text-error' : 'text-amber-600 dark:text-amber-400'}`}>
                          <span className="material-symbols-outlined text-sm mt-px flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {pred.type === 'success' ? 'auto_awesome' : pred.type === 'error' ? 'priority_high' : 'info'}
                          </span>
                          {pred.text}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-lg">

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }}
            className="glass-card rounded-xl p-lg"
          >
            <div className="flex justify-between items-center mb-md">
              <div>
                <h3 className="font-bold text-on-surface">Achievements</h3>
                <p className="text-[11px] text-on-surface-variant">{unlockedBadges.length}/{BADGES.length} unlocked</p>
              </div>
              <button onClick={() => setShowAllBadges(v => !v)} className="text-primary text-label-md font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">
                {showAllBadges ? 'Show Less' : 'View All'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-sm">
              {displayBadges.map(badge => {
                const unlocked = badge.check(storeSnap);
                const progress = badge.prog(storeSnap);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ y: -3, scale: 1.02 }}
                    title={`${badge.desc}${!unlocked ? ` (${Math.round(progress)}%)` : ''}`}
                    className={`rounded-xl p-sm flex flex-col items-center text-center cursor-default transition-all ${unlocked ? 'bg-surface-container-low dark:bg-surface-variant' : 'bg-surface-container-lowest opacity-55 grayscale'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-xs ${unlocked ? 'bg-secondary-container' : 'bg-surface-container-highest'}`}
                      style={{ boxShadow: unlocked ? `0 0 16px ${badge.hex}55` : 'none' }}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ color: unlocked ? badge.hex : 'var(--md-sys-color-outline)', fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                    </div>
                    <p className="font-bold text-[10px] text-on-surface leading-tight">{badge.title}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-[2px]" style={{ color: badge.hex }}>{badge.level}</p>
                    {!unlocked && (
                      <div className="w-full mt-xs h-[3px] bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                    {unlocked && <span className="material-symbols-outlined text-[12px] text-green-500 mt-[2px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* AI Progress Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}
            className="glass-card rounded-xl p-lg flex-1"
          >
            <div className="flex items-center gap-sm mb-md">
              <div className="p-xs bg-secondary-container rounded-lg">
                <span className="material-symbols-outlined text-white text-md" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">AI Progress Insights</h3>
                <p className="text-[11px] text-on-surface-variant">Powered by your real data</p>
              </div>
            </div>
            <div className="space-y-sm">
              {progressInsights.map((ins, i) => {
                const sty = INSIGHT_STYLE[ins.type] || INSIGHT_STYLE.info;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className={`p-sm rounded-xl border ${sty.border} ${sty.bg}`}
                  >
                    <div className="flex items-start gap-sm">
                      <span className={`material-symbols-outlined text-sm mt-px flex-shrink-0 ${sty.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{ins.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-xs mb-[2px] flex-wrap">
                          <span className={`text-[9px] font-bold uppercase px-xs py-[1px] rounded ${sty.badge}`}>{ins.category}</span>
                          <p className="font-bold text-[11px] text-on-surface">{ins.title}</p>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">{ins.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 3 — Course Progress Details Table
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.5 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
          <div>
            <h3 className="font-headline-md text-headline-md">Course Progress Details</h3>
            <p className="text-body-sm text-on-surface-variant">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-lg text-body-sm font-bold hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-variant">
                {['Course', 'Attendance', 'Score', 'Grade', 'Status'].map(h => (
                  <th key={h} className="px-lg py-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">No subjects added yet. Add subjects from the Dashboard.</td>
                </tr>
              ) : subjects.map(c => (
                <tr key={c.id} className="hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className={`p-xs rounded-lg bg-${c.color}/10 text-${c.color}`}>
                        <span className="material-symbols-outlined text-sm">{c.icon}</span>
                      </div>
                      <span className="font-bold text-on-surface">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`bg-${c.color} h-full rounded-full`} style={{ width: `${c.attendance || 0}%` }} />
                      </div>
                      <span className={`text-body-sm font-semibold ${(c.attendance || 0) < 75 ? 'text-error' : 'text-on-surface'}`}>{c.attendance || 0}%</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-sm font-semibold text-on-surface">{c.score}/{c.maxScore}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-base bg-${c.color}/10 text-${c.color} rounded-full font-bold text-body-sm`}>{getLetterGrade(c.progress)}</span>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`flex items-center gap-xs font-bold text-body-sm ${c.progress < 50 ? 'text-error' : c.progress >= 85 ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                      <span className="material-symbols-outlined text-[18px]">{c.progress < 50 ? 'warning' : c.progress >= 85 ? 'star' : 'trending_up'}</span>
                      {c.progress < 50 ? 'At Risk' : c.progress >= 85 ? 'Excellent' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          Success Banner
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full rounded-xl overflow-hidden p-xl flex items-center bg-primary text-white min-h-[140px]">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9vLqDS85FxVTaP37AALBnPG8fn4-YLY757hbLSLKCdDXm9y0ESYAK7u-kWi085mfmI1RBcfJZO1QsKELvAAepsgVOJAQPWSZNBB-XEvTsuOlSpT7L5LkKng9fjNjjX9N4nclWbz0EX8Spu5i1mZtceBTtIncLQ_VIVAp73f7VQ7SafoZck465Pn0dFX27lzt99YPjBJmNO4LQaKaraqZ5eH-HFafKy8wGKdprmTR96P0JNtGkz2o60CU9l8jfybwPFTbSRTB67A"
          alt="Motivation"
        />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-headline-lg font-display-lg mb-sm">You've reached {metrics.goalCompletion || 0}% overall progress!</h2>
          <p className="text-body-lg mb-lg opacity-90">
            Predicted CGPA: <strong>{metrics.predictedCGPA ? metrics.predictedCGPA.toFixed(2) : 'N/A'}</strong>.{' '}
            {riskFirst.length > 0 ? `Focus on ${riskFirst[0].name} to strengthen your position.` : 'Keep up the excellent work across all subjects!'}
          </p>
          <button
            onClick={openAdd}
            className="bg-white text-primary px-xl py-md rounded-full font-bold hover:bg-surface-container-high transition-all shadow-lg cursor-pointer"
          >
            + Add Next Goal
          </button>
        </div>
      </div>

    </div>

    {/* ══ Delete Confirm Modal ════════════════════════════════════════════════ */}
    <AnimatePresence>
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-lg"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            className="bg-surface rounded-2xl p-xl max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
            </div>
            <h3 className="font-bold text-on-surface text-headline-sm mb-xs">Delete Milestone?</h3>
            <p className="text-body-sm text-on-surface-variant mb-xl">This cannot be undone. All progress data for this milestone will be lost.</p>
            <div className="flex gap-sm">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-sm border border-outline-variant rounded-xl text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-sm bg-error text-white rounded-xl font-bold hover:bg-error/90 transition-colors cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ══ Add / Edit Milestone Modal ══════════════════════════════════════════ */}
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-lg"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3 className="font-bold text-headline-sm text-on-surface">{editingMs ? 'Edit Milestone' : 'Add New Milestone'}</h3>
                <p className="text-body-sm text-on-surface-variant">{editingMs ? 'Update milestone details' : 'Track a new academic goal'}</p>
              </div>
              <button onClick={closeModal} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-md">
              {/* Title */}
              <div>
                <label className="text-label-md font-bold text-on-surface-variant block mb-xs">Milestone Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Complete DAA Unit 3"
                  className="w-full px-md py-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-md text-on-surface transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-label-md font-bold text-on-surface-variant block mb-xs">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What specifically needs to be accomplished?"
                  rows={2}
                  className="w-full px-md py-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-md text-on-surface transition-all resize-none"
                />
              </div>

              {/* Deadline + Priority */}
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant block mb-xs">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:border-primary outline-none text-body-md text-on-surface transition-all"
                  />
                </div>
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant block mb-xs">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:border-primary outline-none text-body-md text-on-surface transition-all"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              {/* Subject + Progress */}
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant block mb-xs">Subject</label>
                  <select
                    value={form.subjectId}
                    onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:border-primary outline-none text-body-md text-on-surface transition-all"
                  >
                    <option value="">General / CGPA Goal</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant block mb-xs">
                    Current Progress: <span className="text-primary font-black">{form.progress}%</span>
                  </label>
                  <input
                    type="range" min="0" max="100" value={form.progress}
                    onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                    className="w-full mt-sm accent-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Live status preview */}
              <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-xl">
                <span className="text-label-sm text-on-surface-variant">Status preview:</span>
                {(() => {
                  const s = getMilestoneStatus({ ...(editingMs || {}), ...form, progress: Number(form.progress) });
                  const c = STATUS_CFG[s];
                  return <span className={`text-label-sm font-bold px-sm py-[3px] rounded-full ${c.bg} ${c.text}`}>{c.label}</span>;
                })()}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-sm mt-xl">
              <button onClick={closeModal} className="flex-1 py-sm border border-outline-variant rounded-xl text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                className="flex-1 py-sm bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {editingMs ? 'Save Changes' : 'Add Milestone'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

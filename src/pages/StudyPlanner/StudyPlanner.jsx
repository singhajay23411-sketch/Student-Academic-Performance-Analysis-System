import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from '../../components/modals/TaskModal';

export default function StudyPlanner() {
  const subjects = useStore((state) => state.subjects) || [];
  const tasks = useStore((state) => state.tasks) || [];
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  
  const exams = useStore((state) => state.exams) || [];
  const addExam = useStore((state) => state.addExam);
  const deleteExam = useStore((state) => state.deleteExam);
  
  const weeklySchedule = useStore((state) => state.weeklySchedule) || [];
  const addScheduleSlot = useStore((state) => state.addScheduleSlot);
  const updateScheduleSlot = useStore((state) => state.updateScheduleSlot);
  const deleteScheduleSlot = useStore((state) => state.deleteScheduleSlot);
  const generateSmartSchedule = useStore((state) => state.generateSmartSchedule);
  
  const focusStats = useStore((state) => state.focusStats) || { totalTime: 0, dailyTime: 0, weeklyTime: 0 };
  const updateFocusStats = useStore((state) => state.updateFocusStats);
  
  const aiSuggestions = useStore((state) => state.aiSuggestions) || [];
  const applyAdjustment = useStore((state) => state.applyAdjustment);
  const dismissSuggestion = useStore((state) => state.dismissSuggestion);
  const restDays = useStore((state) => state.restDays) || [];
  const toggleRestDay = useStore((state) => state.toggleRestDay);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Focus Timer Customizable States
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [timerMode, setTimerMode] = useState('25/5'); // '25/5', '45/10', '60/15', 'Custom'
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Weekly Study Flow active day tracking state
  const [activeDay, setActiveDay] = useState('Tue');

  // Sync subject ID selection safely
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert("Focus session completed! Statistics updated.");
      updateFocusStats(focusDuration);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, focusDuration, updateFocusStats]);

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => { 
    setIsTimerActive(false); 
    setTimeLeft(focusDuration * 60); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (mode) => {
    setTimerMode(mode);
    setIsTimerActive(false);
    if (mode === '25/5') {
      setFocusDuration(25);
      setBreakDuration(5);
      setTimeLeft(25 * 60);
    } else if (mode === '45/10') {
      setFocusDuration(45);
      setBreakDuration(10);
      setTimeLeft(45 * 60);
    } else if (mode === '60/15') {
      setFocusDuration(60);
      setBreakDuration(15);
      setTimeLeft(60 * 60);
    }
  };

  const handleCustomFocusChange = (e) => {
    const val = Math.max(1, Number(e.target.value));
    setFocusDuration(val);
    setTimeLeft(val * 60);
    setIsTimerActive(false);
  };

  const handleAdjustSlotDuration = (slot, deltaMinutes) => {
    if (!slot || !slot.startTime || !slot.endTime) return;
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    let newEndMinutes = endMinutes + deltaMinutes;
    
    if (newEndMinutes - startMinutes >= 30 && newEndMinutes <= 24 * 60) {
      const newEndH = Math.floor(newEndMinutes / 60);
      const newEndM = newEndMinutes % 60;
      const formattedEnd = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}`;
      updateScheduleSlot(slot.id, { endTime: formattedEnd });
    }
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({ ...taskData, done: false });
    }
  };

  // Exam Modal States
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    date: '',
    time: '',
    room: '',
    notes: ''
  });
  const [isManageExamsOpen, setIsManageExamsOpen] = useState(false);

  const handleExamSubmit = (e) => {
    e.preventDefault();
    if (!examForm.title || !examForm.date) {
      alert("Exam Name and Date are required");
      return;
    }
    addExam(examForm);
    setExamForm({ title: '', date: '', time: '', room: '', notes: '' });
    setIsExamModalOpen(false);
  };

  // Get nearest upcoming exam safely
  const nearestExam = exams.length > 0 ? exams[0] : null;

  // Weekly Study Flow Progress Bars Math (Calculates scheduled hours per day)
  const getDailyStudyHours = (day) => {
    const slots = weeklySchedule.filter(s => s.day === day);
    let totalMinutes = 0;
    slots.forEach(slot => {
      if (slot && slot.startTime && slot.endTime) {
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);
        if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
          totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
        }
      }
    });
    return totalMinutes / 60;
  };

  const currentSuggestion = aiSuggestions.length > 0 ? aiSuggestions[0] : null;

  // Countdown Exam Card color logic helper
  const getExamCardStyles = (daysLeftStr) => {
    if (!daysLeftStr) {
      return { 
        bg: 'bg-[#FFFFFF] dark:bg-[#FFFFFF]', 
        border: 'border-[#E5E7EB]', 
        label: 'Normal' 
      };
    }
    
    if (daysLeftStr.includes('Today')) {
      return { 
        bg: 'bg-[#FFE0B2] dark:bg-[#FFE0B2]', 
        border: 'border-[#FFA726]', 
        label: 'Exam Today' 
      };
    }
    
    if (daysLeftStr.includes('Completed') || daysLeftStr.includes('Yesterday') || (daysLeftStr.includes('left') && parseInt(daysLeftStr) < 0)) {
      return { 
        bg: 'bg-[#F3F4F6] dark:bg-[#F3F4F6]', 
        border: 'border-[#D1D5DB]', 
        label: 'Exam Completed' 
      };
    }
    
    const days = parseInt(daysLeftStr);
    if (!isNaN(days)) {
      if (days <= 10) {
        return { 
          bg: 'bg-[#FFDAD6] dark:bg-[#FFDAD6]', 
          border: 'border-error/20', 
          label: 'Urgent' 
        };
      } else {
        return { 
          bg: 'bg-[#FFFFFF] dark:bg-[#FFFFFF]', 
          border: 'border-[#E5E7EB]', 
          label: 'Normal' 
        };
      }
    }
    
    return { 
      bg: 'bg-[#FFFFFF] dark:bg-[#FFFFFF]', 
      border: 'border-[#E5E7EB]', 
      label: 'Normal' 
    };
  };

  const cardStyle = getExamCardStyles(nearestExam?.daysLeft);

  return (
    <div className="space-y-lg">
      
      {/* Onboarding State for new users */}
      {subjects.length === 0 && (
        <section className="glass-card p-lg rounded-2xl border border-outline-variant/30 text-center space-y-sm">
          <span className="material-symbols-outlined text-[64px] text-primary animate-bounce">school</span>
          <h2 className="font-headline-lg text-on-surface">Welcome to your AI Study Planner!</h2>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto font-medium">
            You currently have no subjects registered. To get started, please add a subject from the Home Dashboard or seed demo courses by logging back in.
          </p>
        </section>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-12 gap-lg">
          {/* Weekly Study Flow (Integrated with real timetable slots) */}
          <div className="col-span-12 xl:col-span-8 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-md">
                <div>
                  <h3 className="font-headline-md text-on-surface">Weekly Study Flow</h3>
                  <p className="text-on-surface-variant text-body-sm">Your optimized academic schedule for this week.</p>
                </div>
                <button 
                  onClick={() => generateSmartSchedule()} 
                  className="bg-primary-container text-white px-md py-sm rounded-xl font-semibold flex items-center gap-xs hover:shadow-lg transition-all scale-95 active:scale-100 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  Regenerate Plan
                </button>
              </div>
              
              {subjects.length === 0 ? (
                <div className="text-center py-lg text-body-sm text-on-surface-variant italic font-semibold border border-dashed border-outline-variant/30 rounded-xl">
                  Add subjects to generate your study flow.
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-sm">
                  {[
                    { day: 'Mon', date: '24', dayKey: 'Mon' },
                    { day: 'Tue', date: '25', dayKey: 'Tue' },
                    { day: 'Wed', date: '26', dayKey: 'Wed' },
                    { day: 'Thu', date: '27', dayKey: 'Thu' },
                    { day: 'Fri', date: '28', dayKey: 'Fri' },
                    { day: 'Sat', date: '29', dayKey: 'Sat' },
                    { day: 'Sun', date: '30', dayKey: 'Sun' },
                  ].map((d, i) => {
                    const hours = getDailyStudyHours(d.dayKey);
                    const isSelected = activeDay === d.dayKey;
                    const isRest = restDays.includes(d.dayKey);
                    return (
                      <div 
                        key={i} 
                        onClick={() => setActiveDay(d.dayKey)}
                        className={`p-sm rounded-lg text-center transition-all flex flex-col justify-between min-h-[105px] cursor-pointer ${
                          isSelected 
                            ? 'bg-primary-container text-white shadow-lg transform -translate-y-1' 
                            : isRest 
                              ? 'bg-surface-container-low opacity-60 border border-dashed border-outline-variant/60 dark:bg-surface-variant' 
                              : 'bg-surface-container-low border border-transparent hover:border-primary-container/30 dark:bg-surface-variant'
                        }`}
                      >
                        <span className={`text-label-md uppercase ${isSelected ? 'opacity-80' : 'text-on-surface-variant'}`}>{d.day}</span>
                        <div className="font-bold text-headline-md my-base">
                          {isRest ? '🛋️' : d.date}
                        </div>
                        
                        <div className="flex flex-col gap-base min-h-[12px] pt-xs">
                          {isRest ? (
                            <span className="text-[9px] font-extrabold text-secondary uppercase">Rest</span>
                          ) : hours > 0 ? (
                            <div className={`h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'} transition-all`} style={{ width: `${Math.min(hours * 25, 100)}%` }} />
                          ) : (
                            <span className="h-1 bg-surface-container-highest dark:bg-surface-variant w-1/3 mx-auto rounded-full"></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Day's generated Study Plan details list */}
            {subjects.length > 0 && (
              <div className="mt-md border-t border-outline-variant/30 pt-md text-left">
                <div className="flex justify-between items-center mb-sm">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm text-primary">menu_book</span>
                    Generated Study Plan: {activeDay === 'Mon' ? 'Monday' : activeDay === 'Tue' ? 'Tuesday' : activeDay === 'Wed' ? 'Wednesday' : activeDay === 'Thu' ? 'Thursday' : activeDay === 'Fri' ? 'Friday' : activeDay === 'Sat' ? 'Saturday' : 'Sunday'}
                  </h4>
                  <button 
                    onClick={() => toggleRestDay(activeDay)}
                    className={`text-xs font-bold px-sm py-[4px] rounded-lg border transition-all flex items-center gap-xs ${
                      restDays.includes(activeDay)
                        ? 'bg-secondary/10 border-secondary/30 text-secondary'
                        : 'bg-surface-container-high hover:bg-surface-container-highest border-outline-variant/60 text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">bed</span>
                    {restDays.includes(activeDay) ? 'Mark as Study Day' : 'Mark as Rest Day'}
                  </button>
                </div>
                
                {restDays.includes(activeDay) ? (
                  <div className="bg-secondary/5 border border-dashed border-secondary/20 rounded-xl p-md text-center space-y-xs my-xs">
                    <span className="text-2xl">🛋️</span>
                    <p className="text-xs font-bold text-secondary">It's a designated Rest Day!</p>
                    <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto font-medium">
                      No study sessions are scheduled. Relax, clear your mind, and recharge for the upcoming week.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-xs pt-xs">
                    {weeklySchedule.filter(s => s.day === activeDay).map(slot => {
                      const [startH, startM] = slot.startTime.split(':').map(Number);
                      const [endH, endM] = slot.endTime.split(':').map(Number);
                      const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
                      
                      return (
                        <li key={slot.id} className="flex justify-between items-center bg-surface-container-low dark:bg-surface-variant/20 p-xs px-sm rounded-lg border border-outline-variant/20 text-xs">
                          <div className="flex items-center gap-sm">
                            <span className={`w-2 h-2 rounded-full bg-${slot.color}`} />
                            <span className="font-bold text-on-surface">{slot.name}</span>
                          </div>
                          <span className="font-bold text-primary">{durationHours.toFixed(1)} Hours ({slot.startTime} - {slot.endTime})</span>
                        </li>
                      );
                    })}
                    {weeklySchedule.filter(s => s.day === activeDay).length === 0 && (
                      <p className="text-xs text-on-surface-variant italic font-semibold py-xs">No study blocks generated for this day.</p>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Pomodoro Focus Session Card */}
          <div className="col-span-12 xl:col-span-4 glass-card border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-between text-center relative overflow-hidden h-fit xl:h-full">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAACMZr7utpTRjvNun_2WimhgiQyE0qcOe8aARMhoc-ftfx-yKrWyJOO1JEwzCJI0vHHT96UoYNsCtcfUSl_tKSSzmvmV0IkrpJZdzZQypsgnYtGZg0cmSi2gWJJ2TA_CVC6SUIWAgBbd5bk9Zlx627hsRUCoeJZQ41OVO4ZKi7ElDvCI1awiFnek_MCGdaqEF99qaajfWk5y1YjkIoSU86cPnUrkSPEzeHStdJGRnT1r0ecAw_C_xiFYYiLY6ONJa2FWn44tH5sg" alt="Timer Background" />
            </div>
            
            <div className="relative z-10 w-full space-y-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-label-md text-primary font-bold tracking-widest uppercase">Focus Session</span>
                
                {/* Mode Selector Dropdown */}
                <select 
                  value={timerMode} 
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="text-xs font-bold bg-surface-container-high dark:bg-surface-variant border border-outline-variant/60 rounded px-xs py-base text-on-surface outline-none cursor-pointer"
                >
                  <option value="25/5">25 / 5 Mode</option>
                  <option value="45/10">45 / 10 Mode</option>
                  <option value="60/15">60 / 15 Mode</option>
                  <option value="Custom">Custom Mode</option>
                </select>
              </div>

              {/* Countdown Timer Display */}
              <div className="text-[64px] font-bold text-on-surface leading-none tracking-tighter tabular-nums my-xs">
                {formatTime(timeLeft)}
              </div>

              {/* Custom Input controls if Custom selected */}
              {timerMode === 'Custom' && (
                <div className="flex gap-xs items-center justify-center text-xs text-on-surface-variant">
                  <span>Focus (mins):</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="180" 
                    value={focusDuration} 
                    onChange={handleCustomFocusChange}
                    className="w-12 text-center bg-surface-container border border-outline-variant rounded" 
                  />
                  <span>Break (mins):</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="60" 
                    value={breakDuration} 
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-12 text-center bg-surface-container border border-outline-variant rounded" 
                  />
                </div>
              )}

              {/* Subject & Task Selection Dropdowns */}
              <div className="grid grid-cols-2 gap-xs text-left">
                <div className="space-y-base">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Target Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full text-xs bg-surface-container border border-outline-variant/60 rounded p-xs text-on-surface outline-none"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-base">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Study Task</label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full text-xs bg-surface-container border border-outline-variant/60 rounded p-xs text-on-surface outline-none"
                  >
                    <option value="">General Study</option>
                    {tasks.filter(t => !t.done && (!selectedSubjectId || t.subjectId === selectedSubjectId)).map(t => (
                      <option key={t.id} value={t.id}>{t.text}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controller buttons */}
              <div className="flex gap-sm justify-center pt-xs">
                <button onClick={toggleTimer} className={`w-10 h-10 flex items-center justify-center text-white rounded-full shadow-md hover:scale-105 transition-transform ${isTimerActive ? 'bg-secondary' : 'bg-primary'}`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isTimerActive ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button onClick={resetTimer} className="w-10 h-10 flex items-center justify-center border border-outline-variant bg-white dark:bg-surface-variant text-on-surface rounded-full hover:bg-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                </button>
              </div>

              {/* Pomodoro Focus Stats Row */}
              <div className="border-t border-outline-variant/40 pt-md grid grid-cols-3 gap-xs text-center text-on-surface-variant">
                <div>
                  <span className="text-[9px] uppercase font-bold block">Daily Focus</span>
                  <strong className="text-body-md font-bold text-on-surface tabular-nums">{focusStats.dailyTime || 0}m</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold block">Weekly Focus</span>
                  <strong className="text-body-md font-bold text-on-surface tabular-nums">{focusStats.weeklyTime || 0}m</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold block">Total Focus</span>
                  <strong className="text-body-md font-bold text-on-surface tabular-nums">{focusStats.totalTime || 0}m</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-12 gap-lg">
          {/* Upcoming Exam Countdown Card (Dynamic with add modals & custom colors) */}
          <div 
            className={`col-span-12 md:col-span-4 rounded-xl p-lg shadow-[0_4px_20px_rgba(0,102,255,0.03)] border relative overflow-hidden flex flex-col justify-between group h-64 ${cardStyle.bg} ${cardStyle.border}`}
          >
            <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-[160px] text-black">alarm</span>
            </div>
            
            {/* Countdown layout */}
            <div className="z-10 w-full text-left">
              <div className="flex justify-between items-center w-full">
                <h4 className="font-bold text-headline-sm flex items-center gap-xs text-black">
                  <span className="material-symbols-outlined text-black">event_upcoming</span>
                  Upcoming Exam
                </h4>
                <div className="flex gap-sm">
                  <button onClick={() => setIsManageExamsOpen(!isManageExamsOpen)} className="text-xs font-extrabold text-black hover:underline" title="Manage all exams">
                    {isManageExamsOpen ? 'Back' : 'Manage'}
                  </button>
                  <button onClick={() => setIsExamModalOpen(true)} className="text-xs font-extrabold text-black hover:underline">
                    + Add
                  </button>
                </div>
              </div>

              {!isManageExamsOpen ? (
                // Renders nearest exam details safely
                nearestExam ? (
                  <div className="mt-sm space-y-xs text-black">
                    <p className="text-body-md font-extrabold text-black truncate">{nearestExam.title}</p>
                    <p className="text-xs font-bold text-black">
                      {nearestExam.room ? `${nearestExam.room} • ` : ''}{nearestExam.time || 'All Day'}
                    </p>
                    {nearestExam.notes && <p className="text-[11px] opacity-75 mt-xs italic truncate font-bold text-black">"{nearestExam.notes}"</p>}
                    
                    <div className="mt-md flex items-end gap-xs text-black">
                      {(nearestExam.daysLeft || '').includes('Days left') ? (
                        <>
                          <span className="text-[42px] font-black leading-none tabular-nums text-black">
                            {(nearestExam.daysLeft || '0').split(' ')[0]}
                          </span>
                          <span className="text-xs font-bold pb-1 text-black">Days left</span>
                        </>
                      ) : (
                        <span className="text-[24px] font-black leading-none tabular-nums text-black">
                          {nearestExam.daysLeft || 'Not Set'}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-lg text-black font-extrabold text-xs">
                    No upcoming exams scheduled.
                  </div>
                )
              ) : (
                // Renders manage exams lists safely in black text
                <div className="mt-sm space-y-sm max-h-[140px] overflow-y-auto pr-xs custom-scrollbar text-black font-semibold">
                  {exams.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center text-xs font-bold py-xs border-b border-black/10 text-black">
                      <div className="truncate flex-1 pr-sm text-black">
                        <p className="truncate font-extrabold text-black">{ex.title}</p>
                        <p className="text-[10px] opacity-80 text-black font-extrabold">{ex.date}</p>
                      </div>
                      <div className="flex items-center gap-sm text-black">
                        <span className="text-[10px] text-black font-extrabold">{ex.daysLeft || 'Not Set'}</span>
                        <button onClick={() => deleteExam(ex.id)} className="text-black hover:text-red-700">
                          <span className="material-symbols-outlined text-[16px] text-black">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <p className="text-center text-[11px] py-base opacity-75 text-black">No exams added yet.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            {nearestExam && (
              <div className="absolute bottom-xs right-sm text-[8px] uppercase font-black text-black bg-black/5 px-xs py-base rounded">
                Status: {cardStyle.label}
              </div>
            )}
          </div>

          {/* AI Smart Suggestion Card */}
          <div className="col-span-12 md:col-span-8 ai-insight-border shadow-[0_4px_20px_rgba(0,102,255,0.03)] h-64">
            <div className="bg-white dark:bg-surface-container-lowest rounded-xl p-lg h-full flex flex-col sm:flex-row gap-md items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-white text-[28px]">psychology</span>
              </div>
              <div className="flex-grow ml-sm text-left">
                <h4 className="font-bold text-headline-sm text-on-surface">AI Smart Suggestion</h4>
                
                {currentSuggestion ? (
                  <div className="space-y-sm mt-xs">
                    <p className="text-body-sm text-on-surface-variant leading-relaxed font-semibold" dangerouslySetInnerHTML={{__html: (currentSuggestion.text || '').replace(/\*\*(.*?)\*\*/g, '<span class="text-secondary font-extrabold">$1</span>')}} />
                    <div className="flex gap-sm pt-xs">
                      <button 
                        onClick={() => applyAdjustment(currentSuggestion.id)} 
                        className="text-primary font-bold text-xs hover:underline cursor-pointer border border-primary/20 bg-primary/5 px-sm py-xs rounded-lg transition-all"
                      >
                        Apply Adjustment
                      </button>
                      <button 
                        onClick={() => dismissSuggestion(currentSuggestion.id)} 
                        className="text-on-surface-variant text-xs hover:text-on-surface font-bold hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant mt-sm font-semibold italic">
                    Great study consistency! No recommendations currently generated. Check back as your progress changes.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-12 gap-lg">
          {/* Subject Priority Card */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_4px_20px_rgba(0,102,255,0.03)] h-fit md:h-full flex flex-col font-medium">
            <div className="flex justify-between items-center mb-md shrink-0">
              <h3 className="font-bold text-headline-sm text-on-surface">Subject Priority</h3>
              <span className="material-symbols-outlined text-primary text-sm">low_priority</span>
            </div>
            <div className="space-y-sm overflow-y-auto max-h-[300px] flex-1 pr-xs custom-scrollbar">
              {[...subjects].map((sub) => {
                const currentPriority = sub.priority || 'Medium';
                const color = currentPriority === 'High' ? 'error' : currentPriority === 'Medium' ? 'secondary' : 'primary';
                const letter = currentPriority.charAt(0);
                return (
                  <div key={sub.id} className={`flex items-center justify-between p-sm bg-surface-container-low dark:bg-surface-variant rounded-lg border-l-4 border-${color}`}>
                    <div className="flex items-center gap-sm">
                      <div className={`w-8 h-8 bg-${color}-container text-${color} rounded-full flex items-center justify-center`}>
                        <span className="text-label-md font-bold">{letter}</span>
                      </div>
                      <span className="font-semibold text-xs text-on-surface truncate max-w-[120px]">{sub.name}</span>
                    </div>
                    <span className={`text-[10px] text-${color} font-bold uppercase`}>{currentPriority} Priority</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Goals Card */}
          <div className="col-span-12 md:col-span-8 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_4px_20px_rgba(0,102,255,0.03)] h-fit md:h-full flex flex-col">
            <div className="flex justify-between items-center mb-md shrink-0">
              <div>
                <h3 className="font-bold text-headline-sm text-on-surface">Daily Goals</h3>
                <p className="text-body-sm text-on-surface-variant">{tasks.filter(t => t.done).length} of {tasks.length} tasks completed</p>
              </div>
              <button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} className="bg-surface-container text-primary font-bold px-md py-xs rounded-full text-body-sm hover:bg-surface-container-high transition-colors">+ Add Task</button>
            </div>
            <div className="space-y-base overflow-y-auto max-h-[300px] flex-1 pr-xs custom-scrollbar pb-xs">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-md group p-xs hover:bg-surface dark:hover:bg-surface-variant transition-colors rounded-lg">
                  <div 
                    onClick={() => updateTask(task.id, { done: !task.done })}
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${task.done ? 'border-primary-container bg-primary-container' : 'border-outline hover:border-primary-container'}`}
                  >
                    {task.done && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                  </div>
                  <div className="flex-1 flex flex-col cursor-pointer truncate text-left" onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}>
                    <span className={`text-xs text-on-surface font-semibold ${task.done ? 'line-through opacity-50' : ''}`}>{task.text}</span>
                    {task.subjectId && <span className="text-[9px] text-on-surface-variant uppercase mt-[2px]">{subjects.find(s => s.id === task.subjectId)?.name || 'General'}</span>}
                  </div>
                  <span className="text-[10px] bg-surface-container-highest dark:bg-surface-variant px-xs py-base rounded uppercase text-on-surface-variant font-bold shrink-0">{task.time} min</span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-error hover:bg-error/20 rounded-full w-8 h-8 flex items-center justify-center transition-all shrink-0">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-body-sm text-on-surface-variant py-md italic font-semibold">No tasks scheduled for today.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_4px_20px_rgba(0,102,255,0.03)] flex flex-col space-y-md">
          <div className="flex justify-between items-center w-full">
            <div className="text-left">
              <h3 className="font-bold text-headline-sm text-on-surface">Timetable Planner Grid</h3>
              <p className="text-xs text-on-surface-variant">Drag subjects from tray and drop into calendar cells.</p>
            </div>
            <button 
              onClick={() => generateSmartSchedule()} 
              className="bg-primary text-white text-xs font-bold px-md py-sm rounded-lg hover:shadow-md transition-all active:scale-95 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span> Generate AI Smart Schedule
            </button>
          </div>

          {/* Subject Tray */}
          <div className="p-sm bg-surface-container-low dark:bg-surface-variant rounded-xl border border-outline-variant/40 text-left">
            <h4 className="font-bold text-xs text-on-surface mb-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span> Draggable Course Tray
            </h4>
            <div className="flex flex-wrap gap-xs pt-xs">
              {subjects.map(sub => (
                <div
                  key={sub.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('subjectId', sub.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className={`px-sm py-xs rounded-lg font-bold bg-${sub.color}-fixed text-on-surface dark:text-white text-[11px] cursor-grab active:cursor-grabbing hover:shadow border border-${sub.color}/30 flex items-center gap-xs select-none`}
                >
                  <span className="material-symbols-outlined text-[13px]">{sub.icon}</span>
                  {sub.name} ({sub.shortName})
                </div>
              ))}
            </div>
          </div>

          {/* Draggable Weekly Timeline Columns Mon - Sun */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-sm min-h-[300px] pt-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
              const daySlots = weeklySchedule.filter(s => s.day === day);
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;
              const isRest = restDays.includes(day);
              
              return (
                <div
                  key={day}
                  onDragOver={(e) => {
                    if (!isRest) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (isRest) return;
                    e.preventDefault();
                    const subId = e.dataTransfer.getData('subjectId');
                    const slotId = e.dataTransfer.getData('slotId');
                    
                    if (subId) {
                      const sub = subjects.find(s => s.id === subId);
                      if (sub) {
                        addScheduleSlot({
                          subjectId: sub.id,
                          day,
                          startTime: '10:00',
                          endTime: '11:30',
                          name: sub.name,
                          color: sub.color
                        });
                      }
                    } else if (slotId) {
                      updateScheduleSlot(slotId, { day });
                    }
                  }}
                  className={`p-xs rounded-xl border transition-all flex flex-col justify-between min-h-[220px] ${
                    isRest
                      ? 'bg-secondary/5 dark:bg-surface-variant/5 border-dashed border-outline-variant/30 opacity-70'
                      : isToday 
                        ? 'bg-primary/5 border-primary/40 shadow-sm' 
                        : 'bg-surface-container-low dark:bg-surface-variant/40 border-outline-variant/30 hover:border-primary/20'
                  }`}
                >
                  <div className="mb-sm flex justify-between items-center p-xs shrink-0">
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isRest ? 'text-secondary' : isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</span>
                    <span className="text-[9px] text-on-surface-variant bg-surface-container px-xs py-base rounded font-bold">
                      {isRest ? 'Rest' : `${daySlots.length} Slots`}
                    </span>
                  </div>
                  
                  <div className="space-y-sm flex-1 min-h-[160px] flex flex-col justify-start p-xs">
                    {isRest ? (
                      <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-xs py-lg text-secondary">
                        <span className="text-xl">🛋️</span>
                        <span className="text-[9px] font-bold uppercase mt-base text-secondary/70">Rest Day</span>
                      </div>
                    ) : (
                      daySlots.map(slot => (
                        <div
                          key={slot.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('slotId', slot.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className={`p-xs rounded-lg bg-${slot.color}-fixed/40 dark:bg-${slot.color}/20 border-l-4 border-${slot.color} hover:shadow transition-all relative group cursor-grab active:cursor-grabbing text-[11px] text-on-surface dark:text-white text-left`}
                        >
                          <button
                            onClick={() => deleteScheduleSlot(slot.id)}
                            className="absolute right-base top-base opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/10 w-4 h-4 flex items-center justify-center rounded-full"
                          >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                          
                          <p className="font-extrabold truncate pr-3">{slot.name}</p>
                          <p className="text-[9px] text-on-surface-variant dark:text-white/60 font-bold mt-base flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            {slot.startTime} - {slot.endTime}
                          </p>
                          
                          {/* +/- resize duration controls */}
                          <div className="mt-base flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity justify-end shrink-0">
                            <button
                              onClick={() => handleAdjustSlotDuration(slot, -30)}
                              className="w-4 h-4 rounded border border-outline-variant/50 flex items-center justify-center hover:bg-surface-container bg-surface dark:bg-white/10 dark:text-white dark:border-white/20 font-bold text-[10px]"
                              title="Decrease duration by 30m"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleAdjustSlotDuration(slot, 30)}
                              className="w-4 h-4 rounded border border-outline-variant/50 flex items-center justify-center hover:bg-surface-container bg-surface dark:bg-white/10 dark:text-white dark:border-white/20 font-bold text-[10px]"
                              title="Increase duration by 30m"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {!isRest && daySlots.length === 0 && (
                      <div className="h-full flex-1 border border-dashed border-outline-variant/40 rounded-lg flex items-center justify-center text-center p-sm py-lg">
                        <span className="text-[9px] text-on-surface-variant font-semibold block">Drop here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Add Task Button */}
      {subjects.length > 0 && (
        <button 
          onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} 
          className="fixed bottom-lg right-lg w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 hover:shadow-2xl"
        >
          <span className="material-symbols-outlined text-[28px]">add_task</span>
        </button>
      )}

      {/* Dynamic Inline Upcoming Exams Add Modal */}
      <AnimatePresence>
        {isExamModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface dark:bg-surface-container-low border border-outline-variant rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-lg border-b border-outline-variant">
                <h2 className="font-headline-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">event_upcoming</span>
                  Add Upcoming Exam
                </h2>
                <button onClick={() => setIsExamModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="p-lg">
                <form id="exam-form" onSubmit={handleExamSubmit} className="space-y-md text-left">
                  <div className="space-y-xs">
                    <label className="text-xs font-bold text-on-surface-variant uppercase block">Exam Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={examForm.title} 
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface text-xs font-semibold"
                      placeholder="e.g. Advanced Mathematics"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="text-xs font-bold text-on-surface-variant uppercase block">Exam Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={examForm.date} 
                        onChange={(e) => setExamForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="text-xs font-bold text-on-surface-variant uppercase block">Exam Time (Optional)</label>
                      <input 
                        type="text" 
                        value={examForm.time} 
                        onChange={(e) => setExamForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface text-xs font-semibold"
                        placeholder="e.g. 09:00 AM"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="text-xs font-bold text-on-surface-variant uppercase block">Room Number (Optional)</label>
                    <input 
                      type="text" 
                      value={examForm.room} 
                      onChange={(e) => setExamForm(prev => ({ ...prev, room: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface text-xs font-semibold"
                      placeholder="e.g. Room 402"
                    />
                  </div>

                  <div className="space-y-xs">
                    <label className="text-xs font-bold text-on-surface-variant uppercase block">Notes (Optional)</label>
                    <textarea 
                      value={examForm.notes} 
                      onChange={(e) => setExamForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface text-xs font-semibold h-20"
                      placeholder="e.g. Unit 1-5 Included"
                    />
                  </div>
                </form>
              </div>
              
              <div className="p-lg border-t border-outline-variant flex justify-end gap-sm bg-surface-container-low dark:bg-surface">
                <button onClick={() => setIsExamModalOpen(false)} type="button" className="px-md py-xs rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all text-xs">
                  Cancel
                </button>
                <button type="submit" form="exam-form" className="px-lg py-xs bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all text-xs active:scale-95">
                  Save Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask} 
        task={editingTask} 
      />
    </div>
  );
}

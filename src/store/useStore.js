import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { metrics as defaultMetrics, subjects as initialSubjects, reminders as initialReminders, tasks as initialTasks, exams as initialExams } from '../data/mockData';
import { computeMetrics } from './computeMetrics';

// Helper to get YYYY-MM-DD string in local time
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate sample study log for past 14 days + today (seeded once for demo user)
const generateSampleStudyLog = () => {
  const log = [];
  const today = new Date();
  // index 0 = today, 1 = yesterday, ..., 14 = 14 days ago
  const minutePattern = [75, 45, 90, 120, 75, 105, 60, 30, 90, 135, 80, 110, 95, 45, 120];
  for (let i = 0; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    log.push({ date: `${year}-${month}-${day}`, minutes: minutePattern[i] });
  }
  return log;
};

// Returns a YYYY-MM-DD string for today + offsetDays
const getDateOffsetStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check and update streak logic
const checkAndUpdateStreak = (metricsObj) => {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  
  let current = metricsObj.streak || 0;
  let lastLogin = metricsObj.lastLoginDate || '';
  let longest = metricsObj.longestStreak || current || 1;
  
  if (!lastLogin) {
    // Brand new user or first login ever
    current = 1;
    lastLogin = today;
    longest = 1;
  } else if (lastLogin === today) {
    // Already logged in today, do not increase streak
  } else if (lastLogin === yesterday) {
    // Consecutive day login!
    current = current + 1;
    lastLogin = today;
    if (current > longest) {
      longest = current;
    }
  } else {
    // Streak broken!
    current = 1;
    lastLogin = today;
    if (current > longest) {
      longest = current;
    }
  }
  
  return {
    ...metricsObj,
    streak: current,
    lastLoginDate: lastLogin,
    longestStreak: longest,
  };
};

// Helper to initialize custom profile and defaults for new accounts
const createDefaultUserData = (email) => {
  const isDefaultUser = email === 'ajay.raj@university.edu';
  return {
    profile: {
      firstName: isDefaultUser ? "Ajay" : email.split('@')[0],
      lastName: isDefaultUser ? "Raj" : "Student",
      fullName: isDefaultUser ? "Ajay Raj" : email.split('@')[0],
      role: "Level 4 Student",
      email: email,
      avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      biography: "Senior student focusing on academic excellence and tracking progress with SAPAS.",
      notifications: { gradeUpdates: true, deadlines: true, aiTips: false, announcements: true },
      aiMode: "Adaptive Learning",
      compactView: false,
    },
    metrics: { 
      ...defaultMetrics,
      streak: isDefaultUser ? 12 : 0,
      lastLoginDate: isDefaultUser ? getYesterdayStr() : '', 
      longestStreak: isDefaultUser ? 12 : 0,
      targetCGPA: isDefaultUser ? 8.50 : undefined,
      previousGPA: isDefaultUser ? 8.10 : undefined,
    },
    subjects: [...initialSubjects],
    reminders: [...initialReminders],
    tasks: [...initialTasks],
    exams: isDefaultUser ? [
      { id: 'exam1', title: 'Advanced Mathematics', date: '2026-06-05', time: '09:00 AM', room: 'Room 402', notes: 'Unit 1-5 Included' }
    ] : [],
    weeklySchedule: isDefaultUser ? [
      { id: 'slot1', subjectId: 'sub1', day: 'Mon', startTime: '09:00', endTime: '11:30', name: 'Algorithm Lab', color: 'primary' },
      { id: 'slot2', subjectId: 'sub3', day: 'Tue', startTime: '12:30', endTime: '14:00', name: 'Economics', color: 'secondary' },
      { id: 'slot3', subjectId: 'sub4', day: 'Wed', startTime: '16:00', endTime: '17:30', name: 'Self Study', color: 'tertiary' },
      { id: 'slot4', subjectId: 'sub2', day: 'Thu', startTime: '10:00', endTime: '12:00', name: 'Data Structure', color: 'primary' },
      { id: 'slot5', subjectId: 'sub5', day: 'Fri', startTime: '09:00', endTime: '11:00', name: 'Statistics', color: 'secondary' }
    ] : [],
    focusStats: {
      totalTime: isDefaultUser ? 120 : 0,
      dailyTime: isDefaultUser ? 25 : 0,
      weeklyTime: isDefaultUser ? 50 : 0,
      lastFocusDate: getTodayStr(),
    },
    dismissedSuggestionIds: [],
    restDays: [],
    milestones: isDefaultUser ? [
      {
        id: 'ms1',
        title: 'Complete DAA Unit 3',
        description: 'Finish dynamic programming chapters and solve practice problems',
        deadline: getDateOffsetStr(14),
        priority: 'High',
        progress: 65,
        subjectId: 'sub1',
        status: 'in_progress',
        createdAt: getDateOffsetStr(-7),
      },
      {
        id: 'ms2',
        title: 'Submit Data Structures Project',
        description: 'Complete AVL tree implementation and prepare documentation',
        deadline: getDateOffsetStr(7),
        priority: 'Critical',
        progress: 80,
        subjectId: 'sub2',
        status: 'in_progress',
        createdAt: getDateOffsetStr(-14),
      },
      {
        id: 'ms3',
        title: 'Reach Target CGPA',
        description: 'Maintain consistent performance across all subjects to achieve target CGPA',
        deadline: getDateOffsetStr(60),
        priority: 'High',
        progress: 40,
        subjectId: '',
        status: 'in_progress',
        createdAt: getDateOffsetStr(-30),
      },
    ] : [],
    studyLog: isDefaultUser ? generateSampleStudyLog() : [],
  };
};

const fallbackEmail = 'ajay.raj@university.edu';
const fallbackData = createDefaultUserData(fallbackEmail);
const fallbackComputed = computeMetrics(fallbackData);

const useStore = create(
  persist(
    (set, get) => ({
      // Hydration sentinel — false until localStorage has been read
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      isAuthenticated: false,
      currentUserEmail: '',
      
      // Active student metrics (hot-swapped on login/auth rehydration)
      profile: fallbackComputed.profile,
      metrics: fallbackComputed.metrics,
      subjects: fallbackComputed.subjects,
      reminders: fallbackComputed.reminders,
      tasks: fallbackComputed.tasks,
      exams: fallbackComputed.exams,
      weeklySchedule: fallbackComputed.weeklySchedule || [],
      focusStats: fallbackComputed.focusStats || { totalTime: 0, dailyTime: 0, weeklyTime: 0, lastFocusDate: '' },
      aiSuggestions: fallbackComputed.aiSuggestions || [],
      dismissedSuggestionIds: [],
      restDays: fallbackComputed.restDays || [],
      milestones: fallbackComputed.milestones || [],
      studyLog: fallbackComputed.studyLog || [],
      aiInsights: fallbackComputed.aiInsights,
      isDarkMode: false,
      
      // Central client-side user database
      usersData: {
        'ajay.raj@university.edu': fallbackData
      },

      login: (email, fullName) => {
        const cleanEmail = email ? email.trim().toLowerCase() : 'ajay.raj@university.edu';
        
        let allUsers = { ...get().usersData };
        let userData = allUsers[cleanEmail];
        
        // Seed new account if none exists in database
        if (!userData) {
          userData = createDefaultUserData(cleanEmail);
        }
        
        // Update signup full name details
        if (fullName) {
          const parts = fullName.trim().split(' ');
          userData.profile.firstName = parts[0] || '';
          userData.profile.lastName = parts.slice(1).join(' ') || 'Student';
          userData.profile.fullName = fullName;
        }

        // Daily Streak calculation
        userData.metrics = checkAndUpdateStreak(userData.metrics);

        // ── Migration: seed new fields for existing accounts that predate them ──
        // milestones and studyLog were added later; existing persisted userData won't
        // have them. If missing, seed from the default template so the page isn't empty.
        const defaultTemplate = createDefaultUserData(cleanEmail);
        if (!userData.milestones || userData.milestones.length === 0) {
          userData.milestones = defaultTemplate.milestones;
        }
        if (!userData.studyLog || userData.studyLog.length === 0) {
          userData.studyLog = defaultTemplate.studyLog;
        }

        // ── Migration: ensure today always has an entry in studyLog ──
        // The old generator started from i=1 (yesterday), so today was missing.
        // If today has no log entry, add one for the demo user so the chart shows today's bar.
        const todayStr = getTodayStr();
        const hasTodayEntry = userData.studyLog.some(e => e.date === todayStr);
        if (!hasTodayEntry && cleanEmail === fallbackEmail) {
          userData.studyLog = [{ date: todayStr, minutes: 75 }, ...userData.studyLog];
        }
        
        // Update database namespace
        allUsers[cleanEmail] = userData;


        const computed = computeMetrics({
          profile: userData.profile,
          metrics: userData.metrics,
          subjects: userData.subjects,
          reminders: userData.reminders,
          tasks: userData.tasks,
          exams: userData.exams,
          weeklySchedule: userData.weeklySchedule || [],
          focusStats: userData.focusStats || { totalTime: 0, dailyTime: 0, weeklyTime: 0, lastFocusDate: '' },
          dismissedSuggestionIds: userData.dismissedSuggestionIds || [],
          restDays: userData.restDays || [],
          milestones: userData.milestones || [],
          studyLog: userData.studyLog || [],
        });

        set({
          isAuthenticated: true,
          currentUserEmail: cleanEmail,
          profile: computed.profile,
          metrics: computed.metrics,
          subjects: computed.subjects,
          reminders: computed.reminders,
          tasks: computed.tasks,
          exams: computed.exams,
          weeklySchedule: computed.weeklySchedule || [],
          focusStats: computed.focusStats || { totalTime: 0, dailyTime: 0, weeklyTime: 0, lastFocusDate: '' },
          aiSuggestions: computed.aiSuggestions || [],
          dismissedSuggestionIds: userData.dismissedSuggestionIds || [],
          restDays: userData.restDays || [],
          aiInsights: computed.aiInsights,
          milestones: userData.milestones || [],
          studyLog: userData.studyLog || [],
          usersData: allUsers
        });
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false, 
          currentUserEmail: '',
          profile: fallbackComputed.profile,
          metrics: fallbackComputed.metrics,
          subjects: fallbackComputed.subjects,
          reminders: fallbackComputed.reminders,
          tasks: fallbackComputed.tasks,
          exams: fallbackComputed.exams,
          weeklySchedule: fallbackComputed.weeklySchedule || [],
          focusStats: fallbackComputed.focusStats || { totalTime: 0, dailyTime: 0, weeklyTime: 0, lastFocusDate: '' },
          aiSuggestions: fallbackComputed.aiSuggestions || [],
          dismissedSuggestionIds: [],
          restDays: fallbackComputed.restDays || [],
          aiInsights: fallbackComputed.aiInsights,
          milestones: fallbackComputed.milestones || [],
          studyLog: fallbackComputed.studyLog || [],
        });
      },
      
      updateProfile: (updates) => set((state) => {
        const newProfile = { ...state.profile, ...updates };
        if (updates.firstName !== undefined || updates.lastName !== undefined) {
          newProfile.fullName = `${newProfile.firstName} ${newProfile.lastName}`;
        }
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            profile: newProfile
          }
        } : state.usersData;

        return { 
          profile: newProfile,
          usersData: updatedUsersData
        };
      }),
      
      updateMetrics: (updates) => set((state) => {
        const newMetrics = { ...state.metrics, ...updates };
        const computed = computeMetrics({ ...state, metrics: newMetrics });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            metrics: computed.metrics,
            subjects: computed.subjects,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      // CRUD Operations for Subjects
      addSubject: (subject) => set((state) => {
        if (state.subjects.length >= 6) {
          alert("Maximum limit of 6 subjects reached. You cannot add more than 6 subjects.");
          return {};
        }
        const newSubjects = [...state.subjects, { ...subject, id: `sub_${Date.now()}` }];
        const computed = computeMetrics({ ...state, subjects: newSubjects });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            subjects: computed.subjects,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      updateSubject: (id, updates) => set((state) => {
        const newSubjects = state.subjects.map(sub => sub.id === id ? { ...sub, ...updates } : sub);
        const computed = computeMetrics({ ...state, subjects: newSubjects });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            subjects: computed.subjects,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      deleteSubject: (id) => set((state) => {
        const newSubjects = state.subjects.filter(sub => sub.id !== id);
        // Also automatically clear schedule slots linked to this subject!
        const newSchedule = (state.weeklySchedule || []).filter(slot => slot.subjectId !== id);
        const computed = computeMetrics({ ...state, subjects: newSubjects, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            subjects: computed.subjects,
            weeklySchedule: newSchedule,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),

      reorderSubjects: (startIndex, endIndex) => set((state) => {
        const newSubjects = Array.from(state.subjects);
        const [removed] = newSubjects.splice(startIndex, 1);
        newSubjects.splice(endIndex, 0, removed);
        const computed = computeMetrics({ ...state, subjects: newSubjects });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            subjects: computed.subjects,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      // CRUD for Reminders
      addReminder: (reminder) => set((state) => {
        const newReminders = [...state.reminders, { ...reminder, id: `rem_${Date.now()}`, completed: reminder.completed ?? false }];
        const computed = computeMetrics({ ...state, reminders: newReminders });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            reminders: computed.reminders,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      updateReminder: (id, updates) => set((state) => {
        const newReminders = state.reminders.map(rem => rem.id === id ? { ...rem, ...updates } : rem);
        const computed = computeMetrics({ ...state, reminders: newReminders });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            reminders: computed.reminders,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      deleteReminder: (id) => set((state) => {
        const newReminders = state.reminders.filter(rem => rem.id !== id);
        const computed = computeMetrics({ ...state, reminders: newReminders });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            reminders: computed.reminders,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      // CRUD for Tasks
      addTask: (task) => set((state) => {
        const newTasks = [...state.tasks, { ...task, id: `task_${Date.now()}` }];
        const computed = computeMetrics({ ...state, tasks: newTasks });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            tasks: computed.tasks,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),
      
      updateTask: (id, updates) => set((state) => {
        const newTasks = state.tasks.map(task => task.id === id ? { ...task, ...updates } : task);
        const computed = computeMetrics({ ...state, tasks: newTasks });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            tasks: computed.tasks,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      deleteTask: (id) => set((state) => {
        const newTasks = state.tasks.filter(task => task.id !== id);
        const computed = computeMetrics({ ...state, tasks: newTasks });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            tasks: computed.tasks,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      // CRUD for Exams
      addExam: (exam) => set((state) => {
        const newExams = [...state.exams, { ...exam, id: `exam_${Date.now()}` }];
        const computed = computeMetrics({ ...state, exams: newExams });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            exams: computed.exams,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      updateExam: (id, updates) => set((state) => {
        const newExams = state.exams.map(exam => exam.id === id ? { ...exam, ...updates } : exam);
        const computed = computeMetrics({ ...state, exams: newExams });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            exams: computed.exams,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      deleteExam: (id) => set((state) => {
        const newExams = state.exams.filter(exam => exam.id !== id);
        const computed = computeMetrics({ ...state, exams: newExams });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            exams: computed.exams,
            metrics: computed.metrics,
            aiInsights: computed.aiInsights
          }
        } : state.usersData;

        return {
          ...computed,
          usersData: updatedUsersData
        };
      }),

      // Timetable Schedule Actions
      addScheduleSlot: (slot) => set((state) => {
        const newSchedule = [...(state.weeklySchedule || []), { ...slot, id: `slot_${Date.now()}` }];
        const computed = computeMetrics({ ...state, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            weeklySchedule: newSchedule,
          }
        } : state.usersData;

        return {
          ...computed,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),

      updateScheduleSlot: (id, updates) => set((state) => {
        const newSchedule = (state.weeklySchedule || []).map(slot => slot.id === id ? { ...slot, ...updates } : slot);
        const computed = computeMetrics({ ...state, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            weeklySchedule: newSchedule,
          }
        } : state.usersData;

        return {
          ...computed,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),

      deleteScheduleSlot: (id) => set((state) => {
        const newSchedule = (state.weeklySchedule || []).filter(slot => slot.id !== id);
        const computed = computeMetrics({ ...state, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            weeklySchedule: newSchedule,
          }
        } : state.usersData;

        return {
          ...computed,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),

      generateSmartSchedule: () => set((state) => {
        const userSubjects = state.subjects || [];
        if (userSubjects.length === 0) {
          alert("Please add at least one subject in the Home Dashboard first before generating a schedule.");
          return {};
        }

        const restDays = state.restDays || [];

        // 1. Analyze demand scores
        const subjectsWithNeeds = userSubjects.map(sub => {
          let score = 0;
          if (sub.priority === 'High') score += 3;
          if (sub.priority === 'Medium') score += 1;
          if (sub.progress < 60) score += 2;
          if (sub.attendance < 75) score += 2;
          
          const hasExam = state.exams?.some(ex => ex.title.toLowerCase().includes(sub.name.toLowerCase()) || (ex.subjectId && ex.subjectId === sub.id));
          if (hasExam) score += 4;
          
          return { sub, score };
        }).sort((a, b) => b.score - a.score);

        // 2. Escalation Logic
        const today = new Date();
        const hasApproachingExam = state.exams?.some(ex => {
          const examDate = new Date(ex.date);
          if (isNaN(examDate.getTime())) return false;
          const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 14;
        }) || false;

        const hasLowAttendance = userSubjects.some(sub => sub.attendance < 75);
        const hasWeakPerformance = userSubjects.some(sub => sub.progress < 60);
        const hasIncompleteGoals = state.tasks?.some(t => !t.done) || false;

        const isEscalated = hasApproachingExam || hasLowAttendance || hasWeakPerformance || hasIncompleteGoals;

        let newSchedule = [];
        let subIndex = 0;

        // 3. Generate Weekday Blocks (Mon - Fri)
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const weekdayTimes = [
          { start: '09:00', end: '11:00' },
          { start: '14:00', end: '16:00' }
        ];

        weekdays.forEach(day => {
          if (restDays.includes(day)) return; // Skip Rest Day

          weekdayTimes.forEach(time => {
            if (subjectsWithNeeds.length > 0) {
              const targetSub = subjectsWithNeeds[subIndex % subjectsWithNeeds.length].sub;
              newSchedule.push({
                id: `slot_${day}_${time.start}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                subjectId: targetSub.id,
                day,
                startTime: time.start,
                endTime: time.end,
                name: targetSub.name,
                color: targetSub.color || 'primary'
              });
              subIndex++;
            }
          });
        });

        // 4. Generate Weekend Blocks (Sat)
        if (!restDays.includes('Sat') && subjectsWithNeeds.length > 0) {
          const topSub = subjectsWithNeeds[0]?.sub || userSubjects[0];
          const secondSub = subjectsWithNeeds[1]?.sub || userSubjects[1] || topSub;
          const thirdSub = subjectsWithNeeds[2]?.sub || userSubjects[2] || secondSub || topSub;

          if (isEscalated) {
            // Intensive Escalated Saturday (matches user example: Math Revision, DAA Practice, Mock Test)
            newSchedule.push({
              id: `slot_Sat_1_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sat',
              startTime: '09:00',
              endTime: '11:00',
              name: `${topSub.name} Revision`,
              color: topSub.color || 'primary'
            });
            newSchedule.push({
              id: `slot_Sat_2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: secondSub.id,
              day: 'Sat',
              startTime: '13:00',
              endTime: '14:30',
              name: `${secondSub.name} Practice Questions`,
              color: secondSub.color || 'secondary'
            });
            newSchedule.push({
              id: `slot_Sat_3_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: thirdSub.id,
              day: 'Sat',
              startTime: '15:30',
              endTime: '16:30',
              name: `Mock Test`,
              color: 'tertiary'
            });
          } else {
            // Light Saturday
            newSchedule.push({
              id: `slot_Sat_light_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sat',
              startTime: '10:00',
              endTime: '11:30',
              name: `${topSub.name} Revision`,
              color: topSub.color || 'primary'
            });
          }
        }

        // 5. Generate Weekend Blocks (Sun)
        if (!restDays.includes('Sun') && subjectsWithNeeds.length > 0) {
          const topSub = subjectsWithNeeds[0]?.sub || userSubjects[0];
          const secondSub = subjectsWithNeeds[1]?.sub || userSubjects[1] || topSub;

          if (isEscalated) {
            // Intensive Escalated Sunday (matches user example: Weekly Review, OS Notes, Next Week Planning)
            newSchedule.push({
              id: `slot_Sun_1_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sun',
              startTime: '09:00',
              endTime: '10:00',
              name: `Weekly Review`,
              color: 'tertiary'
            });
            newSchedule.push({
              id: `slot_Sun_2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: secondSub.id,
              day: 'Sun',
              startTime: '11:00',
              endTime: '13:00',
              name: `${secondSub.name} Notes`,
              color: secondSub.color || 'primary'
            });
            newSchedule.push({
              id: `slot_Sun_3_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sun',
              startTime: '15:00',
              endTime: '15:30',
              name: `Next Week Planning`,
              color: 'secondary'
            });
          } else {
            // Light Sunday
            newSchedule.push({
              id: `slot_Sun_light_1_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sun',
              startTime: '10:00',
              endTime: '10:30',
              name: `Weekly Review`,
              color: 'tertiary'
            });
            newSchedule.push({
              id: `slot_Sun_light_2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              subjectId: topSub.id,
              day: 'Sun',
              startTime: '10:30',
              endTime: '11:00',
              name: `Next Week Planning`,
              color: 'secondary'
            });
          }
        }

        const computed = computeMetrics({ ...state, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            weeklySchedule: newSchedule,
          }
        } : state.usersData;

        return {
          ...computed,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),

      // Focus Session Stats Actions
      updateFocusStats: (minutes) => set((state) => {
        const todayStr = getTodayStr();
        const currentStats = state.focusStats || { totalTime: 0, dailyTime: 0, weeklyTime: 0, lastFocusDate: '' };
        
        let daily = currentStats.dailyTime || 0;
        let weekly = currentStats.weeklyTime || 0;
        
        if (currentStats.lastFocusDate !== todayStr) {
          daily = 0;
          // Simple weekly reset if last focus date was more than 7 days ago
          const lastDate = new Date(currentStats.lastFocusDate || todayStr);
          const diff = Math.ceil((new Date(todayStr) - lastDate) / (1000 * 60 * 60 * 24));
          if (diff >= 7) {
            weekly = 0;
          }
        }
        
        const newStats = {
          totalTime: (currentStats.totalTime || 0) + minutes,
          dailyTime: daily + minutes,
          weeklyTime: weekly + minutes,
          lastFocusDate: todayStr
        };

        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            focusStats: newStats
          }
        } : state.usersData;

        return {
          focusStats: newStats,
          usersData: updatedUsersData
        };
      }),

      // Suggestions Actions
      dismissSuggestion: (id) => set((state) => {
        const newDismissed = [...(state.dismissedSuggestionIds || []), id];
        const computed = computeMetrics({ ...state, dismissedSuggestionIds: newDismissed });

        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            dismissedSuggestionIds: newDismissed
          }
        } : state.usersData;

        return {
          ...computed,
          dismissedSuggestionIds: newDismissed,
          usersData: updatedUsersData
        };
      }),

      applyAdjustment: (id) => set((state) => {
        const sug = state.aiSuggestions.find(s => s.id === id);
        if (!sug || !sug.subjectId) {
          // just dismiss if no subject is linked
          return get().dismissSuggestion(id);
        }

        // Find subject info
        const targetSub = state.subjects.find(s => s.id === sug.subjectId);
        if (!targetSub) return get().dismissSuggestion(id);

        // Auto schedule a slot on Wednesday or Thursday 3 PM - 4:30 PM
        const targetDay = sug.type === 'exam_prep' ? 'Wed' : 'Thu';
        const newSlot = {
          id: `slot_adj_${Date.now()}`,
          subjectId: targetSub.id,
          day: targetDay,
          startTime: '15:00',
          endTime: '16:30',
          name: targetSub.name,
          color: targetSub.color || 'primary'
        };

        const newSchedule = [...(state.weeklySchedule || []), newSlot];
        const newDismissed = [...(state.dismissedSuggestionIds || []), id];
        
        const computed = computeMetrics({ 
          ...state, 
          weeklySchedule: newSchedule, 
          dismissedSuggestionIds: newDismissed 
        });

        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            weeklySchedule: newSchedule,
            dismissedSuggestionIds: newDismissed
          }
        } : state.usersData;

        alert(`Schedule updated! Added a 1.5-hour study slot for ${targetSub.name} on ${targetDay} at 03:00 PM.`);

        return {
          ...computed,
          weeklySchedule: newSchedule,
          dismissedSuggestionIds: newDismissed,
          usersData: updatedUsersData
        };
      }),

      // ── Milestones CRUD ────────────────────────────────────────────────────
      addMilestone: (milestone) => set((state) => {
        const newMs = {
          ...milestone,
          id: `ms_${Date.now()}`,
          createdAt: getTodayStr(),
          status: milestone.status || 'not_started',
          progress: Number(milestone.progress) || 0,
        };
        const newMilestones = [...(state.milestones || []), newMs];
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: { ...state.usersData[email], milestones: newMilestones }
        } : state.usersData;
        return { milestones: newMilestones, usersData: updatedUsersData };
      }),

      updateMilestone: (id, updates) => set((state) => {
        const newMilestones = (state.milestones || []).map(ms =>
          ms.id === id ? { ...ms, ...updates, progress: Number(updates.progress ?? ms.progress) } : ms
        );
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: { ...state.usersData[email], milestones: newMilestones }
        } : state.usersData;
        return { milestones: newMilestones, usersData: updatedUsersData };
      }),

      deleteMilestone: (id) => set((state) => {
        const newMilestones = (state.milestones || []).filter(ms => ms.id !== id);
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: { ...state.usersData[email], milestones: newMilestones }
        } : state.usersData;
        return { milestones: newMilestones, usersData: updatedUsersData };
      }),

      // Merge study minutes into today's studyLog entry (used by Progress page)
      logStudyMinutes: (minutes) => set((state) => {
        const todayStr = getTodayStr();
        const currentLog = state.studyLog || [];
        const exists = currentLog.find(e => e.date === todayStr);
        const newLog = exists
          ? currentLog.map(e => e.date === todayStr ? { ...e, minutes: e.minutes + minutes } : e)
          : [...currentLog, { date: todayStr, minutes }];
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: { ...state.usersData[email], studyLog: newLog }
        } : state.usersData;
        return { studyLog: newLog, usersData: updatedUsersData };
      }),

      toggleTheme: () => set((state) => {
        const newTheme = !state.isDarkMode;
        return { isDarkMode: newTheme };
      }),

      toggleRestDay: (day) => set((state) => {
        const currentRestDays = state.restDays || [];
        const isRest = currentRestDays.includes(day);
        const newRestDays = isRest 
          ? currentRestDays.filter(d => d !== day)
          : [...currentRestDays, day];
          
        // Flush weeklySchedule slots for that day if turning it into a Rest Day
        let newSchedule = state.weeklySchedule || [];
        if (!isRest) {
          newSchedule = newSchedule.filter(slot => slot.day !== day);
        }
        
        const computed = computeMetrics({ ...state, restDays: newRestDays, weeklySchedule: newSchedule });
        
        const email = state.currentUserEmail;
        const updatedUsersData = email ? {
          ...state.usersData,
          [email]: {
            ...state.usersData[email],
            restDays: newRestDays,
            weeklySchedule: newSchedule,
          }
        } : state.usersData;
        
        return {
          ...computed,
          restDays: newRestDays,
          weeklySchedule: newSchedule,
          usersData: updatedUsersData
        };
      }),
    }),
    {
      name: 'sapas_central_storage',
      // Fire setHasHydrated(true) as soon as localStorage has been read.
      // This lets ProtectedRoute gate on real hydrated state instead of
      // rendering with the pre-hydration in-memory defaults.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Side-effect subscriber to automatically toggle '.dark' CSS class on document element dynamically based on store updates
useStore.subscribe((state) => {
  if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

export default useStore;

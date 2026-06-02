export const userProfile = {
  name: 'Ajay Raj',
  level: 'Level 4 Student',
  major: 'Computer Science Engineering and Data Science',
  plan: 'Premium Plan',
  image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
};

export const metrics = {
  goalCompletion: 61,
  targetCGPA: 8.50,
  previousGPA: 8.10,
  streak: 12,
};

export const subjects = [
  {
    id: 'sub1',
    name: 'Algorithm Lab',
    shortName: 'ALG',
    icon: 'code',
    status: 'A+ PROJECTED',
    statusType: 'success', // success, steady, error
    schedule: 'Mon, Wed • 10:00 AM',
    score: 46,
    maxScore: 50,
    progress: 92,
    color: 'primary',
  },
  {
    id: 'sub2',
    name: 'Data Structure',
    shortName: 'DS',
    icon: 'database',
    status: 'STEADY',
    statusType: 'steady',
    schedule: 'Tue, Thu • 01:30 PM',
    score: 42,
    maxScore: 50,
    progress: 84,
    color: 'secondary',
  },
  {
    id: 'sub3',
    name: 'Economics',
    shortName: 'ECO',
    icon: 'payments',
    status: 'NEEDS ATTENTION',
    statusType: 'error',
    schedule: 'Friday • 09:00 AM',
    score: 31,
    maxScore: 50,
    progress: 62,
    color: 'tertiary',
  },
  {
    id: 'sub4',
    name: 'Numerical Methods',
    shortName: 'NUM',
    icon: 'functions',
    status: 'STEADY',
    statusType: 'steady',
    schedule: 'Wed, Fri • 02:00 PM',
    score: 40,
    maxScore: 50,
    progress: 80,
    color: 'primary',
  },
  {
    id: 'sub5',
    name: 'Statistics',
    shortName: 'STA',
    icon: 'bar_chart',
    status: 'NEEDS ATTENTION',
    statusType: 'error',
    schedule: 'Mon, Thu • 11:00 AM',
    score: 35,
    maxScore: 50,
    progress: 70,
    color: 'secondary',
  },
];

export const reminders = [
  {
    id: 'rem1',
    title: 'Data Structures Lab',
    desc: 'Due in 2 hours • High Priority',
    icon: 'assignment',
    color: 'primary',
  },
  {
    id: 'rem2',
    title: 'Economics Marks',
    desc: 'Oct 24, 2024 • 09:00 AM',
    icon: 'school',
    color: 'secondary',
  },
];

export const aiInsights = {
  dashboard: {
    title: 'Smart Improvement Insight',
    desc: 'Keep it up! You are nailing in **Algorithms**. Consider spending 15% more time on **Economics** quiz prep this week to boost your predicted CGPA.',
  },
  performance: {
    desc: 'Your performance in **Algorithms** is lagging behind your average. Dedicate 2 hours extra to lab practice this week.',
  },
  planner: {
    desc: 'Based on your recent performance in **Data Structures**, you\'re 40% more likely to struggle with the final project if you don\'t start the \'Hash Map Optimization\' module today. I\'ve adjusted your study planner to prioritize this.',
  },
  progress: {
    desc: 'Ralph, your performance in **Algorithm Lab** suggests you\'re ready for advanced complexity. Try the optional \'Dynamic Programming\' modules to boost your projected final grade to an A+.',
  }
};

export const tasks = [
  { id: 'task1', text: 'Review Heap Sort Complexity', time: 30, done: true, priority: 'MEDIUM', subjectId: 'sub1' },
  { id: 'task2', text: 'Draft Economics Essay Intro', time: 45, done: true, priority: 'LOW', subjectId: 'sub3' },
  { id: 'task3', text: 'Solve 10 Calculus Practice Problems', time: 60, done: false, priority: 'CRITICAL', subjectId: 'sub4' },
  { id: 'task4', text: 'Update Study Log for Numerical Methods', time: 15, done: false, priority: 'MEDIUM', subjectId: 'sub4' },
];

export const exams = [
  { id: 'exam1', title: 'Advanced Mathematics', room: 'Room 402', time: '09:00 AM', daysLeft: 3, subjectId: 'sub4' },
];

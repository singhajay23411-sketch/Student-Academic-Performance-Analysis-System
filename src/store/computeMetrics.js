const calculateDaysLeft = (examDateStr) => {
  if (!examDateStr) return 'Not Set';
  
  const examDate = new Date(examDateStr);
  if (isNaN(examDate.getTime())) return 'Invalid Date';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  examDate.setHours(0, 0, 0, 0);
  
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return 'Exam Completed';
  
  return `${diffDays} Days left`;
};

export const computeMetrics = (state) => {
  const { subjects = [], metrics = {}, tasks = [] } = state;
  let totalScore = 0;
  let totalMaxScore = 0;
  let riskSubjects = [];
  let excellentSubjects = [];
  let attendanceWarnings = [];
  let lowestProgressSubject = null;

  const updatedSubjects = subjects.map(sub => {
    const progress = sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0;
    
    // Status Logic
    let status = 'STEADY';
    let statusType = 'steady';
    
    if (progress >= 85) {
      status = 'A+ PROJECTED';
      statusType = 'success';
      excellentSubjects.push(sub);
    } else if (progress < 50) {
      status = 'HIGH RISK';
      statusType = 'error';
      riskSubjects.push(sub);
    } else if (progress < 70) {
      status = 'NEEDS ATTENTION';
      statusType = 'error';
    }

    if (sub.attendance < 75) {
      status = 'LOW ATTENDANCE';
      statusType = 'error';
      attendanceWarnings.push(sub);
    }

    totalScore += sub.score;
    totalMaxScore += sub.maxScore;

    const updatedSub = { ...sub, progress, status, statusType };

    if (!lowestProgressSubject || progress < lowestProgressSubject.progress) {
      lowestProgressSubject = updatedSub;
    }

    return updatedSub;
  });

  const overallProgress = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  
  // Calculate predicted CGPA (assuming 10.0 scale, where 100% = 10.0)
  const predictedCGPA = Number(((overallProgress / 100) * 10.0).toFixed(2));
  const targetCGPA = metrics.targetCGPA;
  
  // Map and calculate Exams countdowns
  const exams = state.exams || [];
  const updatedExams = exams.map(exam => {
    const daysLeft = calculateDaysLeft(exam.date);
    return { ...exam, daysLeft };
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Dynamic AI Suggestions Generator
  const dismissedSuggestionIds = state.dismissedSuggestionIds || [];
  let generatedSuggestions = [];
  
  // A. Exam Suggestion
  const upcomingExams = updatedExams.filter(ex => !ex.daysLeft.includes('Completed') && !ex.daysLeft.includes('Yesterday'));
  if (upcomingExams.length > 0) {
    const exam = upcomingExams[0];
    const daysLeftText = exam.daysLeft;
    const examSub = updatedSubjects.find(s => s.name.toLowerCase().includes(exam.title.toLowerCase()) || (exam.subjectId && s.id === exam.subjectId));
    const subName = examSub ? examSub.name : exam.title;
    generatedSuggestions.push({
      id: `sug_exam_${exam.id}`,
      text: `${subName} exam is only **${daysLeftText}** away. Increase study time by 1 hour daily.`,
      type: 'exam_prep',
      subjectId: examSub ? examSub.id : (exam.subjectId || ''),
      active: true
    });
  }

  // B. Neglect Suggestion
  updatedSubjects.forEach(sub => {
    if (sub.progress < 70) {
      generatedSuggestions.push({
        id: `sug_neglect_${sub.id}`,
        text: `You have not studied **${sub.name}** in 4 days. Prioritize reviewing its units.`,
        type: 'neglect',
        subjectId: sub.id,
        active: true
      });
    }
  });

  // C. Attendance Warning Suggestion
  updatedSubjects.forEach(sub => {
    if (sub.attendance < 75) {
      generatedSuggestions.push({
        id: `sug_attn_${sub.id}`,
        text: `Attendance in **${sub.name}** is dropping (**${sub.attendance}%**). Attend lectures to avoid penalties.`,
        type: 'attendance',
        subjectId: sub.id,
        active: true
      });
    }
  });

  // D. Positive Session Suggestion
  generatedSuggestions.push({
    id: 'sug_pos_streak',
    text: `Great momentum! Your focus session completion rate increased by **18%** this week.`,
    type: 'positive',
    active: true
  });

  // Filter out dismissed suggestions
  const activeSuggestions = generatedSuggestions.filter(sug => !dismissedSuggestionIds.includes(sug.id));
  
  // ==========================================
  // SMART IMPROVEMENT INSIGHT AI ENGINE RULES
  // ==========================================
  let dashboardInsight = `You're on a steady path. Try to push your scores higher to reach Excellence.`;
  let dashboardTitle = 'Smart Improvement Insight';
  
  // 1. Attendance Check (Highest Priority)
  if (attendanceWarnings.length > 0) {
    dashboardTitle = 'Attendance Warning';
    dashboardInsight = `Your attendance in **${attendanceWarnings[0].name}** is only ${attendanceWarnings[0].attendance}%. Please attend classes to avoid academic penalties.`;
  }
  // 2. Weak Subject Check (marks < 40% or progress < 50%)
  else if (riskSubjects.length > 0) {
    const weakSub = riskSubjects[0];
    const isCritical = weakSub.progress < 40;
    dashboardTitle = isCritical ? 'Weak Subject Alert' : 'Attention Required';
    dashboardInsight = isCritical 
      ? `Critical performance in **${weakSub.name}** at ${weakSub.score}/${weakSub.maxScore} (${weakSub.progress}%). Immediate action is required to avoid failing.`
      : `Your performance in **${weakSub.name}** is lagging behind at ${weakSub.score}/${weakSub.maxScore} (${weakSub.progress}%). We recommend extra dedication.`;
  }
  // 3. CGPA Target Check (predicted CGPA is below target CGPA)
  else if (targetCGPA && predictedCGPA < targetCGPA && lowestProgressSubject) {
    dashboardTitle = 'CGPA Target Recommendation';
    dashboardInsight = `Your projected CGPA of **${predictedCGPA}** is currently below your target of **${targetCGPA}**. To close this gap, aim to increase your score in **${lowestProgressSubject.name}** by at least 15%.`;
  }
  // 4. Study Consistency / Planner Activity Check
  else if (tasks.filter(t => t.done).length >= 2) {
    const doneCount = tasks.filter(t => t.done).length;
    dashboardTitle = 'Study Consistency';
    dashboardInsight = `Excellent momentum! You have completed **${doneCount}** study tasks. This consistency is paving the way to reach your ${targetCGPA ? `**${targetCGPA}** target` : 'target CGPA'}.`;
  }
  // 5. Positive Reinforcement (Excellence Check)
  else if (excellentSubjects.length > 0) {
    dashboardTitle = 'Smart Improvement Insight';
    dashboardInsight = `Keep it up! You are nailing **${excellentSubjects[0].name}** with **${excellentSubjects[0].progress}%**. Stay consistent to hit your goals.`;
  }

  // Generate sub-page specific AI descriptions reactively
  const riskSubNames = riskSubjects.map(s => s.name);
  const performanceDesc = riskSubNames.length > 0 
    ? `Focus on **${riskSubNames.join(', ')}** to avoid dropping your CGPA.` 
    : 'You have no high-risk subjects. Keep pushing for A grades.';

  const plannerDesc = riskSubNames.length > 0 
    ? `Based on your recent performance, prioritize **${riskSubNames[0]}** in your study planner today to avoid dropping your grade.` 
    : 'Great job maintaining steady performance! Focus on your Daily Goals to keep the streak going.';

  const progressDesc = `You've completed ${overallProgress}% of your targeted scores. Keep going!`;

  return {
    ...state,
    subjects: updatedSubjects,
    exams: updatedExams,
    aiSuggestions: activeSuggestions,
    metrics: {
      ...metrics,
      goalCompletion: overallProgress,
      predictedCGPA: predictedCGPA,
      predictedGPA: predictedCGPA,
      targetGPA: targetCGPA,
    },
    aiInsights: {
      dashboard: {
        title: dashboardTitle,
        desc: dashboardInsight,
      },
      performance: {
        desc: performanceDesc,
      },
      planner: {
        desc: plannerDesc,
      },
      progress: {
        desc: progressDesc,
      }
    }
  };
};

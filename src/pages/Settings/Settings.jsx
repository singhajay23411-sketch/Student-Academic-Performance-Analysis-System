import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}_${String(d.getDate()).padStart(2,'0')}`;
};

const getLetterGrade = (p) => {
  if (p >= 90) return 'A+'; if (p >= 85) return 'A';  if (p >= 80) return 'A-';
  if (p >= 75) return 'B+'; if (p >= 70) return 'B';  if (p >= 65) return 'B-';
  if (p >= 60) return 'C+'; if (p >= 50) return 'C';  return 'F';
};

const getMilestoneStatus = (ms) => {
  if (ms.status === 'completed' || Number(ms.progress) >= 100) return 'Completed';
  if (ms.deadline) {
    const dl = new Date(ms.deadline); dl.setHours(23,59,59,0);
    if (dl < new Date()) return 'Overdue';
  }
  return Number(ms.progress) > 0 ? 'In Progress' : 'Not Started';
};

const BADGE_DEFS = [
  { id:'streak_7',   title:'7-Day Streak',        level:'Bronze',   check:(s)=>(s.metrics?.streak||0)>=7   },
  { id:'streak_15',  title:'15-Day Streak',       level:'Silver',   check:(s)=>(s.metrics?.streak||0)>=15  },
  { id:'streak_30',  title:'30-Day Streak',       level:'Gold',     check:(s)=>(s.metrics?.streak||0)>=30  },
  { id:'streak_100', title:'100-Day Streak',      level:'Platinum', check:(s)=>(s.metrics?.streak||0)>=100 },
  { id:'cgpa_7',     title:'CGPA 7+',             level:'Bronze',   check:(s)=>(s.metrics?.predictedCGPA||0)>=7  },
  { id:'cgpa_8',     title:'CGPA 8+',             level:'Silver',   check:(s)=>(s.metrics?.predictedCGPA||0)>=8  },
  { id:'cgpa_9',     title:'CGPA 9+',             level:'Gold',     check:(s)=>(s.metrics?.predictedCGPA||0)>=9  },
  { id:'attn_85',    title:'85% Attendance',      level:'Bronze',   check:(s)=>s.subjects?.length>0&&s.subjects.every(x=>(x.attendance||0)>=85) },
  { id:'attn_90',    title:'90% Attendance',      level:'Silver',   check:(s)=>s.subjects?.length>0&&s.subjects.every(x=>(x.attendance||0)>=90) },
  { id:'attn_95',    title:'95% Attendance',      level:'Gold',     check:(s)=>s.subjects?.length>0&&s.subjects.every(x=>(x.attendance||0)>=95) },
  { id:'focus_50',   title:'50 Focus Sessions',   level:'Bronze',   check:(s)=>((s.focusStats?.totalTime||0)/30)>=50  },
  { id:'focus_100',  title:'100 Focus Sessions',  level:'Silver',   check:(s)=>((s.focusStats?.totalTime||0)/30)>=100 },
  { id:'hours_500',  title:'500 Study Hours',     level:'Gold',     check:(s)=>(s.focusStats?.totalTime||0)>=30000   },
];

// ─── CSV Generator ────────────────────────────────────────────────────────────

const generateCSV = (data) => {
  const { profile, metrics, subjects, focusStats, studyLog, milestones, aiInsights } = data;
  const snap = { metrics, subjects, focusStats };
  const unlockedBadges = BADGE_DEFS.filter(b => b.check(snap));

  const sections = [];

  // Student Information
  sections.push('STUDENT INFORMATION');
  sections.push('Field,Value');
  sections.push(`Student Name,"${profile.fullName || `${profile.firstName} ${profile.lastName}`}"`);
  sections.push(`Email,"${profile.email}"`);
  sections.push(`Current CGPA,${metrics.predictedCGPA?.toFixed(2) || 'N/A'}`);
  sections.push(`Target CGPA,${metrics.targetCGPA || 'N/A'}`);
  sections.push(`Previous GPA,${metrics.previousGPA || 'N/A'}`);
  sections.push(`Academic Health Score,${metrics.goalCompletion || 0}%`);
  sections.push(`Study Streak,${metrics.streak || 0} days`);
  sections.push(`Report Generated,"${today()}"`);
  sections.push('');

  // Subject Performance
  sections.push('SUBJECT PERFORMANCE');
  sections.push('Subject,Marks,Max Marks,Attendance %,Progress %,Grade,Priority,Status');
  subjects.forEach(s => {
    sections.push(`"${s.name}",${s.score},${s.maxScore},${s.attendance||0}%,${s.progress}%,${getLetterGrade(s.progress)},"${s.priority||'Medium'}","${s.statusType==='error'?'Needs Attention':s.statusType==='success'?'Excellent':'Steady'}"`);
  });
  sections.push('');

  // Study Analytics
  sections.push('STUDY ANALYTICS');
  sections.push('Metric,Value');
  sections.push(`Total Study Hours,${Math.round((focusStats?.totalTime||0)/60)}h`);
  sections.push(`Weekly Study Hours,${Math.round((focusStats?.weeklyTime||0)/60)}h`);
  sections.push(`Daily Study Hours,${Math.round((focusStats?.dailyTime||0)/60)}h`);
  sections.push(`Focus Sessions Completed,${Math.floor((focusStats?.totalTime||0)/30)}`);
  sections.push(`Current Streak,${metrics.streak||0} days`);
  sections.push(`Longest Streak,${metrics.longestStreak||metrics.streak||0} days`);
  sections.push('');

  // Attendance
  sections.push('ATTENDANCE ANALYSIS');
  sections.push('Subject,Attendance %,Status');
  const avgAttn = subjects.length ? Math.round(subjects.reduce((a,s)=>a+(s.attendance||0),0)/subjects.length) : 0;
  sections.push(`Overall Average,${avgAttn}%,${avgAttn>=75?'Good':'Warning'}`);
  subjects.forEach(s => {
    sections.push(`"${s.name}",${s.attendance||0}%,${(s.attendance||0)>=75?'Good':'Below Minimum'}`);
  });
  sections.push('');

  // Milestones
  sections.push('MILESTONES');
  sections.push('Title,Subject,Deadline,Status,Progress %,Priority');
  milestones.forEach(m => {
    const subj = subjects.find(s=>s.id===m.subjectId);
    sections.push(`"${m.title}","${subj?subj.name:'General'}","${m.deadline||'N/A'}","${getMilestoneStatus(m)}",${m.progress}%,"${m.priority||'Medium'}"`);
  });
  sections.push('');

  // Achievements
  sections.push('ACHIEVEMENTS & BADGES');
  sections.push('Badge,Level,Status');
  BADGE_DEFS.forEach(b => {
    const unlocked = b.check(snap);
    sections.push(`"${b.title}","${b.level}","${unlocked?'Unlocked':'Locked'}"`);
  });

  return sections.join('\n');
};

// ─── JSON Generator ───────────────────────────────────────────────────────────

const generateJSON = (data) => {
  const { profile, metrics, subjects, focusStats, studyLog, milestones, aiInsights } = data;
  const snap = { metrics, subjects, focusStats };
  const avgAttn = subjects.length ? Math.round(subjects.reduce((a,s)=>a+(s.attendance||0),0)/subjects.length) : 0;

  const output = {
    exportInfo: {
      generatedAt: new Date().toISOString(),
      format: 'SAPAS Academic Report v1.0',
    },
    student: {
      name: profile.fullName || `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      major: profile.major,
    },
    cgpa: {
      current: metrics.predictedCGPA?.toFixed(2) || 'N/A',
      target: metrics.targetCGPA || 'N/A',
      previousGPA: metrics.previousGPA || 'N/A',
      goalCompletion: `${metrics.goalCompletion || 0}%`,
    },
    subjects: subjects.map(s => ({
      name: s.name,
      shortName: s.shortName,
      marks: `${s.score}/${s.maxScore}`,
      progress: `${s.progress}%`,
      attendance: `${s.attendance||0}%`,
      grade: getLetterGrade(s.progress),
      priority: s.priority || 'Medium',
      status: s.statusType === 'error' ? 'Needs Attention' : s.statusType === 'success' ? 'Excellent' : 'Steady',
    })),
    attendance: {
      overall: `${avgAttn}%`,
      status: avgAttn >= 75 ? 'Good' : 'Below Minimum',
      subjectWise: subjects.map(s => ({ subject: s.name, attendance: `${s.attendance||0}%`, status: (s.attendance||0)>=75?'Good':'Warning' })),
    },
    studyAnalytics: {
      totalStudyHours: Math.round((focusStats?.totalTime||0)/60),
      weeklyStudyHours: Math.round((focusStats?.weeklyTime||0)/60),
      dailyStudyHours: Math.round((focusStats?.dailyTime||0)/60),
      focusSessionsCompleted: Math.floor((focusStats?.totalTime||0)/30),
      currentStreak: metrics.streak || 0,
      longestStreak: metrics.longestStreak || metrics.streak || 0,
    },
    milestones: milestones.map(m => {
      const subj = subjects.find(s=>s.id===m.subjectId);
      return {
        title: m.title,
        description: m.description || '',
        subject: subj ? subj.name : 'General',
        deadline: m.deadline || 'Not set',
        status: getMilestoneStatus(m),
        progress: `${m.progress}%`,
        priority: m.priority || 'Medium',
      };
    }),
    achievements: {
      unlocked: BADGE_DEFS.filter(b=>b.check(snap)).map(b=>({ title:b.title, level:b.level })),
      locked: BADGE_DEFS.filter(b=>!b.check(snap)).map(b=>({ title:b.title, level:b.level })),
      totalUnlocked: BADGE_DEFS.filter(b=>b.check(snap)).length,
    },
    aiInsights: {
      dashboard: aiInsights?.dashboard?.desc || '',
      performance: aiInsights?.performance?.desc || '',
      planner: aiInsights?.planner?.desc || '',
      progress: aiInsights?.progress?.desc || '',
    },
  };

  return JSON.stringify(output, null, 2);
};

// ─── PDF Generator (pure JS, no external library) ────────────────────────────
// Generates an HTML page opened in a new window with print-to-PDF instructions.
// This avoids any dependency installation while producing a professional report.

const generatePDFHTML = (data) => {
  const { profile, metrics, subjects, focusStats, studyLog, milestones, aiInsights } = data;
  const snap = { metrics, subjects, focusStats };
  const unlockedBadges = BADGE_DEFS.filter(b=>b.check(snap));
  const avgAttn = subjects.length ? Math.round(subjects.reduce((a,s)=>a+(s.attendance||0),0)/subjects.length) : 0;
  const name = profile.fullName || `${profile.firstName} ${profile.lastName}`;

  const subjectRows = subjects.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.score}/${s.maxScore}</td>
      <td>${s.progress}%</td>
      <td>${s.attendance||0}%</td>
      <td><strong>${getLetterGrade(s.progress)}</strong></td>
      <td>${s.priority||'Medium'}</td>
      <td class="${s.statusType==='error'?'risk':s.statusType==='success'?'good':'steady'}">${s.statusType==='error'?'⚠ At Risk':s.statusType==='success'?'✓ Excellent':'→ Steady'}</td>
    </tr>`).join('');

  const milestoneRows = milestones.map(m => {
    const subj = subjects.find(s=>s.id===m.subjectId);
    const status = getMilestoneStatus(m);
    return `
    <tr>
      <td>${m.title}</td>
      <td>${subj?subj.name:'General'}</td>
      <td>${m.deadline||'Not set'}</td>
      <td class="${status==='Overdue'?'risk':status==='Completed'?'good':'steady'}">${status}</td>
      <td>
        <div class="prog-bar-wrap"><div class="prog-bar" style="width:${m.progress}%"></div></div>
        ${m.progress}%
      </td>
    </tr>`;
  }).join('');

  const badgeChips = unlockedBadges.map(b => `<span class="badge-chip ${b.level.toLowerCase()}">${b.title} · ${b.level}</span>`).join('');

  const aiSection = [
    aiInsights?.dashboard?.desc && `<div class="ai-item"><strong>📊 Dashboard Insight:</strong><br/>${(aiInsights.dashboard.desc||'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>`,
    aiInsights?.performance?.desc && `<div class="ai-item"><strong>📈 Performance:</strong><br/>${(aiInsights.performance.desc||'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>`,
    aiInsights?.planner?.desc && `<div class="ai-item"><strong>📅 Study Planner:</strong><br/>${(aiInsights.planner.desc||'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>`,
    aiInsights?.progress?.desc && `<div class="ai-item"><strong>🚀 Progress:</strong><br/>${(aiInsights.progress.desc||'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>`,
  ].filter(Boolean).join('');

  // Bar chart (inline SVG) for subject progress
  const barWidth = Math.max(60, Math.floor(520 / Math.max(subjects.length,1)));
  const barChartBars = subjects.map((s, i) => {
    const barH = Math.round((s.progress / 100) * 160);
    const colors = ['#0066ff','#7c3aed','#0891b2','#059669','#dc2626','#d97706'];
    const col = colors[i % colors.length];
    return `
      <g>
        <rect x="${i*(barWidth+8)+10}" y="${170-barH}" width="${barWidth}" height="${barH}" fill="${col}" rx="4" opacity="0.85"/>
        <text x="${i*(barWidth+8)+10+barWidth/2}" y="188" text-anchor="middle" font-size="9" fill="#555">${s.shortName||s.name.slice(0,4)}</text>
        <text x="${i*(barWidth+8)+10+barWidth/2}" y="${170-barH-4}" text-anchor="middle" font-size="9" fill="${col}" font-weight="bold">${s.progress}%</text>
      </g>`;
  }).join('');

  const svgWidth = subjects.length*(barWidth+8)+30;
  const barChart = subjects.length > 0 ? `
    <svg width="${Math.min(svgWidth,560)}" height="200" viewBox="0 0 ${Math.min(svgWidth,560)} 200">
      <line x1="5" y1="10" x2="5" y2="175" stroke="#e0e0e0" stroke-width="1"/>
      <line x1="5" y1="175" x2="${Math.min(svgWidth,560)-5}" y2="175" stroke="#e0e0e0" stroke-width="1"/>
      ${barChartBars}
    </svg>` : '<p style="color:#999">No subjects added.</p>';

  // Attendance donut (SVG)
  const attnPct = avgAttn;
  const r = 54; const circumference = 2 * Math.PI * r;
  const dash = (attnPct / 100) * circumference;
  const attnColor = attnPct >= 85 ? '#059669' : attnPct >= 75 ? '#0066ff' : '#dc2626';
  const donut = `
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="#f0f0f0" stroke-width="16"/>
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="${attnColor}" stroke-width="16"
        stroke-dasharray="${dash} ${circumference - dash}"
        stroke-dashoffset="${circumference * 0.25}"
        stroke-linecap="round" transform="rotate(-90 70 70)"/>
      <text x="70" y="66" text-anchor="middle" font-size="22" font-weight="bold" fill="${attnColor}">${attnPct}%</text>
      <text x="70" y="84" text-anchor="middle" font-size="10" fill="#888">Attendance</text>
    </svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Academic Report — ${name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a2e; background:#fff; font-size:13px; line-height:1.55; }

    /* ── Cover ── */
    .cover { page-break-after:always; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg,#0a0f2c 0%,#0066ff 100%); color:#fff; text-align:center; padding:60px 40px; }
    .cover-logo { font-size:14px; font-weight:700; letter-spacing:4px; opacity:.7; text-transform:uppercase; margin-bottom:60px; }
    .cover h1 { font-size:38px; font-weight:800; line-height:1.2; margin-bottom:12px; }
    .cover .sub { font-size:16px; opacity:.8; margin-bottom:48px; }
    .cover-stats { display:flex; gap:40px; margin-top:40px; }
    .cover-stat { text-align:center; }
    .cover-stat .val { font-size:32px; font-weight:800; color:#ffd700; }
    .cover-stat .lbl { font-size:11px; opacity:.7; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
    .cover-footer { margin-top:60px; font-size:11px; opacity:.5; }

    /* ── Page shell ── */
    .page { padding:40px 48px; }
    .section { margin-bottom:36px; page-break-inside:avoid; }
    .section-title { font-size:17px; font-weight:800; color:#0066ff; border-bottom:2px solid #e8f0fe; padding-bottom:8px; margin-bottom:18px; text-transform:uppercase; letter-spacing:.5px; }
    
    /* ── Header/Footer ── */
    @page { margin:0; }
    .page-header { display:flex; justify-content:space-between; align-items:center; padding:16px 48px; background:#f8faff; border-bottom:2px solid #e8f0fe; margin-bottom:8px; }
    .page-header .logo { font-size:13px; font-weight:800; color:#0066ff; letter-spacing:2px; }
    .page-header .name { font-size:12px; color:#666; }
    .page-footer { display:flex; justify-content:space-between; align-items:center; padding:12px 48px; background:#f8faff; border-top:1px solid #e8f0fe; margin-top:20px; font-size:10px; color:#aaa; }

    /* ── Summary cards ── */
    .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .s-card { background:#f8faff; border:1px solid #e8f0fe; border-radius:12px; padding:16px; text-align:center; }
    .s-card .sv { font-size:26px; font-weight:800; color:#0066ff; }
    .s-card .sl { font-size:10px; color:#888; text-transform:uppercase; letter-spacing:.8px; margin-top:4px; }

    /* ── Table ── */
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { background:#f0f4ff; color:#0066ff; font-weight:700; text-transform:uppercase; font-size:10px; letter-spacing:.5px; padding:10px 12px; text-align:left; }
    td { padding:9px 12px; border-bottom:1px solid #f0f0f0; }
    tr:hover td { background:#fafbff; }
    .good { color:#059669; font-weight:700; }
    .risk { color:#dc2626; font-weight:700; }
    .steady { color:#0066ff; font-weight:700; }

    /* ── Progress bar ── */
    .prog-bar-wrap { display:inline-block; width:80px; height:8px; background:#f0f0f0; border-radius:4px; margin-right:6px; vertical-align:middle; }
    .prog-bar { height:8px; background:linear-gradient(90deg,#0066ff,#7c3aed); border-radius:4px; }

    /* ── AI section ── */
    .ai-item { background:#f8faff; border-left:4px solid #0066ff; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:10px; font-size:12px; color:#333; }
    
    /* ── Badges ── */
    .badge-chip { display:inline-block; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; margin:3px; }
    .badge-chip.bronze { background:#fff3e0; color:#e65100; border:1px solid #ffcc80; }
    .badge-chip.silver { background:#f3f3f3; color:#555; border:1px solid #bdbdbd; }
    .badge-chip.gold { background:#fffde7; color:#f57f17; border:1px solid #ffe082; }
    .badge-chip.platinum { background:#e0f7fa; color:#006064; border:1px solid #80deea; }

    /* ── Charts ── */
    .chart-wrap { background:#f8faff; border:1px solid #e8f0fe; border-radius:12px; padding:20px; display:inline-block; }
    .charts-row { display:flex; gap:24px; align-items:center; flex-wrap:wrap; }

    /* ── Print ── */
    @media print {
      .no-print { display:none !important; }
      body { background:#fff; }
    }
  </style>
</head>
<body>

<!-- Print button (hidden in print) -->
<div class="no-print" style="position:fixed;top:16px;right:16px;z-index:999;display:flex;gap:8px;">
  <button onclick="window.print()" style="background:#0066ff;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">🖨 Print / Save as PDF</button>
  <button onclick="window.close()" style="background:#f0f0f0;color:#333;border:none;padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">Close</button>
</div>

<!-- ── Cover Page ── -->
<div class="cover">
  <div class="cover-logo">SAPAS · Student Academic Performance Analysis System</div>
  <h1>Academic Performance Report</h1>
  <p class="sub">${name}</p>
  <div class="cover-stats">
    <div class="cover-stat"><div class="val">${metrics.predictedCGPA?.toFixed(2)||'—'}</div><div class="lbl">Current CGPA</div></div>
    <div class="cover-stat"><div class="val">${metrics.targetCGPA||'—'}</div><div class="lbl">Target CGPA</div></div>
    <div class="cover-stat"><div class="val">${metrics.goalCompletion||0}%</div><div class="lbl">Goal Progress</div></div>
    <div class="cover-stat"><div class="val">${metrics.streak||0}d</div><div class="lbl">Current Streak</div></div>
  </div>
  <div class="cover-footer">Generated on ${today()} · SAPAS Academic System</div>
</div>

<!-- ── Page Header ── -->
<div class="page-header">
  <div class="logo">SAPAS</div>
  <div class="name">${name} · ${profile.email}</div>
  <div style="font-size:11px;color:#999;">${today()}</div>
</div>

<div class="page">

  <!-- 1. Academic Summary -->
  <div class="section">
    <div class="section-title">1. Academic Summary</div>
    <div class="summary-grid">
      <div class="s-card"><div class="sv">${metrics.predictedCGPA?.toFixed(2)||'N/A'}</div><div class="sl">Current CGPA</div></div>
      <div class="s-card"><div class="sv">${metrics.targetCGPA||'N/A'}</div><div class="sl">Target CGPA</div></div>
      <div class="s-card"><div class="sv">${metrics.previousGPA||'N/A'}</div><div class="sl">Previous GPA</div></div>
      <div class="s-card"><div class="sv">${metrics.goalCompletion||0}%</div><div class="sl">Academic Health</div></div>
      <div class="s-card"><div class="sv">${subjects.length}</div><div class="sl">Subjects</div></div>
      <div class="s-card"><div class="sv">${avgAttn}%</div><div class="sl">Avg Attendance</div></div>
      <div class="s-card"><div class="sv">${metrics.streak||0}</div><div class="sl">Day Streak</div></div>
      <div class="s-card"><div class="sv">${Math.round((focusStats?.totalTime||0)/60)}h</div><div class="sl">Study Hours</div></div>
    </div>
  </div>

  <!-- 2. Subject Performance -->
  <div class="section">
    <div class="section-title">2. Subject Performance</div>
    ${subjects.length > 0 ? `
    <table>
      <thead><tr><th>Subject</th><th>Marks</th><th>Progress</th><th>Attendance</th><th>Grade</th><th>Priority</th><th>Status</th></tr></thead>
      <tbody>${subjectRows}</tbody>
    </table>` : '<p style="color:#999">No subjects added yet.</p>'}
  </div>

  <!-- 3. Subject Performance Chart -->
  <div class="section">
    <div class="section-title">3. Performance Analysis Chart</div>
    <div class="charts-row">
      <div class="chart-wrap">
        <div style="font-size:11px;color:#888;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Subject Progress (%)</div>
        ${barChart}
      </div>
      <div class="chart-wrap" style="text-align:center;">
        <div style="font-size:11px;color:#888;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Overall Attendance</div>
        ${donut}
        <div style="font-size:11px;color:${avgAttn>=75?'#059669':'#dc2626'};font-weight:700;">${avgAttn>=75?'✓ Satisfactory':'⚠ Below Minimum'}</div>
      </div>
    </div>
  </div>

  <!-- 4. Attendance Analysis -->
  <div class="section">
    <div class="section-title">4. Attendance Analysis</div>
    ${subjects.length > 0 ? `
    <table>
      <thead><tr><th>Subject</th><th>Attendance %</th><th>Status</th></tr></thead>
      <tbody>
        ${subjects.map(s=>`<tr><td>${s.name}</td><td>${s.attendance||0}%</td><td class="${(s.attendance||0)>=75?'good':'risk'}">${(s.attendance||0)>=75?'✓ Good':'⚠ Below 75%'}</td></tr>`).join('')}
      </tbody>
    </table>` : '<p style="color:#999">No subjects.</p>'}
  </div>

  <!-- 5. Study Analytics -->
  <div class="section">
    <div class="section-title">5. Study Analytics</div>
    <div class="summary-grid">
      <div class="s-card"><div class="sv">${Math.round((focusStats?.totalTime||0)/60)}h</div><div class="sl">Total Hours</div></div>
      <div class="s-card"><div class="sv">${Math.round((focusStats?.weeklyTime||0)/60)}h</div><div class="sl">Weekly Hours</div></div>
      <div class="s-card"><div class="sv">${Math.floor((focusStats?.totalTime||0)/30)}</div><div class="sl">Focus Sessions</div></div>
      <div class="s-card"><div class="sv">${metrics.streak||0}d</div><div class="sl">Current Streak</div></div>
    </div>
  </div>

  <!-- 6. Milestones -->
  <div class="section">
    <div class="section-title">6. Milestones</div>
    ${milestones.length > 0 ? `
    <table>
      <thead><tr><th>Title</th><th>Subject</th><th>Deadline</th><th>Status</th><th>Progress</th></tr></thead>
      <tbody>${milestoneRows}</tbody>
    </table>` : '<p style="color:#999">No milestones added yet.</p>'}
  </div>

  <!-- 7. Achievements -->
  <div class="section">
    <div class="section-title">7. Achievements & Badges</div>
    <p style="margin-bottom:12px;font-size:12px;color:#555;"><strong>${unlockedBadges.length}</strong> of ${BADGE_DEFS.length} badges unlocked</p>
    <div>${badgeChips || '<span style="color:#999">No badges unlocked yet.</span>'}</div>
  </div>

  <!-- 8. AI Recommendations -->
  <div class="section">
    <div class="section-title">8. AI Recommendations</div>
    ${aiSection || '<p style="color:#999">No AI insights available.</p>'}
  </div>

</div>

<!-- ── Page Footer ── -->
<div class="page-footer">
  <span>SAPAS Academic Report · Confidential</span>
  <span>${name}</span>
  <span>Generated: ${today()}</span>
</div>

</body>
</html>`;
};

// ─── Download helpers ─────────────────────────────────────────────────────────

const downloadFile = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
  a.click();
  URL.revokeObjectURL(a.href);
};

const safeName = (name) => (name||'Student').replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'');

// ─── Component ────────────────────────────────────────────────────────────────

export default function Settings() {
  // Store reads
  const profile     = useStore(s => s.profile);
  const metrics     = useStore(s => s.metrics)    || {};
  const subjects    = useStore(s => s.subjects)   || [];
  const focusStats  = useStore(s => s.focusStats) || {};
  const studyLog    = useStore(s => s.studyLog)   || [];
  const milestones  = useStore(s => s.milestones) || [];
  const aiInsights  = useStore(s => s.aiInsights) || {};
  const isDarkMode  = useStore(s => s.isDarkMode);

  const updateProfile = useStore(s => s.updateProfile);
  const toggleTheme   = useStore(s => s.toggleTheme);

  const fileInputRef = useRef(null);

  // Export UI state
  const [previewOpen,  setPreviewOpen]  = useState(false);
  const [selectedFmt,  setSelectedFmt]  = useState('pdf');
  const [isExporting,  setIsExporting]  = useState(false);
  const [exportDone,   setExportDone]   = useState(false);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateProfile({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const handleNotificationToggle = (key) => {
    updateProfile({ notifications: { ...profile.notifications, [key]: !profile.notifications[key] } });
  };

  // Collect all data into one snapshot for export
  const exportData = useMemo(() => ({
    profile, metrics, subjects, focusStats, studyLog, milestones, aiInsights,
  }), [profile, metrics, subjects, focusStats, studyLog, milestones, aiInsights]);

  const snap = { metrics, subjects, focusStats };
  const unlockedBadges = BADGE_DEFS.filter(b => b.check(snap)).length;
  const completedMs    = milestones.filter(m => getMilestoneStatus(m) === 'Completed').length;
  const studentName    = safeName(profile.fullName || `${profile.firstName}_${profile.lastName}`);

  // Export action
  const handleExport = () => {
    setIsExporting(true);
    // Small delay for UX
    setTimeout(() => {
      try {
        const iso = todayISO();
        if (selectedFmt === 'csv') {
          downloadFile(generateCSV(exportData), `Academic_Data_${studentName}_${iso}.csv`, 'text/csv;charset=utf-8;');
        } else if (selectedFmt === 'json') {
          downloadFile(generateJSON(exportData), `Academic_Data_${studentName}_${iso}.json`, 'application/json');
        } else {
          // PDF: open in new window for print-to-PDF
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(generatePDFHTML(exportData));
            win.document.close();
          }
        }
        setExportDone(true);
        setTimeout(() => { setExportDone(false); setPreviewOpen(false); }, 2000);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  const FMT_CONFIG = {
    pdf:  { icon: 'picture_as_pdf', label: 'PDF Report',    color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-200 dark:border-red-800',    desc: 'Professional report with charts, tables, and AI insights. Opens in a new window — use Ctrl+P to save as PDF.' },
    csv:  { icon: 'table_chart',    label: 'CSV Spreadsheet', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', desc: 'Structured spreadsheet file with subjects, attendance, milestones, and achievements.' },
    json: { icon: 'data_object',    label: 'JSON Data',      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',  desc: 'Complete academic data object for developers or backup purposes.' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-lg">
      <div className="grid grid-cols-12 gap-lg">

        {/* ── Public Profile ─────────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-8 glass-card p-lg rounded-xl">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-md text-on-surface">Public Profile</h3>
            <button className="px-md py-xs bg-primary-container text-on-primary-container rounded-lg font-semibold text-body-sm transition-transform active:scale-95 shadow-sm hover:shadow-md">Save Changes</button>
          </div>
          <div className="flex flex-col md:flex-row gap-lg">
            <div className="flex-shrink-0 flex flex-col items-center gap-sm">
              <div className="relative group">
                <img alt="Profile" className="w-32 h-32 rounded-xl object-cover border-2 border-primary/10 shadow-lg" src={profile.avatar} />
                <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-surface p-base rounded-full shadow-md border border-outline-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} />
              </div>
              <span className="text-body-sm text-on-surface-variant cursor-pointer hover:underline" onClick={() => fileInputRef.current.click()}>Update Avatar</span>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-base">
                <label className="text-label-md text-on-surface-variant">First Name</label>
                <input className="w-full bg-surface-container-low dark:bg-surface-variant border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="text" value={profile.firstName} onChange={(e) => updateProfile({ firstName: e.target.value })} />
              </div>
              <div className="space-y-base">
                <label className="text-label-md text-on-surface-variant">Last Name</label>
                <input className="w-full bg-surface-container-low dark:bg-surface-variant border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="text" value={profile.lastName} onChange={(e) => updateProfile({ lastName: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-base">
                <label className="text-label-md text-on-surface-variant">Email Address</label>
                <input className="w-full bg-surface-container-low dark:bg-surface-variant border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="email" value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-base">
                <label className="text-label-md text-on-surface-variant">Biography</label>
                <textarea className="w-full bg-surface-container-low dark:bg-surface-variant border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none" rows="3" value={profile.biography} onChange={(e) => updateProfile({ biography: e.target.value })} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Appearance & AI ─────────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="glass-card p-lg rounded-xl">
            <h3 className="font-headline-md text-on-surface mb-md">Appearance</h3>
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-body-md font-semibold">Dark Mode</span><span className="text-body-sm text-on-surface-variant">Switch to dark theme</span></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleTheme} />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-body-md font-semibold">Compact View</span><span className="text-body-sm text-on-surface-variant">High density dashboard</span></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={profile.compactView} onChange={() => updateProfile({ compactView: !profile.compactView })} />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </div>
          <div className="ai-glow p-lg rounded-xl shadow-md">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              <span className="text-label-md font-bold text-secondary uppercase tracking-wider">AI Insights Power</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">Your account is using <strong>{profile.aiMode}</strong> mode. AI proactively suggests study schedules based on your performance trends.</p>
            <button className="mt-md text-primary font-semibold text-body-sm flex items-center gap-xs hover:gap-sm transition-all">Configure AI <span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </section>

        {/* ── Security & Privacy ──────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-7 glass-card p-lg rounded-xl">
          <h3 className="font-headline-md text-on-surface mb-lg">Security & Privacy</h3>
          <div className="space-y-lg">
            <div className="flex items-start gap-md pb-md border-b border-outline-variant">
              <div className="bg-surface-container-low dark:bg-surface-variant p-sm rounded-lg"><span className="material-symbols-outlined text-primary">lock_open</span></div>
              <div className="flex-grow"><p className="text-body-md font-semibold">Two-Factor Authentication</p><p className="text-body-sm text-on-surface-variant">Add an extra layer of security to your academic data.</p></div>
              <button className="px-md py-xs border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container-low dark:hover:bg-surface-variant">Enable</button>
            </div>
            <div className="flex items-start gap-md pb-md border-b border-outline-variant">
              <div className="bg-surface-container-low dark:bg-surface-variant p-sm rounded-lg"><span className="material-symbols-outlined text-primary">devices</span></div>
              <div className="flex-grow"><p className="text-body-md font-semibold">Active Sessions</p><p className="text-body-sm text-on-surface-variant">Currently logged in on 2 devices (MacBook Pro, iPhone 15).</p></div>
              <button className="px-md py-xs border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container-low dark:hover:bg-surface-variant">Manage</button>
            </div>
            <div className="pt-sm">
              <p className="text-body-md font-semibold mb-sm text-error">Danger Zone</p>
              <div className="flex flex-col md:flex-row gap-md items-center justify-between p-md bg-error-container/10 border border-error/20 rounded-xl">
                <p className="text-body-sm text-on-surface-variant">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-md py-xs bg-error text-on-error rounded-lg text-body-sm font-semibold whitespace-nowrap">Delete Account</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-5 glass-card p-lg rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-on-surface mb-lg">Notifications</h3>
            <div className="space-y-md">
              {[
                { icon: 'mail',           text: 'Grade Updates',        key: 'gradeUpdates'  },
                { icon: 'schedule',       text: 'Deadline Reminders',   key: 'deadlines'     },
                { icon: 'tips_and_updates',text:'AI Productivity Tips', key: 'aiTips'        },
                { icon: 'campaign',       text: 'System Announcements', key: 'announcements' },
              ].map((n, i) => (
                <div key={i} onClick={() => handleNotificationToggle(n.key)} className="flex items-center justify-between p-sm hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-on-surface-variant">{n.icon}</span><span className="text-body-md">{n.text}</span></div>
                  <input type="checkbox" checked={profile.notifications[n.key] || false} readOnly className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary/20 bg-surface-container-low cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          {/* ── DATA EXPORT (fully functional) ───────────────────────────── */}
          <div className="mt-xl pt-lg border-t border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Data Export</h4>
              <span className="text-[10px] text-on-surface-variant bg-primary/10 text-primary px-xs py-[2px] rounded font-bold">Your data only</span>
            </div>

            {/* Format selector */}
            <div className="grid grid-cols-3 gap-xs mb-md">
              {(['pdf','csv','json']).map(fmt => {
                const cfg = FMT_CONFIG[fmt];
                return (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFmt(fmt)}
                    className={`flex flex-col items-center gap-xs p-sm rounded-xl border-2 transition-all cursor-pointer ${
                      selectedFmt === fmt
                        ? `${cfg.border} ${cfg.bg}`
                        : 'border-outline-variant/40 hover:border-outline-variant'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${selectedFmt === fmt ? cfg.color : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                    <span className={`text-[10px] font-bold uppercase ${selectedFmt === fmt ? cfg.color : 'text-on-surface-variant'}`}>{fmt.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected format description */}
            <p className="text-[11px] text-on-surface-variant mb-md leading-relaxed">{FMT_CONFIG[selectedFmt].desc}</p>

            {/* Preview + Export buttons */}
            <div className="flex gap-xs">
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex-1 flex items-center justify-center gap-xs px-md py-sm border border-outline-variant rounded-xl text-body-sm font-bold hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">preview</span>
                Preview
              </button>
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded-xl text-body-sm font-bold hover:bg-primary/90 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export {selectedFmt.toUpperCase()}
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Export Preview Modal
          ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-lg"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 24 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-primary p-lg text-on-primary flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-headline-sm">Export Preview</h3>
                  <p className="text-[11px] opacity-80 mt-[2px]">Review before downloading</p>
                </div>
                <button onClick={() => setPreviewOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Format badge */}
              <div className="px-lg pt-lg">
                <div className={`inline-flex items-center gap-sm px-md py-sm rounded-xl ${FMT_CONFIG[selectedFmt].bg} ${FMT_CONFIG[selectedFmt].border} border`}>
                  <span className={`material-symbols-outlined ${FMT_CONFIG[selectedFmt].color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{FMT_CONFIG[selectedFmt].icon}</span>
                  <span className={`font-bold text-body-sm ${FMT_CONFIG[selectedFmt].color}`}>{FMT_CONFIG[selectedFmt].label}</span>
                </div>
              </div>

              {/* Contents breakdown */}
              <div className="p-lg space-y-sm">
                <p className="text-body-sm font-bold text-on-surface mb-sm">Included in this export:</p>
                {[
                  { icon: 'person',         label: 'Student Information',    value: `${profile.fullName || profile.firstName}  ·  ${profile.email}` },
                  { icon: 'school',         label: 'Subjects',               value: `${subjects.length} subject${subjects.length!==1?'s':''}` },
                  { icon: 'trending_up',    label: 'Academic Analytics',     value: `CGPA ${metrics.predictedCGPA?.toFixed(2)||'N/A'} · Target ${metrics.targetCGPA||'N/A'}` },
                  { icon: 'schedule',       label: 'Study Analytics',        value: `${Math.round((focusStats?.totalTime||0)/60)}h total · ${metrics.streak||0} day streak` },
                  { icon: 'how_to_reg',     label: 'Attendance',             value: `${subjects.length > 0 ? Math.round(subjects.reduce((a,s)=>a+(s.attendance||0),0)/subjects.length) : 0}% overall average` },
                  { icon: 'flag',           label: 'Milestones',             value: `${milestones.length} milestones (${completedMs} completed)` },
                  { icon: 'military_tech',  label: 'Achievements',           value: `${unlockedBadges} of ${BADGE_DEFS.length} badges unlocked` },
                  { icon: 'smart_toy',      label: 'AI Insights',            value: 'Performance · Attendance · Goals · Productivity' },
                ].map((item, i) => (
                  <motion.div
                    key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-sm p-sm rounded-xl bg-surface-container-low dark:bg-surface-variant"
                  >
                    <span className="material-symbols-outlined text-sm text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-on-surface">{item.label}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{item.value}</p>
                    </div>
                    <span className="material-symbols-outlined text-sm text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </motion.div>
                ))}
              </div>

              {/* Filename preview */}
              <div className="px-lg pb-md">
                <div className="bg-surface-container-highest rounded-xl p-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">insert_drive_file</span>
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    {selectedFmt === 'pdf' ? 'Academic_Report' : 'Academic_Data'}_{studentName}_{todayISO()}.{selectedFmt}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-sm px-lg pb-lg">
                <button onClick={() => setPreviewOpen(false)} className="flex-1 py-sm border border-outline-variant rounded-xl text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-xs py-sm bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : exportDone ? (
                    <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Done!</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">download</span> Download {selectedFmt.toUpperCase()}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

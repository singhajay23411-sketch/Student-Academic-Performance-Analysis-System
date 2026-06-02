import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

export default function PerformanceAnalysis() {
  const metrics = useStore((state) => state.metrics);
  const subjects = useStore((state) => state.subjects);
  const aiInsights = useStore((state) => state.aiInsights);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const updateMetrics = useStore((state) => state.updateMetrics);

  const getLetterGrade = (progress) => {
    if(progress >= 90) return 'A+';
    if(progress >= 85) return 'A';
    if(progress >= 80) return 'A-';
    if(progress >= 75) return 'B+';
    if(progress >= 70) return 'B';
    if(progress >= 65) return 'B-';
    if(progress >= 60) return 'C+';
    if(progress >= 50) return 'C';
    return 'F';
  };

  // Local state for inputs and validation
  const [targetCGPAInput, setTargetCGPAInput] = useState(metrics.targetCGPA ? metrics.targetCGPA.toString() : '');
  const [previousGPAInput, setPreviousGPAInput] = useState(metrics.previousGPA ? metrics.previousGPA.toString() : '');
  const [targetError, setTargetError] = useState('');
  const [previousError, setPreviousError] = useState('');

  // Keep inputs in sync with global store changes
  useEffect(() => {
    if (metrics.targetCGPA !== undefined) {
      setTargetCGPAInput(metrics.targetCGPA.toString());
    }
  }, [metrics.targetCGPA]);

  useEffect(() => {
    if (metrics.previousGPA !== undefined) {
      setPreviousGPAInput(metrics.previousGPA.toString());
    }
  }, [metrics.previousGPA]);

  // Color theme definition
  const colors = {
    primary: isDarkMode ? '#febb14' : '#7b5800',
    secondary: isDarkMode ? '#fed669' : '#755b00',
    tertiary: isDarkMode ? '#ffdea5' : '#7b5800',
    text: isDarkMode ? '#FFF8F5' : '#0F172A',
    textMuted: isDarkMode ? '#90816B' : '#475569',
    grid: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };

  const handleTargetChange = (e) => {
    const val = e.target.value;
    setTargetCGPAInput(val);
    if (val === '') {
      setTargetError('Required');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      setTargetError('Invalid number');
    } else if (num < 1.00 || num > 10.00) {
      setTargetError('Range: 1.00 - 10.00');
    } else {
      setTargetError('');
      updateMetrics({ targetCGPA: num });
    }
  };

  const handlePreviousChange = (e) => {
    const val = e.target.value;
    setPreviousGPAInput(val);
    if (val === '') {
      setPreviousError('Required');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      setPreviousError('Invalid number');
    } else if (num < 1.00 || num > 10.00) {
      setPreviousError('Range: 1.00 - 10.00');
    } else {
      setPreviousError('');
      updateMetrics({ previousGPA: num });
    }
  };

  // Drag and Drop handlers for priority reordering
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      useStore.getState().reorderSubjects(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const handlePriorityChange = (subjectId, newPriority) => {
    useStore.getState().updateSubject(subjectId, { priority: newPriority });
  };

  // Bar Chart Components & Render Helper
  const barData = subjects.map(sub => ({
    name: sub.shortName || sub.name.substring(0, 3).toUpperCase(),
    fullName: sub.name,
    progress: sub.progress,
    score: sub.score,
    maxScore: sub.maxScore,
    color: sub.color === 'primary' ? colors.primary : sub.color === 'secondary' ? colors.secondary : colors.tertiary,
  }));

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-xs rounded-xl border border-outline-variant/30 text-xs shadow-md bg-white dark:bg-surface-container-low p-sm">
          <p className="font-bold text-on-surface">{data.fullName}</p>
          <p className="text-primary font-bold text-xs mt-base">{data.progress}% Achieved</p>
          <p className="text-on-surface-variant text-[11px] mt-xs">Score: {data.score}/{data.maxScore}</p>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke={colors.textMuted}
          fontSize={10}
          fontWeight="bold"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={colors.textMuted}
          fontSize={10}
          fontWeight="bold"
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="progress" radius={[4, 4, 0, 0]} animationDuration={800}>
          {barData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Donut Chart Components & Render Helper
  const avgAttendance = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + (s.attendance ?? 100), 0) / subjects.length) 
    : 0;

  const tasks = useStore((state) => state.tasks) || [];
  const completedTasksTime = tasks.filter(t => t.done).reduce((sum, t) => sum + (t.time || 0), 0);
  const totalPlannedTime = tasks.reduce((sum, t) => sum + (t.time || 0), 0);
  const studyHoursProgress = totalPlannedTime > 0 ? Math.min(Math.round((completedTasksTime / totalPlannedTime) * 100), 100) : 75;

  const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
  const totalMaxScore = subjects.reduce((sum, s) => sum + s.maxScore, 0);
  const assignmentProgress = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 80;

  const avgSubjectProgress = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length) 
    : 85;

  const donutData = [
    { name: 'Attendance', value: avgAttendance, color: colors.primary },
    { name: 'Study Hours', value: studyHoursProgress, color: colors.secondary },
    { name: 'Assignments', value: assignmentProgress, color: colors.tertiary },
    { name: 'Tests & Quizzes', value: avgSubjectProgress, color: '#febb14' },
  ];

  const CustomDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-xs rounded-xl border border-outline-variant/30 text-xs shadow-md bg-white dark:bg-surface-container-low p-sm">
          <p className="font-bold text-on-surface">{data.name}</p>
          <p className="font-bold text-primary text-xs mt-base">{data.value}% Consistency</p>
        </div>
      );
    }
    return null;
  };

  const renderDonutChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={donutData}
          cx="50%"
          cy="42%"
          innerRadius={36}
          outerRadius={52}
          paddingAngle={3}
          dataKey="value"
          animationDuration={800}
        >
          {donutData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomDonutTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={32} 
          iconType="circle" 
          iconSize={6}
          tickLine={false}
          formatter={(value, entry) => (
            <span className="text-[9px] font-bold text-on-surface-variant px-xs">
              {value}: {entry.payload.value}%
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="grid grid-cols-12 gap-lg">
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-md h-fit">
        {/* Target CGPA */}
        <div className="glass-card p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-44 relative">
          <div>
            <label className="text-body-sm text-on-surface-variant mb-xs block font-bold" htmlFor="target-cgpa-input">My Target CGPA</label>
            <div className="relative mt-xs">
              <input
                id="target-cgpa-input"
                type="number"
                step="0.01"
                min="1.00"
                max="10.00"
                value={targetCGPAInput}
                onChange={handleTargetChange}
                className="text-headline-lg font-bold text-primary bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none w-full pb-xs tabular-nums focus:ring-0"
                placeholder="Not Set"
              />
              {targetError && (
                <p className="text-error text-xs font-semibold mt-xs absolute left-0 top-full bg-white dark:bg-surface-container-low px-xs py-base border border-error/20 rounded shadow-md z-20">{targetError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-xs text-tertiary mt-md">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span className="text-label-md font-bold">Target CGPA Goal</span>
          </div>
        </div>

        {/* Previous GPA */}
        <div className="glass-card p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-44 relative">
          <div>
            <label className="text-body-sm text-on-surface-variant mb-xs block font-bold" htmlFor="previous-gpa-input">Previous GPA</label>
            <div className="relative mt-xs">
              <input
                id="previous-gpa-input"
                type="number"
                step="0.01"
                min="1.00"
                max="10.00"
                value={previousGPAInput}
                onChange={handlePreviousChange}
                className="text-headline-lg font-bold text-on-surface bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none w-full pb-xs tabular-nums focus:ring-0"
                placeholder="Not Set"
              />
              {previousError && (
                <p className="text-error text-xs font-semibold mt-xs absolute left-0 top-full bg-white dark:bg-surface-container-low px-xs py-base border border-error/20 rounded shadow-md z-20">{previousError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-xs text-on-surface-variant mt-md">
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span className="text-label-md font-bold">Previous Term GPA</span>
          </div>
        </div>
      </div>

      {/* Priority List */}
      <div className="col-span-12 lg:col-span-4 row-span-2 glass-card p-lg rounded-xl shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-md shrink-0">
          <h4 className="font-headline-md text-on-surface">Priority List</h4>
          <span className="material-symbols-outlined text-primary">low_priority</span>
        </div>
        <p className="text-body-sm text-on-surface-variant mb-md shrink-0">Drag and drop cards to reorder. Set custom priorities below:</p>
        <ul className="space-y-sm overflow-y-auto max-h-[290px] pr-xs custom-scrollbar flex-1 pb-xs">
          {subjects.map((sub, idx) => {
            const currentPriority = sub.priority || 'Medium';
            return (
              <li
                key={sub.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className="flex items-center gap-sm p-sm rounded-lg border border-outline-variant/20 hover:border-primary/40 bg-white dark:bg-surface-container-high/10 transition-all cursor-grab active:cursor-grabbing select-none group"
              >
                {/* Drag Handle Icon */}
                <span className="material-symbols-outlined text-on-surface-variant/40 text-sm group-hover:text-primary transition-colors">drag_indicator</span>
                
                {/* Number Badge */}
                <span className="font-bold px-xs py-base rounded text-xs bg-surface-container-high dark:bg-surface-variant text-on-surface-variant shrink-0">
                  0{idx + 1}
                </span>
                
                {/* Subject Name */}
                <span className="text-body-sm flex-1 font-semibold truncate text-on-surface">{sub.name}</span>
                
                {/* Priority Selector & Score Progress */}
                <div className="flex items-center gap-sm shrink-0">
                  <span className="text-label-md font-bold text-on-surface-variant">{sub.progress}%</span>
                  <select
                    value={currentPriority}
                    onChange={(e) => handlePriorityChange(sub.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold px-xs py-base rounded border border-outline-variant/50 bg-surface-container-high dark:bg-surface-variant text-on-surface outline-none cursor-pointer focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </li>
            );
          })}
          {subjects.length === 0 && (
            <p className="text-body-sm text-on-surface-variant text-center py-sm">No subjects added yet</p>
          )}
        </ul>

        <div className="mt-md p-sm ai-glow border border-outline-variant/20 rounded-xl shrink-0">
          <div className="flex items-center gap-xs mb-xs text-secondary">
            <span className="material-symbols-outlined text-md">auto_awesome</span>
            <span className="text-label-md font-bold uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{__html: aiInsights.performance.desc.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-bold">$1</span>')}} />
        </div>
      </div>

      {/* Performance Trend with Real Data Charts */}
      <div className="col-span-12 lg:col-span-8 glass-card p-lg rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="mb-md">
          <h4 className="font-headline-md text-on-surface">Performance Trend</h4>
          <p className="text-body-sm text-on-surface-variant">Real-time dynamic academic health insights</p>
        </div>
        <div className="flex flex-col md:flex-row gap-md min-h-[260px] h-fit md:h-64 pt-xs">
          {/* Left Chart: Subject Progress Bar Chart */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-sm bg-surface-container-low dark:bg-surface-container-high/10 rounded-xl border border-outline-variant/30 min-h-[220px] h-full overflow-hidden">
            <h5 className="text-label-md font-bold text-on-surface-variant mb-xs shrink-0 flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm text-primary">bar_chart</span> Subject Performance Progress
            </h5>
            <div className="w-full h-full flex-1 min-h-0 mt-sm">
              {renderBarChart()}
            </div>
          </div>
          {/* Right Chart: Academic Success Factors Donut Chart */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-sm bg-surface-container-low dark:bg-surface-container-high/10 rounded-xl border border-outline-variant/30 min-h-[220px] h-full overflow-hidden">
            <h5 className="text-label-md font-bold text-on-surface-variant mb-xs shrink-0 flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm text-primary">donut_large</span> Academic Success Factors
            </h5>
            <div className="w-full h-full flex-1 min-h-0 mt-xs">
              {renderDonutChart()}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="col-span-12 glass-card p-lg rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg">
          <h4 className="font-headline-md text-on-surface">Subject-wise Detailed Analytics</h4>
          <div className="flex gap-xs">
            <button className="bg-primary text-white px-md py-xs rounded-lg text-body-sm font-semibold">Current Semester</button>
            <button className="bg-surface-container-high text-on-surface-variant px-md py-xs rounded-lg text-body-sm dark:bg-surface-variant">All Time</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Subject Name</th>
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold text-center">Attendance</th>
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold text-center">Quiz Avg</th>
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold text-center">Marks</th>
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold text-center">Forecast Grade</th>
                <th className="py-md px-sm text-label-md uppercase tracking-wider text-on-surface-variant font-bold text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors group">
                  <td className="py-lg px-sm">
                    <div className="flex items-center gap-sm">
                      <div className={`w-10 h-10 rounded bg-${sub.color}/10 flex items-center justify-center text-${sub.color}`}>
                        <span className="material-symbols-outlined">{sub.icon}</span>
                      </div>
                      <span className="font-body-md font-semibold">{sub.name}</span>
                    </div>
                  </td>
                  <td className={`py-lg px-sm text-center font-body-sm font-bold ${sub.attendance < 75 ? 'text-error' : 'text-on-surface'}`}>{sub.attendance}%</td>
                  <td className="py-lg px-sm text-center font-body-sm">{sub.progress}%</td>
                  <td className="py-lg px-sm text-center font-body-sm font-bold text-on-surface">{sub.score}/{sub.maxScore}</td>
                  <td className="py-lg px-sm text-center">
                    <span className={`bg-${sub.color}/10 text-${sub.color} px-sm py-base rounded-full text-xs font-bold`}>
                      {getLetterGrade(sub.progress)}
                    </span>
                  </td>
                  <td className="py-lg px-sm text-right">
                    <span className={`material-symbols-outlined ${sub.progress < 50 ? 'text-error' : sub.progress < 75 ? 'text-on-surface-variant' : 'text-primary'}`}>
                      {sub.progress < 50 ? 'trending_down' : sub.progress < 75 ? 'trending_flat' : 'trending_up'}
                    </span>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-lg text-body-sm text-on-surface-variant">
                    No academic records available. Add subjects from the Home Dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

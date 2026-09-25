import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  SlidersHorizontal,
  ChevronDown,
  BarChart2,
  Eye,
  EyeOff,
  Search,
  Zap,
  Info
} from 'lucide-react';

interface Props {
  initialSectionId?: string;
  onNavigateToGradebook?: () => void;
}

// Master curriculum subjects with curated vibrant, accessible color palette
export const CURRICULUM_SUBJECTS = [
  { id: 'math', name: 'Mathematics', shortCode: 'MATH', color: '#2563eb', category: 'STEM', defaultEnabled: true },
  { id: 'physics', name: 'Physics', shortCode: 'PHYS', color: '#7c3aed', category: 'STEM', defaultEnabled: true },
  { id: 'chemistry', name: 'Chemistry', shortCode: 'CHEM', color: '#ea580c', category: 'STEM', defaultEnabled: true },
  { id: 'biology', name: 'Biology', shortCode: 'BIO', color: '#059669', category: 'STEM', defaultEnabled: true },
  { id: 'english', name: 'English Language', shortCode: 'ENG', color: '#0891b2', category: 'Humanities', defaultEnabled: true },
  { id: 'it', name: 'Information Tech', shortCode: 'IT', color: '#4f46e5', category: 'STEM', defaultEnabled: true },
  { id: 'history', name: 'History & Geography', shortCode: 'HIST', color: '#d97706', category: 'Social Science', defaultEnabled: false },
  { id: 'civics', name: 'Civics & Ethics', shortCode: 'CIV', color: '#db2777', category: 'Social Science', defaultEnabled: false },
];

// Sequential milestone schedule over the 14-week term
const TERM_WEEKS = [
  { week: 'Wk 2', milestone: 'Diagnostic Quiz 1', shortLabel: 'W2: Quiz 1', date: 'Oct 04' },
  { week: 'Wk 4', milestone: 'Continuous Assessment 1', shortLabel: 'W4: Assess 1', date: 'Oct 18' },
  { week: 'Wk 6', milestone: 'Lab & Project Assessment', shortLabel: 'W6: Project', date: 'Nov 01' },
  { week: 'Wk 8', milestone: 'Official Mid-Term Exam', shortLabel: 'W8: Midterm', date: 'Nov 15' },
  { week: 'Wk 10', milestone: 'Continuous Assessment 2', shortLabel: 'W10: Assess 2', date: 'Nov 29' },
  { week: 'Wk 12', milestone: 'Pre-Final Mock Exam', shortLabel: 'W12: Mock', date: 'Dec 13' },
  { week: 'Wk 14', milestone: 'Final Term Examination', shortLabel: 'W14: Final', date: 'Dec 27' },
];

export const ClassSubjectPerformanceTrends: React.FC<Props> = ({
  initialSectionId,
  onNavigateToGradebook
}) => {
  const {
    sections,
    students,
    grades,
    teachers,
    currentTeacher,
    activeTeacherId,
    theme
  } = useSchool();

  const isDark = theme === 'dark';

  const teacher = currentTeacher || teachers?.find(t => t.id === activeTeacherId) || teachers?.[0];

  // Available sections for selector
  const availableSectionIds: string[] = useMemo(() => {
    if (Array.isArray(teacher?.assignedSections) && teacher.assignedSections.length > 0) {
      return teacher.assignedSections;
    }
    if (sections.length > 0) {
      return sections.map(s => s.id);
    }
    return ['9A', '9B', '10A', '10B'];
  }, [teacher, sections]);

  // Selected Section State
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId || availableSectionIds[0] || '9A'
  );

  // Selected Term State
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2'>('Term 1');

  // Visualization View Mode: Multi-line trend, distribution bar, or radar competency
  const [chartMode, setChartMode] = useState<'LINE_TREND' | 'AREA_STACK' | 'DISTRIBUTION_BAR' | 'RADAR_OVERVIEW'>('LINE_TREND');

  // Active Subject Visibility Toggles
  const [activeSubjects, setActiveSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_SUBJECTS.forEach(sub => {
      initial[sub.id] = sub.defaultEnabled;
    });
    return initial;
  });

  // Highlighted subject on hover
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);

  // Focus single subject for student breakdown drilldown
  const [drilldownSubjectId, setDrilldownSubjectId] = useState<string>('math');

  // Students in selected section
  const sectionStudents = useMemo(() => {
    return students.filter(s => s.sectionId === selectedSectionId);
  }, [students, selectedSectionId]);

  // Toggle subject line visibility
  const toggleSubject = (subId: string) => {
    setActiveSubjects(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };

  // Select all or isolate
  const handleSelectAll = () => {
    const next: Record<string, boolean> = {};
    CURRICULUM_SUBJECTS.forEach(s => { next[s.id] = true; });
    setActiveSubjects(next);
  };

  const handleIsolateTeacherSubject = () => {
    const next: Record<string, boolean> = {};
    const tSubject = (teacher?.subject || '').toLowerCase();
    const matched = CURRICULUM_SUBJECTS.find(s => tSubject.includes(s.id) || tSubject.includes(s.name.toLowerCase()));
    
    CURRICULUM_SUBJECTS.forEach(s => {
      next[s.id] = matched ? s.id === matched.id : s.id === 'math';
    });
    setActiveSubjects(next);
    if (matched) setDrilldownSubjectId(matched.id);
  };

  // ----------------------------------------------------------------------
  // 1. GENERATE LONGITUDINAL CLASS TREND DATA POINTS PER SUBJECT
  // ----------------------------------------------------------------------
  // Uses recorded student GradeEntry scores in SchoolContext as anchors,
  // blended across the 7 term milestones to produce continuous trend lines.
  const trendsData = useMemo(() => {
    // Collect recorded grades for this section
    const sectionGrades = grades.filter(g => g.sectionId === selectedSectionId);

    return TERM_WEEKS.map((milestone, idx) => {
      const dataPoint: Record<string, any> = {
        week: milestone.week,
        milestone: milestone.milestone,
        shortLabel: milestone.shortLabel,
        date: milestone.date,
        idx
      };

      let sumAllSubjects = 0;
      let countAllSubjects = 0;

      CURRICULUM_SUBJECTS.forEach(sub => {
        // Find existing grades recorded under this subject
        const subGrades = sectionGrades.filter(g =>
          g.subject.toLowerCase().includes(sub.name.toLowerCase()) ||
          g.subject.toLowerCase().includes(sub.id.toLowerCase())
        );

        // Subject baseline factors to reflect natural STEM vs Humanities grading curves
        const subjectBaseProfile: Record<string, { base: number; slope: number; volatility: number }> = {
          math: { base: 74, slope: 1.2, volatility: 2.1 },
          physics: { base: 71, slope: 1.4, volatility: 2.4 },
          chemistry: { base: 73, slope: 1.0, volatility: 1.8 },
          biology: { base: 78, slope: 0.9, volatility: 1.5 },
          english: { base: 82, slope: 0.6, volatility: 1.2 },
          it: { base: 84, slope: 0.8, volatility: 1.4 },
          history: { base: 80, slope: 0.7, volatility: 1.6 },
          civics: { base: 85, slope: 0.5, volatility: 1.1 },
        };

        const profile = subjectBaseProfile[sub.id] || { base: 75, slope: 1.0, volatility: 2.0 };

        // If actual grades exist in store, calculate from student data
        if (subGrades.length > 0) {
          const studentScores = subGrades.map(sg => {
            if (idx === 0) return (sg.quiz ? (sg.quiz / 20) * 100 : sg.totalGrade * 0.92);
            if (idx === 1) return (sg.assessment ? (sg.assessment / 20) * 100 : sg.totalGrade * 0.95);
            if (idx === 2) return (sg.assessment ? (sg.assessment / 20) * 100 * 1.02 : sg.totalGrade * 0.97);
            if (idx === 3) return (sg.midExam ? (sg.midExam / 30) * 100 : sg.totalGrade * 0.98);
            if (idx === 4) return (sg.assessment ? (sg.assessment / 20) * 100 * 1.04 : sg.totalGrade * 1.01);
            if (idx === 5) return (sg.totalGrade ? sg.totalGrade * 1.02 : 82);
            return (sg.finalExam ? (sg.finalExam / 40) * 100 : sg.totalGrade);
          });

          const avg = Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length);
          dataPoint[sub.id] = Math.min(100, Math.max(50, avg));
        } else {
          // Synthetic deterministic mathematical progression based on section profile
          // Seeded with section ID so different sections have distinct realistic patterns
          const sectionHash = (selectedSectionId.charCodeAt(0) * 7 + (selectedSectionId.charCodeAt(1) || 65)) % 5;
          const sectionOffset = (sectionHash - 2) * 1.5;

          // Milestone curve: dip near midterm (idx 3), recovery and peak towards final (idx 6)
          const midtermDip = idx === 3 ? -2.2 : (idx === 0 ? -1.5 : (idx === 6 ? 3.5 : idx * 0.7));
          const wave = Math.sin((idx + sub.id.length) * 0.9) * profile.volatility;

          const calculatedScore = Math.round(
            profile.base + sectionOffset + (idx * profile.slope) + midtermDip + wave
          );

          dataPoint[sub.id] = Math.min(98, Math.max(55, calculatedScore));
        }

        if (activeSubjects[sub.id]) {
          sumAllSubjects += dataPoint[sub.id];
          countAllSubjects++;
        }
      });

      // Overall Class Academic Average across enabled subjects
      dataPoint.classOverallAverage = countAllSubjects > 0
        ? Math.round(sumAllSubjects / countAllSubjects)
        : 75;

      return dataPoint;
    });
  }, [selectedSectionId, activeSubjects, grades]);

  // ----------------------------------------------------------------------
  // 2. SUMMARY METRICS PER SUBJECT (Pass Rate, Trajectory, Distinction)
  // ----------------------------------------------------------------------
  const subjectSummaryStats = useMemo(() => {
    return CURRICULUM_SUBJECTS.map(sub => {
      const firstScore = trendsData[0]?.[sub.id] || 70;
      const latestScore = trendsData[trendsData.length - 1]?.[sub.id] || 75;
      const midScore = trendsData[3]?.[sub.id] || 72;
      const diff = latestScore - firstScore;

      // Pass Rate & Distinction calculation
      const passRate = Math.min(100, Math.round(85 + (latestScore - 75) * 1.2));
      const distinctionRate = Math.max(10, Math.min(90, Math.round(25 + (latestScore - 75) * 1.5)));

      let status: 'EXCELLING' | 'ON_TRACK' | 'NEEDS_SUPPORT' = 'ON_TRACK';
      if (latestScore >= 85 || diff >= 5) status = 'EXCELLING';
      else if (latestScore < 70 || diff < 0) status = 'NEEDS_SUPPORT';

      return {
        ...sub,
        currentScore: latestScore,
        startScore: firstScore,
        midtermScore: midScore,
        trajectory: diff,
        passRate,
        distinctionRate,
        status,
        letterGrade: latestScore >= 90 ? 'A+' : (latestScore >= 85 ? 'A' : (latestScore >= 75 ? 'B' : (latestScore >= 65 ? 'C' : 'D')))
      };
    }).sort((a, b) => b.currentScore - a.currentScore);
  }, [trendsData]);

  // Top performing & most improved
  const topPerforming = subjectSummaryStats[0];
  const mostImproved = [...subjectSummaryStats].sort((a, b) => b.trajectory - a.trajectory)[0];
  const needsAttention = subjectSummaryStats.find(s => s.status === 'NEEDS_SUPPORT') || subjectSummaryStats[subjectSummaryStats.length - 1];

  // Radar Data for Competency balance
  const radarData = useMemo(() => {
    return CURRICULUM_SUBJECTS.map(sub => {
      const latest = trendsData[trendsData.length - 1]?.[sub.id] || 75;
      const target = 85;
      return {
        subject: sub.shortCode,
        fullName: sub.name,
        actual: latest,
        target: target,
        fullMark: 100
      };
    });
  }, [trendsData]);

  // Distribution Bar Chart Data
  const distributionData = useMemo(() => {
    return subjectSummaryStats.map(s => ({
      name: s.shortCode,
      fullName: s.name,
      average: s.currentScore,
      midterm: s.midtermScore,
      start: s.startScore,
      passRate: s.passRate
    }));
  }, [subjectSummaryStats]);

  // Custom Recharts Tooltip with Granular Test Scores and Point Breakdown
  const CustomTrendsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      if (!item) return null;

      // Determine test points scale for the milestone
      const milestoneLower = (item.milestone || '').toLowerCase();
      let scaleLabel = 'Standard (100 pts)';
      let maxPts = 100;
      let weightRatio = 1.0;

      if (milestoneLower.includes('quiz')) {
        scaleLabel = 'Quiz Scale (20 pts)';
        maxPts = 20;
        weightRatio = 0.20;
      } else if (milestoneLower.includes('mid-term') || milestoneLower.includes('midterm')) {
        scaleLabel = 'Official Mid-Term (30 pts)';
        maxPts = 30;
        weightRatio = 0.30;
      } else if (milestoneLower.includes('project') || milestoneLower.includes('assess') || milestoneLower.includes('cw')) {
        scaleLabel = 'Continuous Assessment (20 pts)';
        maxPts = 20;
        weightRatio = 0.20;
      } else if (milestoneLower.includes('final')) {
        scaleLabel = 'Terminal Exam (40 pts)';
        maxPts = 40;
        weightRatio = 0.40;
      }

      // Check if user is focusing a specific subject
      const focusedSubjectEntry = hoveredSubjectId
        ? payload.find((e: any) => e.dataKey === hoveredSubjectId)
        : null;
      const focusedMeta = hoveredSubjectId ? CURRICULUM_SUBJECTS.find(s => s.id === hoveredSubjectId) : null;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[280px] max-w-[340px] space-y-2.5 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div>
              <span className="font-bold text-sm text-white block">{item?.milestone}</span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-blue-900/50 text-blue-300 font-bold border border-blue-700/50">
                  {item?.week}
                </span>
                <span>{item?.date}</span>
                <span>•</span>
                <span className="text-slate-300">{scaleLabel}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] rounded-full border border-blue-500/40 font-bold block">
                Avg: {item?.classOverallAverage}%
              </span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                {((item?.classOverallAverage * weightRatio)).toFixed(1)} / {maxPts} pts
              </span>
            </div>
          </div>

          {/* If focused subject on chart hover, spotlight its granular card */}
          {focusedSubjectEntry && focusedMeta && (
            <div
              className="p-2.5 rounded-lg border text-xs space-y-1.5 transition-all"
              style={{
                backgroundColor: `${focusedMeta.color}15`,
                borderColor: `${focusedMeta.color}60`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: focusedMeta.color }} />
                  <span className="font-bold text-white text-xs">{focusedMeta.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">({focusedMeta.category})</span>
                </div>
                <span className="font-mono font-bold text-xs" style={{ color: focusedMeta.color }}>
                  {focusedSubjectEntry.value}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[9px]">Scaled Exam Points</span>
                  <span className="font-mono font-bold text-slate-200">
                    {((focusedSubjectEntry.value * weightRatio)).toFixed(1)} / {maxPts} pts
                  </span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[9px]">Milestone Pass Rate</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.min(100, Math.round(85 + (focusedSubjectEntry.value - 75) * 1.2))}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Granular Table of All Active Subjects */}
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-0.5 border-b border-slate-800">
              <span>Subject</span>
              <div className="flex items-center gap-3">
                <span>Score</span>
                <span>Scaled Pts</span>
                <span>Grade</span>
              </div>
            </div>

            {payload.map((entry: any) => {
              if (entry.dataKey === 'classOverallAverage') return null;
              const subMeta = CURRICULUM_SUBJECTS.find(s => s.id === entry.dataKey);
              if (!subMeta) return null;

              const scaledScore = (entry.value * weightRatio).toFixed(1);
              const baselineScore = trendsData[0]?.[subMeta.id] || 70;
              const delta = entry.value - baselineScore;
              const isItemHovered = hoveredSubjectId === subMeta.id;

              return (
                <div
                  key={entry.dataKey}
                  className={`flex items-center justify-between py-1 px-1.5 rounded transition ${
                    isItemHovered ? 'bg-slate-800 border border-slate-600' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-200 text-[11px] font-medium truncate">{subMeta.name}</span>
                  </div>

                  <div className="flex items-center gap-2.5 font-mono text-[11px]">
                    <span className="font-bold text-white">{entry.value}%</span>
                    <span className="text-[10px] text-slate-400 min-w-[42px] text-right">
                      {scaledScore}p
                    </span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                      entry.value >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
                      entry.value >= 70 ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {entry.value >= 85 ? 'A' : (entry.value >= 70 ? 'B' : 'C')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Target Compliance */}
          <div className="flex items-center justify-between pt-1.5 px-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Pass Threshold: <strong className="text-amber-400">70%</strong></span>
            <span>Honors Benchmark: <strong className="text-emerald-400">85%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Distribution Bar Chart
  const CustomDistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const subMeta = CURRICULUM_SUBJECTS.find(s => s.shortCode === data.name || s.name === data.fullName);
      const growth = data.average - data.start;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[250px] space-y-2 z-50">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <div>
              <span className="font-bold text-sm text-white">{data.fullName}</span>
              <span className="text-[10px] text-slate-400 font-mono block">Code: {data.name} • {subMeta?.category || 'Curriculum'}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              growth >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {growth >= 0 ? `+${growth}% Growth` : `${growth}% Drop`}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-300 text-[11px]">Diagnostic Baseline (W2):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-200">{data.start}%</span>
                <span className="text-[9px] text-slate-400 block">{((data.start * 0.20)).toFixed(1)} / 20 pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-300 text-[11px]">Official Midterm Exam (W8):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-blue-300">{data.midterm}%</span>
                <span className="text-[9px] text-slate-400 block">{((data.midterm * 0.30)).toFixed(1)} / 30 pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-300 text-[11px]">Final Projected Average (W14):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-300">{data.average}%</span>
                <span className="text-[9px] text-slate-400 block">{((data.average * 0.40)).toFixed(1)} / 40 pts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 px-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400">Class Pass Rate:</span>
            <span className="font-mono font-bold text-emerald-400">{data.passRate}% Clearance</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Radar Competency Chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const subMeta = CURRICULUM_SUBJECTS.find(s => s.shortCode === data.subject || s.name === data.fullName);
      const gap = data.actual - data.target;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[230px] space-y-2 z-50">
          <div className="border-b border-slate-700 pb-1.5">
            <span className="font-bold text-sm text-white block">{data.fullName}</span>
            <span className="text-[10px] text-slate-400 font-mono">{subMeta?.category || 'Subject Competency'}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Class Mastery Score:</span>
              <span className="font-mono font-bold text-sm text-blue-400">{data.actual}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Distinction Target:</span>
              <span className="font-mono font-bold text-emerald-400">{data.target}%</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
              <span className="text-slate-400">Target Gap:</span>
              <span className={`font-mono font-bold ${gap >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {gap >= 0 ? `+${gap}% (Target Achieved)` : `${gap}% (Gap to Honors)`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Section / Term Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-oskar-vintage text-xl font-bold text-slate-900 tracking-wide">
                  Class Academic Performance Trends
                </h2>
                <p className="text-xs text-slate-500">
                  Longitudinal Recharts analytics plotting subject trajectory across 14-week term milestones.
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Class Selector, Term Selector, View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Section Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-xs font-semibold text-slate-600">Class Section:</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {availableSectionIds.map(secId => (
                  <option key={secId} value={secId}>
                    Section {secId} ({students.filter(s => s.sectionId === secId).length} Students)
                  </option>
                ))}
              </select>
            </div>

            {/* Term Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="Term 1">Current: Term 1 (Autumn)</option>
                <option value="Term 2">Upcoming: Term 2 (Spring)</option>
              </select>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartMode('LINE_TREND')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  chartMode === 'LINE_TREND'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Multi-Line Subject Trend Chart"
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-Line</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('AREA_STACK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  chartMode === 'AREA_STACK'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Comparative Area Wave"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Area Wave</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('DISTRIBUTION_BAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  chartMode === 'DISTRIBUTION_BAR'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Subject Mean & Pass Rate Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Distribution</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('RADAR_OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  chartMode === 'RADAR_OVERVIEW'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Curriculum Competency Radar"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* High-Level Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class Cohort Size</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-oskar-vintage text-2xl font-bold text-slate-900">{sectionStudents.length}</span>
              <span className="text-xs text-slate-500 font-medium">Sec {selectedSectionId}</span>
            </div>
            <span className="text-[10px] text-slate-500">Active enrolled students</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
              <Award className="w-3 h-3" /> Top Subject
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-oskar-vintage text-2xl font-bold text-emerald-900">{topPerforming?.currentScore}%</span>
              <span className="text-xs font-bold text-emerald-700">{topPerforming?.shortCode}</span>
            </div>
            <span className="text-[10px] text-emerald-700">{topPerforming?.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Most Improved
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-oskar-vintage text-2xl font-bold text-blue-900">
                +{mostImproved?.trajectory}%
              </span>
              <span className="text-xs font-bold text-blue-700">{mostImproved?.shortCode}</span>
            </div>
            <span className="text-[10px] text-blue-700">Highest growth over term</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Academic Priority
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-oskar-vintage text-2xl font-bold text-amber-900">{needsAttention?.currentScore}%</span>
              <span className="text-xs font-bold text-amber-700">{needsAttention?.shortCode}</span>
            </div>
            <span className="text-[10px] text-amber-700">{needsAttention?.name}</span>
          </div>
        </div>

        {/* Interactive Subject Series Toggles */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Plot Subjects ({Object.values(activeSubjects).filter(Boolean).length} Active):</span>
            </label>

            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleIsolateTeacherSubject}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Focus My Subject ({teacher?.subject || 'Academics'})
              </button>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CURRICULUM_SUBJECTS.map((sub) => {
              const isActive = activeSubjects[sub.id];
              const score = trendsData[trendsData.length - 1]?.[sub.id] || 75;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubject(sub.id)}
                  onMouseEnter={() => setHoveredSubjectId(sub.id)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-white shadow-2xs border-slate-300 text-slate-900 ring-1'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  style={{
                    boxShadow: isActive ? `0 0 0 1px ${sub.color}` : undefined
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition"
                    style={{
                      backgroundColor: isActive ? sub.color : '#cbd5e1'
                    }}
                  />
                  <span>{sub.name}</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {score}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PRIMARY RECHARTS VISUALIZATION CONTAINER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              {chartMode === 'LINE_TREND' && `Section ${selectedSectionId}: Subject Performance Trajectory (${selectedTerm})`}
              {chartMode === 'AREA_STACK' && `Section ${selectedSectionId}: Comparative Academic Volume (${selectedTerm})`}
              {chartMode === 'DISTRIBUTION_BAR' && `Section ${selectedSectionId}: Final Benchmark vs Starting Diagnostic`}
              {chartMode === 'RADAR_OVERVIEW' && `Section ${selectedSectionId}: Academic Competency Profile vs Target Benchmark`}
            </h3>
            <p className="text-xs text-slate-500">
              {chartMode === 'LINE_TREND' && 'Continuous trend comparison across 7 sequential evaluation milestones.'}
              {chartMode === 'AREA_STACK' && 'Multi-subject performance area wave illustrating class mastery consistency.'}
              {chartMode === 'DISTRIBUTION_BAR' && 'Comparison of baseline diagnostic scores against final projected marks.'}
              {chartMode === 'RADAR_OVERVIEW' && 'Balanced subject proficiency radar mapped against the 85% Distinction Target.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed" /> 70% Pass
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed" /> 85% Honors
            </span>
          </div>
        </div>

        {/* CHART RENDERING AREA */}
        <div className="h-[380px] w-full pt-2">
          {/* 1. MULTI-LINE TREND CHART */}
          {chartMode === 'LINE_TREND' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[50, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomTrendsTooltip />} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />

                {/* Individual Subject Lines */}
                {CURRICULUM_SUBJECTS.map((sub) => {
                  if (!activeSubjects[sub.id]) return null;
                  const isHovered = hoveredSubjectId === sub.id;
                  const isAnyHovered = Boolean(hoveredSubjectId);

                  return (
                    <Line
                      key={sub.id}
                      type="monotone"
                      dataKey={sub.id}
                      name={sub.name}
                      stroke={sub.color}
                      strokeWidth={isHovered ? 3.5 : 2.2}
                      strokeOpacity={isAnyHovered && !isHovered ? 0.25 : 1}
                      dot={{ r: isHovered ? 5 : 3.5, strokeWidth: 1.5, fill: '#fff', stroke: sub.color }}
                      activeDot={{ r: 7, strokeWidth: 2, fill: sub.color, stroke: '#fff' }}
                      animationDuration={800}
                    />
                  );
                })}

                {/* Overall Class Average Reference Line */}
                <Line
                  type="monotone"
                  dataKey="classOverallAverage"
                  name="Class Overall Mean"
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* 2. AREA WAVE CHART */}
          {chartMode === 'AREA_STACK' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <defs>
                  {CURRICULUM_SUBJECTS.map((sub) => (
                    <linearGradient key={sub.id} id={`grad-${sub.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={sub.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={sub.color} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="shortLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTrendsTooltip />} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="4 4" />

                {CURRICULUM_SUBJECTS.map((sub) => {
                  if (!activeSubjects[sub.id]) return null;
                  return (
                    <Area
                      key={sub.id}
                      type="monotone"
                      dataKey={sub.id}
                      name={sub.name}
                      stroke={sub.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${sub.id})`}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* 3. DISTRIBUTION BAR CHART */}
          {chartMode === 'DISTRIBUTION_BAR' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomDistributionTooltip />} />
                <Legend />
                <Bar dataKey="start" name="Diagnostic W2" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="midterm" name="Midterm W8" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" name="Final Milestone" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* 4. RADAR PROFILE CHART */}
          {chartMode === 'RADAR_OVERVIEW' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="fullName" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Radar name="Class Average" dataKey="actual" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                <Radar name="Distinction Target (85%)" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Legend />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SUBJECT COMPARISON LEDGER & STUDENT DRILLDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Comparison Table (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Curriculum Subject Performance Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Comparative ranking of Section {selectedSectionId} subject mastery for {selectedTerm}.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {CURRICULUM_SUBJECTS.length} Subjects Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Subject & Department</th>
                  <th className="py-2.5 px-2 text-center">Class Mean</th>
                  <th className="py-2.5 px-2 text-center">Term Trajectory</th>
                  <th className="py-2.5 px-2 text-center">Pass Rate</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectSummaryStats.map((sub) => {
                  const isSelectedForDrilldown = drilldownSubjectId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setDrilldownSubjectId(sub.id)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isSelectedForDrilldown ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: sub.color }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{sub.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {sub.shortCode} • {sub.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono font-bold text-sm text-slate-900">{sub.currentScore}%</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-700 font-bold">
                            {sub.letterGrade}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono ${
                          sub.trajectory >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {sub.trajectory >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {sub.trajectory >= 0 ? `+${sub.trajectory}%` : `${sub.trajectory}%`}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <div className="w-16 mx-auto">
                          <div className="flex justify-between text-[10px] font-mono mb-0.5">
                            <span className="font-bold text-slate-700">{sub.passRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${sub.passRate}%`,
                                backgroundColor: sub.passRate >= 80 ? '#10b981' : '#f59e0b'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'EXCELLING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'NEEDS_SUPPORT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sub.status === 'EXCELLING' ? 'Excelling' : (sub.status === 'NEEDS_SUPPORT' ? 'Priority Alert' : 'On Track')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrilldownSubjectId(sub.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            isSelectedForDrilldown
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Drilldown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Subject Student Roster Drilldown (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Individual Student Distribution
              </span>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900 mt-0.5">
                {CURRICULUM_SUBJECTS.find(s => s.id === drilldownSubjectId)?.name || 'Subject Roster'}
              </h3>
            </div>

            {onNavigateToGradebook && (
              <button
                type="button"
                onClick={onNavigateToGradebook}
                className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3 h-3 text-amber-400" />
                Gradebook
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {sectionStudents.map((st, idx) => {
              // Extract or synthesize student mark for this subject
              const studentGrade = grades.find(g =>
                g.studentId === st.id &&
                (g.subject.toLowerCase().includes(drilldownSubjectId) || g.sectionId === selectedSectionId)
              );

              const subMeta = CURRICULUM_SUBJECTS.find(s => s.id === drilldownSubjectId);
              const classMean = trendsData[trendsData.length - 1]?.[drilldownSubjectId] || 75;

              // Synthesize deterministic variance around class mean based on student id
              const hash = (st.id.charCodeAt(st.id.length - 1) + drilldownSubjectId.length) % 15 - 7;
              const computedScore = studentGrade?.totalGrade || Math.min(99, Math.max(52, classMean + hash));

              return (
                <div
                  key={st.id}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {st.fullName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{st.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{st.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-900 block">{computedScore}%</span>
                      <span className={`text-[9px] font-semibold ${
                        computedScore >= 85 ? 'text-emerald-700' :
                        computedScore >= 70 ? 'text-blue-700' : 'text-rose-600'
                      }`}>
                        {computedScore >= 85 ? 'Distinction' : (computedScore >= 70 ? 'Satisfactory' : 'Needs Support')}
                      </span>
                    </div>

                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      computedScore >= 85 ? 'bg-emerald-100 text-emerald-800' :
                      computedScore >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {computedScore >= 90 ? 'A+' : (computedScore >= 80 ? 'A' : (computedScore >= 70 ? 'B' : 'C'))}
                    </span>
                  </div>
                </div>
              );
            })}

            {sectionStudents.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No students enrolled in Section {selectedSectionId}.
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Data reflects classroom assessment weights: Quizzes (20%), Continuous Assessment (20%), Midterm (30%), Final Exam (40%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

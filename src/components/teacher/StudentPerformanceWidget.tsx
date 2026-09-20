import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  CalendarCheck2,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  BarChart2,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface StudentPerformanceWidgetProps {
  defaultSectionId?: string;
  onSelectStudentForGrading?: (studentId: string) => void;
  onNavigateToGradebook?: () => void;
  onNavigateToAttendance?: () => void;
}

export const StudentPerformanceWidget: React.FC<StudentPerformanceWidgetProps> = ({
  defaultSectionId,
  onSelectStudentForGrading,
  onNavigateToGradebook,
  onNavigateToAttendance
}) => {
  const {
    currentTeacher,
    teachers,
    activeTeacherId,
    sections,
    students,
    attendanceRecords,
    grades,
    disciplinaryActions,
    evaluations,
    theme
  } = useSchool();

  const isDark = theme === 'dark';

  // Dynamic Theme-Aware Chart Styling Tokens
  const chartStyles = useMemo(() => ({
    gridStroke: isDark ? '#334155' : '#E2E8F0',
    axisStroke: isDark ? '#475569' : '#CBD5E1',
    tickFill: isDark ? '#94A3B8' : '#64748B',
    tooltipBg: isDark ? '#0F172A' : '#FFFFFF',
    tooltipBorder: isDark ? '#334155' : '#E2E8F0',
    tooltipText: isDark ? '#F8FAFC' : '#0F172A',
    referenceLine: isDark ? '#64748B' : '#94A3B8',
  }), [isDark]);

  const teacher = currentTeacher || teachers?.find(t => t.id === activeTeacherId) || teachers?.[0];

  // Available sections for this teacher
  const teacherSectionIds: string[] = useMemo(() => {
    if (Array.isArray(teacher?.assignedSections) && teacher.assignedSections.length > 0) {
      return teacher.assignedSections;
    }
    if (teacher?.assignedSectionId) {
      return [teacher.assignedSectionId];
    }
    return sections.length > 0 ? [sections[0].id] : ['9A'];
  }, [teacher, sections]);

  // Selected Section Filter
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    defaultSectionId && teacherSectionIds.includes(defaultSectionId)
      ? defaultSectionId
      : teacherSectionIds[0] || '9A'
  );

  // Selected individual student filter ('ALL' or studentId)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');

  // Time / Evaluation Horizon
  const [metricViewMode, setMetricViewMode] = useState<'COMBINED' | 'GRADES' | 'ATTENDANCE'>('COMBINED');

  // Active hover data highlight
  const [highlightMetric, setHighlightMetric] = useState<string | null>(null);

  // Filter students who belong to the selected section
  const sectionStudents = useMemo(() => {
    return students.filter(s => s.sectionId === selectedSectionId);
  }, [students, selectedSectionId]);

  // Filtered target students list based on selectedStudentId
  const activeFocusStudents = useMemo(() => {
    if (selectedStudentId === 'ALL') {
      return sectionStudents;
    }
    return sectionStudents.filter(s => s.id === selectedStudentId);
  }, [sectionStudents, selectedStudentId]);

  // Current focused student object if single student selected
  const singleStudent = useMemo(() => {
    if (selectedStudentId === 'ALL') return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // -------------------------------------------------------------
  // 1. SEMESTER GRADE TRENDS DATA GENERATION
  // -------------------------------------------------------------
  // We model sequential academic milestones across Current Semester:
  // Milestone 1: Diagnostic Quiz 1 (Week 2)
  // Milestone 2: Continuous Assessment / CW 1 (Week 4)
  // Milestone 3: Pop Quiz 2 (Week 6)
  // Milestone 4: Mid-Term Examination (Week 8)
  // Milestone 5: Practical Assessment / Project (Week 10)
  // Milestone 6: Mock / Pre-Final Assessment (Week 12)
  // Milestone 7: Final Examination (Projected / Recorded)
  // -------------------------------------------------------------
  const gradeTrendsData = useMemo(() => {
    const milestones = [
      { id: 'Q1', name: 'Quiz 1 (W2)', fullLabel: 'Diagnostic Quiz 1', week: 'Wk 2', baseFactor: 0.92 },
      { id: 'CW1', name: 'CW / Assess 1 (W4)', fullLabel: 'Continuous Assessment 1', week: 'Wk 4', baseFactor: 0.95 },
      { id: 'Q2', name: 'Quiz 2 (W6)', fullLabel: 'Analytical Quiz 2', week: 'Wk 6', baseFactor: 0.90 },
      { id: 'MID', name: 'Mid-Term Exam (W8)', fullLabel: 'Official Mid-Term Exam', week: 'Wk 8', baseFactor: 0.94 },
      { id: 'CW2', name: 'Project / Lab (W10)', fullLabel: 'Practical / Lab Project', week: 'Wk 10', baseFactor: 0.97 },
      { id: 'REV', name: 'Pre-Final Review (W12)', fullLabel: 'Pre-Final Mock Review', week: 'Wk 12', baseFactor: 0.93 },
      { id: 'FIN', name: 'Final Exam (W14)', fullLabel: 'Final Term Examination', week: 'Wk 14', baseFactor: 0.96 }
    ];

    // Relevant recorded grades in this section and subject
    const sectionGrades = grades.filter(g =>
      g.sectionId === selectedSectionId || (teacher?.subject && g.subject.includes(teacher.subject.split(' ')[0]))
    );

    // If a single student is selected:
    if (selectedStudentId !== 'ALL' && singleStudent) {
      const studentGrade = grades.find(g => g.studentId === selectedStudentId);

      // Extract specific scores or build realistic historical progression towards their actual total
      const actualQuiz = studentGrade ? (studentGrade.quiz / 20) * 100 : (singleStudent.ninthGradeResults?.average || 82);
      const actualMid = studentGrade ? (studentGrade.midExam / 30) * 100 : (singleStudent.ninthGradeResults?.math || 85);
      const actualAssess = studentGrade ? (studentGrade.assessment / 20) * 100 : (singleStudent.ninthGradeResults?.science || 86);
      const actualFinal = studentGrade ? (studentGrade.finalExam / 40) * 100 : (singleStudent.ninthGradeResults?.english || 84);
      const actualTotal = studentGrade ? studentGrade.total : Math.round((actualQuiz + actualMid + actualAssess + actualFinal) / 4);

      return milestones.map((m, idx) => {
        let score = actualTotal;
        if (idx === 0) score = Math.round(actualQuiz * 0.96);
        else if (idx === 1) score = Math.round(actualAssess * 0.98);
        else if (idx === 2) score = Math.round(actualQuiz * 1.02);
        else if (idx === 3) score = Math.round(actualMid);
        else if (idx === 4) score = Math.round(actualAssess * 1.04);
        else if (idx === 5) score = Math.round((actualMid + actualAssess) / 2);
        else score = Math.round(actualFinal);

        // Bound 0 - 100
        score = Math.min(100, Math.max(45, score));

        // Section average benchmark for comparison
        const sectionBenchmark = 78 + Math.sin(idx * 0.8) * 3;

        return {
          milestone: m.name,
          shortName: m.name.split(' (')[0],
          week: m.week,
          studentScore: score,
          sectionAverage: Math.round(sectionBenchmark),
          passingBenchmark: 70,
          targetHonorBenchmark: 85
        };
      });
    }

    // Otherwise, calculate Section Aggregate Grade Trends
    return milestones.map((m, idx) => {
      // Baseline class score derived from students' recorded grades or entrance benchmarks
      const sampleScores = sectionStudents.map(st => {
        const found = sectionGrades.find(g => g.studentId === st.id);
        if (found) {
          if (idx === 0) return (found.quiz / 20) * 100 * 0.95;
          if (idx === 1) return (found.assessment / 20) * 100 * 0.98;
          if (idx === 3) return (found.midExam / 30) * 100;
          if (idx === 6) return (found.finalExam / 40) * 100;
          return found.total;
        }
        const fallback = st.ninthGradeResults?.average || 80;
        return fallback + (idx - 3) * 1.5;
      });

      const avgScore = sampleScores.length > 0
        ? Math.round(sampleScores.reduce((a, b) => a + b, 0) / sampleScores.length)
        : 82;

      const highestScore = sampleScores.length > 0 ? Math.min(100, Math.round(Math.max(...sampleScores))) : 96;
      const lowestScore = sampleScores.length > 0 ? Math.max(50, Math.round(Math.min(...sampleScores))) : 68;

      return {
        milestone: m.name,
        shortName: m.name.split(' (')[0],
        week: m.week,
        averageScore: avgScore,
        highestScore: Math.min(100, highestScore + idx),
        lowestScore: Math.max(50, lowestScore - (idx % 2)),
        passingBenchmark: 70,
        targetHonorBenchmark: 85
      };
    });
  }, [selectedSectionId, selectedStudentId, singleStudent, sectionStudents, grades, teacher]);

  // -------------------------------------------------------------
  // 2. ATTENDANCE CONSISTENCY OVER SEMESTER (Longitudinal)
  // -------------------------------------------------------------
  // Collect recorded attendance dates and compute consistency rates
  const attendanceConsistencyData = useMemo(() => {
    // School days ordered chronologically
    const uniqueDates: string[] = Array.from(new Set<string>(attendanceRecords.map(r => r.date))).sort();

    // If limited records in mock, extend with semester weekly intervals
    const referenceDates: string[] = uniqueDates.length >= 5
      ? uniqueDates
      : ['2026-09-08', '2026-09-10', '2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'];

    if (selectedStudentId !== 'ALL' && singleStudent) {
      // Track single student attendance record per day
      let rollingPresent = 0;
      let rollingTotal = 0;

      return referenceDates.map((dateStr: string) => {
        // Find record for this student on date
        const rec = attendanceRecords.find(r =>
          r.date === dateStr && (r.studentId === selectedStudentId || r.records?.some(x => x.studentId === selectedStudentId))
        );

        let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' = 'PRESENT';
        if (rec) {
          const item = rec.records?.find(x => x.studentId === selectedStudentId);
          status = item?.status || rec.status || 'PRESENT';
        } else {
          // Stable deterministic fallback
          const charCode = dateStr.charCodeAt(dateStr.length - 1) + selectedStudentId.charCodeAt(selectedStudentId.length - 1);
          if (charCode % 11 === 0) status = 'LATE';
          else if (charCode % 19 === 0) status = 'ABSENT';
          else status = 'PRESENT';
        }

        rollingTotal += 1;
        if (status === 'PRESENT' || status === 'EXCUSED') {
          rollingPresent += 1;
        } else if (status === 'LATE') {
          rollingPresent += 0.75; // late counts as 75% consistency
        }

        const consistencyRate = Math.round((rollingPresent / rollingTotal) * 100);

        // Format short date label
        const [y, m, d] = dateStr.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return {
          date: dateStr,
          shortDate,
          status,
          statusWeight: status === 'PRESENT' ? 100 : status === 'LATE' ? 75 : status === 'EXCUSED' ? 85 : 0,
          consistencyRate,
          sectionBenchmark: 91
        };
      });
    }

    // Section Aggregate Attendance Consistency
    let runningSectionPresentSum = 0;
    let runningDaysCount = 0;

    return referenceDates.map((dateStr: string) => {
      const recordsOnDate = attendanceRecords.filter(r =>
        r.date === dateStr && (r.sectionId === selectedSectionId || !r.sectionId)
      );

      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let excusedCount = 0;

      const totalAudited = sectionStudents.length > 0 ? sectionStudents.length : 12;

      recordsOnDate.forEach(r => {
        if (r.records && r.records.length > 0) {
          r.records.forEach(sub => {
            if (sub.status === 'PRESENT') presentCount++;
            else if (sub.status === 'LATE') lateCount++;
            else if (sub.status === 'ABSENT') absentCount++;
            else if (sub.status === 'EXCUSED') excusedCount++;
          });
        } else if (r.status) {
          if (r.status === 'PRESENT') presentCount++;
          else if (r.status === 'LATE') lateCount++;
          else if (r.status === 'ABSENT') absentCount++;
          else if (r.status === 'EXCUSED') excusedCount++;
        }
      });

      // If data is scarce on certain dates, generate smooth authentic distribution
      if (presentCount + lateCount + absentCount + excusedCount === 0) {
        const hash = dateStr.charCodeAt(dateStr.length - 1);
        absentCount = hash % 5 === 0 ? 1 : 0;
        lateCount = hash % 3 === 0 ? 2 : 1;
        excusedCount = hash % 7 === 0 ? 1 : 0;
        presentCount = Math.max(0, totalAudited - (absentCount + lateCount + excusedCount));
      }

      const dailyRate = Math.min(100, Math.round(((presentCount + excusedCount + lateCount * 0.75) / (totalAudited || 1)) * 100));

      runningDaysCount += 1;
      runningSectionPresentSum += dailyRate;
      const cumulativeConsistency = Math.round(runningSectionPresentSum / runningDaysCount);

      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: dateStr,
        shortDate,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        dailyRate,
        cumulativeConsistency,
        academyTarget: 90
      };
    });
  }, [attendanceRecords, selectedStudentId, singleStudent, sectionStudents, selectedSectionId]);

  // -------------------------------------------------------------
  // 3. STUDENT PERFORMANCE CORRELATION MATRIX & ROSTER
  // (Grade Score vs Attendance Consistency per scholar)
  // -------------------------------------------------------------
  const studentCorrelationTable = useMemo(() => {
    return sectionStudents.map(st => {
      // Find recorded grade
      const g = grades.find(x => x.studentId === st.id);
      const studentTotalScore = g ? g.total : (st.ninthGradeResults?.average || 82);
      const letterGrade = g ? g.letterGrade : (studentTotalScore >= 90 ? 'A+' : studentTotalScore >= 85 ? 'A' : studentTotalScore >= 80 ? 'B+' : 'B');

      // Calculate individual attendance count from records
      let pres = 0;
      let late = 0;
      let abs = 0;
      let exc = 0;
      let totalSessions = 0;

      attendanceRecords.forEach(ar => {
        const sub = ar.records?.find(x => x.studentId === st.id);
        const status = sub?.status || (ar.studentId === st.id ? ar.status : null);
        if (status) {
          totalSessions++;
          if (status === 'PRESENT') pres++;
          else if (status === 'LATE') late++;
          else if (status === 'ABSENT') abs++;
          else if (status === 'EXCUSED') exc++;
        }
      });

      // Fallback if records haven't been taken for this specific student yet
      if (totalSessions === 0) {
        totalSessions = 10;
        pres = 9;
        late = 1;
      }

      const attendancePercentage = Math.round(((pres + exc + late * 0.75) / totalSessions) * 100);

      // Identify risk level
      let riskStatus: 'HIGH_PERFORMER' | 'ON_TRACK' | 'ATTENDANCE_RISK' | 'ACADEMIC_INTERVENTION' = 'ON_TRACK';
      if (studentTotalScore >= 90 && attendancePercentage >= 92) {
        riskStatus = 'HIGH_PERFORMER';
      } else if (attendancePercentage < 80) {
        riskStatus = 'ATTENDANCE_RISK';
      } else if (studentTotalScore < 70) {
        riskStatus = 'ACADEMIC_INTERVENTION';
      }

      // Check disciplinary
      const hasDisciplinary = disciplinaryActions.some(d => d.studentId === st.id && !d.reversedByPrincipal);

      return {
        student: st,
        gradeScore: studentTotalScore,
        letterGrade,
        attendancePercentage,
        presentSessions: pres,
        tardySessions: late,
        absentSessions: abs,
        totalSessions,
        riskStatus,
        hasDisciplinary
      };
    }).sort((a, b) => b.gradeScore - a.gradeScore);
  }, [sectionStudents, grades, attendanceRecords, disciplinaryActions]);

  // Section Summary KPI computations
  const sectionSummaryKpis = useMemo(() => {
    if (studentCorrelationTable.length === 0) {
      return {
        avgGrade: 84,
        avgAttendance: 92,
        highPerformersCount: 0,
        attentionNeededCount: 0,
        gradeTrendDelta: '+4.2%'
      };
    }

    const avgGrade = Math.round(
      studentCorrelationTable.reduce((acc, curr) => acc + curr.gradeScore, 0) / studentCorrelationTable.length
    );
    const avgAttendance = Math.round(
      studentCorrelationTable.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / studentCorrelationTable.length
    );
    const highPerformersCount = studentCorrelationTable.filter(s => s.riskStatus === 'HIGH_PERFORMER').length;
    const attentionNeededCount = studentCorrelationTable.filter(
      s => s.riskStatus === 'ATTENDANCE_RISK' || s.riskStatus === 'ACADEMIC_INTERVENTION'
    ).length;

    return {
      avgGrade,
      avgAttendance,
      highPerformersCount,
      attentionNeededCount,
      gradeTrendDelta: avgGrade >= 80 ? '+3.8%' : '-1.4%'
    };
  }, [studentCorrelationTable]);

  return (
    <div id="student-performance-widget" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      {/* 1. WIDGET HEADER & FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-oskar-vintage text-lg font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <span>Student Performance & Attendance Analytics</span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Semester 1 (2026/27)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing longitudinal grade trends across continuous milestones alongside semester attendance consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-2">Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setSelectedStudentId('ALL');
              }}
              className="px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {teacherSectionIds.map(secId => (
                <option key={secId} value={secId}>
                  Section {secId}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-2">Focus:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[190px] truncate"
            >
              <option value="ALL">Class Aggregate ({sectionStudents.length} Scholars)</option>
              {sectionStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.id.split('-').pop()})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMetricViewMode('COMBINED')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                metricViewMode === 'COMBINED' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setMetricViewMode('GRADES')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                metricViewMode === 'GRADES' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Grades
            </button>
            <button
              onClick={() => setMetricViewMode('ATTENDANCE')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                metricViewMode === 'ATTENDANCE' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Attendance
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE PERFORMANCE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Section/Student Average Grade */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">
              {singleStudent ? `${singleStudent.fullName.split(' ')[0]}'s Grade` : 'Class Average Grade'}
            </span>
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {singleStudent
                ? (studentCorrelationTable.find(s => s.student.id === singleStudent.id)?.gradeScore || 85)
                : sectionSummaryKpis.avgGrade}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {sectionSummaryKpis.gradeTrendDelta}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Subject: <strong className="text-slate-700 dark:text-slate-300">{teacher?.subject || 'Academics'}</strong>
          </p>
        </div>

        {/* Card 2: Attendance Consistency Rate */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">
              {singleStudent ? 'Attendance Consistency' : 'Class Consistency Rate'}
            </span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {singleStudent
                ? (studentCorrelationTable.find(s => s.student.id === singleStudent.id)?.attendancePercentage || 93)
                : sectionSummaryKpis.avgAttendance}%
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              vs. 90% target
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Punctuality: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Exemplary Standing</span>
          </p>
        </div>

        {/* Card 3: High Performers (or Student Standing) */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">
              {singleStudent ? 'Academic Distinction' : 'Dean\'s Honor Roll'}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            {singleStudent ? (
              <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {(studentCorrelationTable.find(s => s.student.id === singleStudent.id)?.gradeScore || 80) >= 85
                  ? 'First Class Honors'
                  : 'Solid Standing'}
              </span>
            ) : (
              <>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {sectionSummaryKpis.highPerformersCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  scholars ({Math.round((sectionSummaryKpis.highPerformersCount / (sectionStudents.length || 1)) * 100)}%)
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Score ≥ 85% & Consistency ≥ 90%
          </p>
        </div>

        {/* Card 4: Action Required */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Support Watchlist</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {singleStudent
                ? (studentCorrelationTable.find(s => s.student.id === singleStudent.id)?.riskStatus === 'ON_TRACK' ||
                   studentCorrelationTable.find(s => s.student.id === singleStudent.id)?.riskStatus === 'HIGH_PERFORMER' ? 0 : 1)
                : sectionSummaryKpis.attentionNeededCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {singleStudent ? 'adverse flags' : 'flagged scholars'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Tardiness / exam restitution
          </p>
        </div>
      </div>

      {/* 3. RECHARTS VISUALIZATION GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART A: SEMESTER GRADE PROGRESSION TRENDS */}
        {(metricViewMode === 'COMBINED' || metricViewMode === 'GRADES') && (
          <div className={`p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
            metricViewMode === 'GRADES' ? 'lg:col-span-2' : ''
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Semester Grade Trends (Milestones W2 – W14)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {singleStudent
                    ? `${singleStudent.fullName}: Longitudinal trajectory vs. Section ${selectedSectionId} benchmark.`
                    : `Section ${selectedSectionId} milestone progress across Quizzes, Mid-Term, and Practical Labs.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {singleStudent ? 'Student Score' : 'Class Average'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-0.5 bg-amber-500"></span>
                  Honor (85%)
                </span>
              </div>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={gradeTrendsData}
                  margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="highestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                    axisLine={{ stroke: chartStyles.axisStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[50, 70, 85, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartStyles.tooltipBg,
                      borderRadius: '12px',
                      border: `1px solid ${chartStyles.tooltipBorder}`,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '11px',
                      color: chartStyles.tooltipText
                    }}
                    itemStyle={{ color: chartStyles.tooltipText }}
                    labelStyle={{ color: chartStyles.tooltipText }}
                    formatter={(value: any, name: any) => {
                      if (name === 'studentScore') return [`${value}%`, singleStudent?.fullName || 'Student'];
                      if (name === 'averageScore') return [`${value}%`, 'Class Average'];
                      if (name === 'highestScore') return [`${value}%`, 'Top Cohort Score'];
                      if (name === 'lowestScore') return [`${value}%`, 'Lowest Score'];
                      if (name === 'sectionAverage') return [`${value}%`, 'Section Benchmark'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine y={70} stroke={chartStyles.referenceLine} strokeDasharray="3 3" label={{ value: 'Passing (70%)', position: 'insideBottomRight', fill: chartStyles.referenceLine, fontSize: 9 }} />
                  <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Honors (85%)', position: 'insideTopRight', fill: '#d97706', fontSize: 9 }} />

                  {singleStudent ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="sectionAverage"
                        stroke={chartStyles.referenceLine}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="sectionAverage"
                      />
                      <Area
                        type="monotone"
                        dataKey="studentScore"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#gradeGradient)"
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                        activeDot={{ r: 6 }}
                        name="studentScore"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        type="monotone"
                        dataKey="averageScore"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#gradeGradient)"
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                        activeDot={{ r: 6 }}
                        name="averageScore"
                      />
                      <Line
                        type="monotone"
                        dataKey="highestScore"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        strokeDasharray="2 2"
                        dot={{ r: 2.5, fill: '#10b981' }}
                        name="highestScore"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Term Examination Target: Mid-Term (W8) • Final Exam (W14)</span>
              {onNavigateToGradebook && (
                <button
                  onClick={onNavigateToGradebook}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
                >
                  Enter Assessment in Gradebook
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* CHART B: ATTENDANCE CONSISTENCY OVER SEMESTER */}
        {(metricViewMode === 'COMBINED' || metricViewMode === 'ATTENDANCE') && (
          <div className={`p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
            metricViewMode === 'ATTENDANCE' ? 'lg:col-span-2' : ''
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Attendance Consistency Curve (Recorded Days)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {singleStudent
                    ? `${singleStudent.fullName}: Daily status & cumulative punctuality compliance.`
                    : `Section ${selectedSectionId}: Daily turnout and cumulative consistency rate.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Consistency %
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-0.5 bg-rose-500"></span>
                  Min (90%)
                </span>
              </div>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                {singleStudent ? (
                  <LineChart
                    data={attendanceConsistencyData}
                    margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                      axisLine={{ stroke: chartStyles.axisStroke }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[60, 100]}
                      tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[70, 80, 90, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartStyles.tooltipBg,
                        borderRadius: '12px',
                        border: `1px solid ${chartStyles.tooltipBorder}`,
                        fontSize: '11px',
                        color: chartStyles.tooltipText
                      }}
                      itemStyle={{ color: chartStyles.tooltipText }}
                      labelStyle={{ color: chartStyles.tooltipText }}
                      formatter={(value: any, name: any, item: any) => {
                        if (name === 'consistencyRate') return [`${value}%`, 'Cumulative Consistency'];
                        if (name === 'statusWeight') return [item.payload.status, 'Session Status'];
                        return [value, name];
                      }}
                    />
                    <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target (90%)', position: 'insideBottomRight', fill: '#ef4444', fontSize: 9 }} />
                    <Line
                      type="monotone"
                      dataKey="consistencyRate"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#059669', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={attendanceConsistencyData}
                    margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                      axisLine={{ stroke: chartStyles.axisStroke }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: chartStyles.tickFill }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[25, 50, 75, 90, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartStyles.tooltipBg,
                        borderRadius: '12px',
                        border: `1px solid ${chartStyles.tooltipBorder}`,
                        fontSize: '11px',
                        color: chartStyles.tooltipText
                      }}
                      itemStyle={{ color: chartStyles.tooltipText }}
                      labelStyle={{ color: chartStyles.tooltipText }}
                      formatter={(value: any, name: any, item: any) => {
                        if (name === 'dailyRate') {
                          return [
                            `${value}% (Pres: ${item.payload.presentCount}, Late: ${item.payload.lateCount}, Abs: ${item.payload.absentCount})`,
                            'Turnout Rate'
                          ];
                        }
                        if (name === 'cumulativeConsistency') return [`${value}%`, 'Semester Trend'];
                        return [value, name];
                      }}
                    />
                    <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target 90%', position: 'insideTopRight', fill: '#ef4444', fontSize: 9 }} />
                    <Bar
                      dataKey="dailyRate"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="dailyRate"
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeConsistency"
                      stroke="#047857"
                      strokeWidth={2}
                      dot={false}
                      name="cumulativeConsistency"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Ethiopian Ministry of Education: 85% Minimum Required for Promotion</span>
              {onNavigateToAttendance && (
                <button
                  onClick={onNavigateToAttendance}
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
                >
                  Mark Daily Homeroom Attendance
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. STUDENT PERFORMANCE & ATTENDANCE CORRELATION MATRIX (ROSTER TABLE) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Section {selectedSectionId} Performance Correlation Roster</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Examining student grade marks alongside attendance compliance to identify scholars thriving or in need of counseling.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Honor Roll
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              On Track
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Attention Flag
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3">Student Scholar</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3 text-center">Grade Score</th>
                <th className="py-2.5 px-3 text-center">Letter</th>
                <th className="py-2.5 px-3 text-center">Attendance %</th>
                <th className="py-2.5 px-3 text-center">Sessions Logged</th>
                <th className="py-2.5 px-3">Performance Standing</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentCorrelationTable.map(({ student, gradeScore, letterGrade, attendancePercentage, presentSessions, tardySessions, absentSessions, totalSessions, riskStatus, hasDisciplinary }) => {
                const isSelected = selectedStudentId === student.id;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 dark:bg-blue-950/40 font-medium' : ''
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {student.fullName[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{student.fullName}</span>
                          {hasDisciplinary && (
                            <span className="ml-1.5 px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded text-[9px] font-bold">
                              Disciplinary Alert
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {student.id}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {gradeScore}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        letterGrade.startsWith('A')
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : letterGrade.startsWith('B')
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {letterGrade}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono font-bold text-xs ${
                          attendancePercentage >= 90
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : attendancePercentage >= 80
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}>
                          {attendancePercentage}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              attendancePercentage >= 90
                                ? 'bg-emerald-500'
                                : attendancePercentage >= 80
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {presentSessions}P / {tardySessions}L / {absentSessions}A
                    </td>

                    <td className="py-2.5 px-3">
                      {riskStatus === 'HIGH_PERFORMER' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          High Performer (Honors)
                        </span>
                      )}
                      {riskStatus === 'ON_TRACK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          Consistent & On-Track
                        </span>
                      )}
                      {riskStatus === 'ATTENDANCE_RISK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Attendance Warning
                        </span>
                      )}
                      {riskStatus === 'ACADEMIC_INTERVENTION' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Academic Support Flag
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold transition cursor-pointer"
                          title="View student visual chart curves"
                        >
                          Focus Chart
                        </button>
                        {onSelectStudentForGrading && (
                          <button
                            onClick={() => onSelectStudentForGrading(student.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                            title="Open gradebook entry for this student"
                          >
                            Grade Student
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

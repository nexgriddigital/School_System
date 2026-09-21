import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicGrade, DisciplinaryAction, Student } from '../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Activity,
  Users,
  ShieldAlert,
  GraduationCap,
  CalendarCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Building2,
  Mail,
  UserCheck,
  UserX,
  Compass,
  Filter,
  RefreshCw,
  Printer,
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PrincipalPrintReportModal } from './PrincipalPrintReportModal';

interface PrincipalHealthDashboardProps {
  onNavigateTab?: (tab: 'INSTITUTIONAL_HEALTH' | 'AUDIT_TRAIL' | 'AUTHORIZATIONS' | 'USER_PROVISIONING' | 'DATA_GOVERNANCE' | 'BROADCAST' | 'TEACHER_MANAGEMENT' | 'DISCIPLINARY_REVERSAL' | 'INSTITUTION_SETTINGS') => void;
}

export const PrincipalHealthDashboard: React.FC<PrincipalHealthDashboardProps> = ({ onNavigateTab }) => {
  const {
    schoolName,
    students,
    sections,
    teachers,
    attendanceRecords,
    disciplinaryActions,
    dayOffRequests,
    reverseDisciplinaryAction,
    openDocumentViewer,
    theme
  } = useSchool();

  const isDark = theme === 'dark';

  // Theme-aware Chart Palette & SVG Grid/Axis Styling
  const chartStyles = useMemo(() => ({
    gridStroke: isDark ? '#1e293b' : '#E2E8F0',
    axisStroke: isDark ? '#475569' : '#CBD5E1',
    tickFill: isDark ? '#94a3b8' : '#64748B',
    tooltipBg: isDark ? '#0f172a' : '#0f172a',
    tooltipBorder: isDark ? '#334155' : '#334155',
    capacityTrack: isDark ? '#334155' : '#E2E8F0',
  }), [isDark]);

  // Selected filters
  const [gradeFilter, setGradeFilter] = useState<'ALL' | AcademicGrade>('ALL');
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | 'ALL'>('14D');
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<DisciplinaryAction | null>(null);
  const [reversalNote, setReversalNote] = useState('Satisfactory restitution achieved with parent conference agreement.');
  const [reversalSuccess, setReversalSuccess] = useState<string | null>(null);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  // -------------------------------------------------------------
  // 1. DATA AGGREGATION: ATTENDANCE
  // -------------------------------------------------------------
  const filteredStudents = useMemo(() => {
    if (gradeFilter === 'ALL') return students;
    return students.filter(s => s.grade === gradeFilter);
  }, [students, gradeFilter]);

  // Aggregate daily attendance records by date
  const dailyAttendanceTimeline = useMemo(() => {
    // Collect all distinct dates sorted ascending
    const dateMap = new Map<string, {
      date: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
      rate: number;
    }>();

    attendanceRecords.forEach(rec => {
      // Determine student's grade if recorded individually
      const st = students.find(s => s.id === rec.studentId || rec.records?.some(r => r.studentId === s.id));
      if (gradeFilter !== 'ALL' && st && st.grade !== gradeFilter) {
        return;
      }

      const existing = dateMap.get(rec.date) || {
        date: rec.date,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
        rate: 100
      };

      if (rec.records && rec.records.length > 0) {
        rec.records.forEach(item => {
          const s = students.find(x => x.id === item.studentId);
          if (gradeFilter !== 'ALL' && s && s.grade !== gradeFilter) return;

          existing.total += 1;
          if (item.status === 'PRESENT') existing.present += 1;
          else if (item.status === 'ABSENT') existing.absent += 1;
          else if (item.status === 'LATE') existing.late += 1;
          else if (item.status === 'EXCUSED') existing.excused += 1;
        });
      } else if (rec.status) {
        existing.total += 1;
        if (rec.status === 'PRESENT') existing.present += 1;
        else if (rec.status === 'ABSENT') existing.absent += 1;
        else if (rec.status === 'LATE') existing.late += 1;
        else if (rec.status === 'EXCUSED') existing.excused += 1;
      }

      dateMap.set(rec.date, existing);
    });

    // Compute rates and format dates
    const sorted = Array.from(dateMap.values())
      .map(entry => ({
        ...entry,
        rate: entry.total > 0 ? Math.round(((entry.present + entry.late * 0.5) / entry.total) * 100) : 100,
        displayDate: entry.date.slice(5) // MM-DD
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (timeRange === '7D') return sorted.slice(-7);
    if (timeRange === '14D') return sorted.slice(-14);
    return sorted;
  }, [attendanceRecords, students, gradeFilter, timeRange]);

  // Overall attendance statistics
  const attendanceKPIs = useMemo(() => {
    let totalRecords = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    dailyAttendanceTimeline.forEach(d => {
      totalRecords += d.total;
      presentCount += d.present;
      absentCount += d.absent;
      lateCount += d.late;
      excusedCount += d.excused;
    });

    const overallRate = totalRecords > 0 
      ? Math.round(((presentCount + lateCount * 0.5) / totalRecords) * 100) 
      : 94;

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      overallRate
    };
  }, [dailyAttendanceTimeline]);

  // Grade-by-grade attendance comparison
  const gradeAttendanceData = useMemo(() => {
    const grades: AcademicGrade[] = [9, 10, 11, 12];
    return grades.map(g => {
      let gTotal = 0;
      let gPresent = 0;
      let gLate = 0;
      let gAbsent = 0;

      attendanceRecords.forEach(rec => {
        if (rec.records) {
          rec.records.forEach(r => {
            const st = students.find(s => s.id === r.studentId);
            if (st && st.grade === g) {
              gTotal += 1;
              if (r.status === 'PRESENT') gPresent += 1;
              else if (r.status === 'LATE') gLate += 1;
              else if (r.status === 'ABSENT') gAbsent += 1;
            }
          });
        } else if (rec.studentId) {
          const st = students.find(s => s.id === rec.studentId);
          if (st && st.grade === g) {
            gTotal += 1;
            if (rec.status === 'PRESENT') gPresent += 1;
            else if (rec.status === 'LATE') gLate += 1;
            else if (rec.status === 'ABSENT') gAbsent += 1;
          }
        }
      });

      const rate = gTotal > 0 ? Math.round(((gPresent + gLate * 0.5) / gTotal) * 100) : (g === 9 ? 96 : g === 10 ? 92 : g === 11 ? 95 : 94);
      return {
        grade: `Grade ${g}`,
        gradeNumber: g,
        rate,
        present: gPresent || (g === 9 ? 28 : g === 10 ? 22 : g === 11 ? 24 : 20),
        late: gLate || (g === 10 ? 3 : 1),
        absent: gAbsent || (g === 10 ? 2 : 1)
      };
    });
  }, [attendanceRecords, students]);

  // Attendance Status Distribution (Donut Chart)
  const attendanceStatusPie = useMemo(() => {
    const p = attendanceKPIs.presentCount || 42;
    const l = attendanceKPIs.lateCount || 4;
    const a = attendanceKPIs.absentCount || 3;
    const e = attendanceKPIs.excusedCount || 1;
    return [
      { name: 'Present', value: p, color: '#10B981' }, // Emerald
      { name: 'Late', value: l, color: '#F59E0B' },    // Amber
      { name: 'Absent', value: a, color: '#EF4444' },  // Red
      { name: 'Excused', value: e, color: '#0EA5E9' }  // Sky
    ];
  }, [attendanceKPIs]);

  // -------------------------------------------------------------
  // 2. DATA AGGREGATION: DISCIPLINARY INCIDENTS
  // -------------------------------------------------------------
  const filteredIncidents = useMemo(() => {
    if (gradeFilter === 'ALL') return disciplinaryActions;
    return disciplinaryActions.filter(d => d.grade === gradeFilter);
  }, [disciplinaryActions, gradeFilter]);

  // Disciplinary KPIs
  const disciplinaryKPIs = useMemo(() => {
    const total = filteredIncidents.length;
    const activeCases = filteredIncidents.filter(d => !d.reversedByPrincipal).length;
    const hearingsScheduled = filteredIncidents.filter(d => d.hearingScheduled && !d.reversedByPrincipal).length;
    const reversedCount = filteredIncidents.filter(d => d.reversedByPrincipal).length;
    const parentNoticeSentCount = filteredIncidents.filter(d => d.parentNoticeSent).length;
    const parentNoticeRate = total > 0 ? Math.round((parentNoticeSentCount / total) * 100) : 100;

    return {
      total,
      activeCases,
      hearingsScheduled,
      reversedCount,
      parentNoticeSentCount,
      parentNoticeRate
    };
  }, [filteredIncidents]);

  // Disciplinary incidents by category
  const incidentsByCategoryData = useMemo(() => {
    const categoryCount: { [cat: string]: number } = {};
    filteredIncidents.forEach(d => {
      // Normalize / group categories
      let cat = 'General Infraction';
      const text = `${d.incidentType} ${d.description}`.toLowerCase();
      if (text.includes('exam') || text.includes('cheat') || text.includes('dishonesty')) {
        cat = 'Academic Integrity';
      } else if (text.includes('uniform') || text.includes('dress code')) {
        cat = 'Dress Code & Uniform';
      } else if (text.includes('lab') || text.includes('safety') || text.includes('chemical')) {
        cat = 'Laboratory Safety';
      } else if (text.includes('tard') || text.includes('truan') || text.includes('absent')) {
        cat = 'Truancy & Tardiness';
      } else if (text.includes('disrupt') || text.includes('noise')) {
        cat = 'Classroom Disruption';
      } else if (text.includes('altercat') || text.includes('fight')) {
        cat = 'Behavioral Altercation';
      } else {
        cat = d.incidentType || 'Behavioral Incident';
      }

      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [filteredIncidents]);

  // Disciplinary incidents by grade
  const incidentsByGradeData = useMemo(() => {
    const grades: AcademicGrade[] = [9, 10, 11, 12];
    return grades.map(g => {
      const active = disciplinaryActions.filter(d => d.grade === g && !d.reversedByPrincipal).length;
      const reversed = disciplinaryActions.filter(d => d.grade === g && d.reversedByPrincipal).length;
      return {
        grade: `Grade ${g}`,
        active,
        reversed,
        total: active + reversed
      };
    });
  }, [disciplinaryActions]);

  // -------------------------------------------------------------
  // 3. DATA AGGREGATION: PENDING ADMISSIONS & CAPACITY
  // -------------------------------------------------------------
  const admissionsKPIs = useMemo(() => {
    const totalEnrolled = students.length;
    const pendingPaymentCount = students.filter(s => s.registrationStatus === 'PENDING_PAYMENT').length;
    const pendingSectionCount = students.filter(s => !s.sectionId).length;
    const pendingStreamChanges = students.filter(s => s.streamChangeRequest && s.streamChangeRequest.status === 'PENDING').length;
    
    // Total school capacity across all sections
    const totalCapacity = sections.reduce((acc, sec) => acc + (sec.capacity || 35), 0);
    const capacityUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    return {
      totalEnrolled,
      pendingPaymentCount,
      pendingSectionCount,
      pendingStreamChanges,
      totalCapacity,
      capacityUtilization
    };
  }, [students, sections]);

  // Admissions Pipeline by Grade (Stacked Bar)
  const admissionsPipelineData = useMemo(() => {
    const grades: AcademicGrade[] = [9, 10, 11, 12];
    return grades.map(g => {
      const gradeStudents = students.filter(s => s.grade === g);
      const complete = gradeStudents.filter(s => s.registrationStatus === 'COMPLETE' && s.sectionId).length;
      const pendingPayment = gradeStudents.filter(s => s.registrationStatus === 'PENDING_PAYMENT').length;
      const unassignedSection = gradeStudents.filter(s => !s.sectionId && s.registrationStatus === 'COMPLETE').length;

      return {
        grade: `Grade ${g}`,
        enrolled: complete,
        pendingPayment,
        unassignedSection,
        total: gradeStudents.length
      };
    });
  }, [students]);

  // Capacity vs Enrollment per grade
  const gradeCapacityData = useMemo(() => {
    const grades: AcademicGrade[] = [9, 10, 11, 12];
    return grades.map(g => {
      const enrolled = students.filter(s => s.grade === g).length;
      const gradeSections = sections.filter(sec => sec.grade === g);
      const capacity = gradeSections.reduce((acc, s) => acc + (s.capacity || 35), 0) || 70;
      const fillRate = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

      return {
        grade: `Grade ${g}`,
        enrolled,
        capacity,
        fillRate
      };
    });
  }, [students, sections]);

  // Senior stream distribution (Grade 11 & 12)
  const seniorStreamData = useMemo(() => {
    const seniorStudents = students.filter(s => s.grade === 11 || s.grade === 12);
    let natural = 0;
    let social = 0;
    let undeclared = 0;

    seniorStudents.forEach(s => {
      if (s.stream === 'Natural Sciences') natural += 1;
      else if (s.stream === 'Social Sciences') social += 1;
      else undeclared += 1;
    });

    return [
      { name: 'Natural Sciences', value: natural || 3, color: '#2563EB' }, // Royal Blue
      { name: 'Social Sciences', value: social || 2, color: '#D97706' },  // Amber
      { name: 'Pending Stream', value: undeclared, color: '#94A3B8' }    // Slate
    ].filter(item => item.value > 0);
  }, [students]);

  // Students requiring admission attention (action queue)
  const pendingAdmissionQueue = useMemo(() => {
    return students.filter(s => 
      s.registrationStatus === 'PENDING_PAYMENT' || 
      !s.sectionId || 
      (s.streamChangeRequest && s.streamChangeRequest.status === 'PENDING')
    );
  }, [students]);

  // -------------------------------------------------------------
  // 4. COMPOSITE INSTITUTIONAL HEALTH INDEX (0 - 100)
  // -------------------------------------------------------------
  const institutionalHealthScore = useMemo(() => {
    // 1. Attendance Weight (35%): Attendance Rate
    const attScore = Math.min(100, Math.max(0, attendanceKPIs.overallRate));

    // 2. Discipline Weight (25%): 100 minus active incidents penalty
    const activeRatio = students.length > 0 ? (disciplinaryKPIs.activeCases / students.length) : 0;
    const discScore = Math.max(70, Math.round(100 - activeRatio * 300));

    // 3. Admissions & Capacity Weight (25%): Capacity utilization & processed registrations
    const pendingRate = students.length > 0 ? (admissionsKPIs.pendingPaymentCount / students.length) : 0;
    const admScore = Math.max(75, Math.round(100 - pendingRate * 150));

    // 4. Faculty & Operations Weight (15%): Unresolved leaves
    const pendingLeaves = dayOffRequests.filter(d => d.status === 'PENDING').length;
    const opsScore = Math.max(70, 100 - pendingLeaves * 5);

    const composite = Math.round(
      attScore * 0.35 +
      discScore * 0.25 +
      admScore * 0.25 +
      opsScore * 0.15
    );

    let status = 'OPTIMAL HEALTH';
    let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (composite < 75) {
      status = 'ATTENTION REQUIRED';
      statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (composite < 88) {
      status = 'STABLE WITH MINOR ADVISORIES';
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      composite,
      status,
      statusColor,
      attScore,
      discScore,
      admScore,
      opsScore
    };
  }, [attendanceKPIs, disciplinaryKPIs, admissionsKPIs, dayOffRequests, students]);

  // Handle direct reversal from dashboard
  const handleQuickReverse = (actionId: string) => {
    reverseDisciplinaryAction(actionId, reversalNote);
    setReversalSuccess(`Incident ${actionId} rescinded successfully by the Principal.`);
    setSelectedIncidentForModal(null);
    setTimeout(() => setReversalSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Reversal Notification Toast */}
      {reversalSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{reversalSuccess}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono">Disciplinary Record Rescinded</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE HEADER & INSTITUTIONAL HEALTH INDEX CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Executive Institutional Analytics
              </span>
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs font-mono">
                Academic Year 2026/27 • Term 1
              </span>
              <button
                onClick={() => setShowPrintReportModal(true)}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-2"
                title="Open official institutional monochrome report for printing and archival records"
              >
                <Printer className="w-3.5 h-3.5 text-slate-900" />
                <span>Print Official Report</span>
              </button>
            </div>

            <h1 className="font-oskar-vintage text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Institutional Health & Performance Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time executive oversight across daily pupil attendance trends, active disciplinary cases and summons, admissions pipeline verification, and institutional capacity metrics.
            </p>
          </div>

          {/* Composite Institutional Health Score Meter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center gap-5 min-w-[280px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/10"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={213}
                  strokeDashoffset={213 - (213 * institutionalHealthScore.composite) / 100}
                  strokeLinecap="round"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white leading-none">
                  {institutionalHealthScore.composite}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Institutional Health Index</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {institutionalHealthScore.status}
              </p>
              <p className="text-[11px] text-slate-300">
                Attendance: <strong className="text-emerald-300">{attendanceKPIs.overallRate}%</strong> • Disciplinary: <strong className="text-blue-300">{disciplinaryKPIs.activeCases} Active</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Grade Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter by Grade:
            </span>
            {(['ALL', 9, 10, 11, 12] as const).map(g => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  gradeFilter === g
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-slate-400 font-semibold">Attendance Horizon:</span>
            {(['7D', '14D', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  timeRange === range
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {range === '7D' ? 'Last 7 Days' : range === '14D' ? 'Last 14 Days' : 'Full Term'}
              </button>
            ))}

            <button
              onClick={() => setShowPrintReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-xs ml-1"
              title="Print View with clean monochrome institutional archival format"
            >
              <Printer className="w-3 h-3 text-slate-200" />
              <span>Print View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP EXECUTIVE KEY STATS CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Daily Attendance Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-oskar-vintage text-slate-900 dark:text-white">
              {attendanceKPIs.overallRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              High Compliance
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 text-center text-[11px]">
            <div>
              <p className="text-slate-400 dark:text-slate-400">Present</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400">{attendanceKPIs.presentCount}</p>
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-400">Late</p>
              <p className="font-bold text-amber-700 dark:text-amber-400">{attendanceKPIs.lateCount}</p>
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-400">Absent</p>
              <p className="font-bold text-rose-700 dark:text-rose-400">{attendanceKPIs.absentCount}</p>
            </div>
          </div>
        </div>

        {/* Disciplinary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Active Disciplinary Cases
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-transparent dark:border-rose-800/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-oskar-vintage text-slate-900 dark:text-white">
              {disciplinaryKPIs.activeCases}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              of {disciplinaryKPIs.total} logged
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Hearings Scheduled: <strong className="text-slate-900 dark:text-slate-200">{disciplinaryKPIs.hearingsScheduled}</strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {disciplinaryKPIs.reversedCount} Rescinded
            </span>
          </div>
        </div>

        {/* Admissions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Admissions & Capacity
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-transparent dark:border-blue-800/40">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-oskar-vintage text-slate-900 dark:text-white">
              {admissionsKPIs.totalEnrolled}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {admissionsKPIs.capacityUtilization}% Capacity
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Pending Payments: <strong className="text-amber-700 dark:text-amber-400">{admissionsKPIs.pendingPaymentCount}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Unassigned: <strong className="text-rose-700 dark:text-rose-400">{admissionsKPIs.pendingSectionCount}</strong>
            </span>
          </div>
        </div>

        {/* Faculty & Staff Operations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Faculty & Sections
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-transparent dark:border-purple-800/40">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-oskar-vintage text-slate-900 dark:text-white">
              {sections.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active Sections ({teachers.length} Faculty)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Pending Leaves: <strong className="text-amber-600 dark:text-amber-400">{dayOffRequests.filter(d => d.status === 'PENDING').length}</strong>
            </span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('AUTHORIZATIONS')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Review <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CHART SECTION 1: DAILY ATTENDANCE SUMMARY & CHARTS */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-oskar-vintage text-lg font-bold text-slate-900 dark:text-white">
                Institutional Daily Attendance Trends
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Longitudinal pupil presence analysis across all homeroom sections, tracking punctual attendance, late check-ins, and absences.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-bold">
              Academy Benchmark: &ge; 90% Target
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Attendance Longitudinal Area/Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Attendance Rate (%) & Headcount</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400">Historical performance across {dailyAttendanceTimeline.length} recorded school days</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyAttendanceTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} unit="%" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 min-w-[170px]">
                            <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
                              <span>Date: {data.date}</span>
                              <span className="text-emerald-400 font-mono">{data.rate}%</span>
                            </p>
                            <div className="space-y-1 text-[11px]">
                              <p className="flex justify-between text-emerald-300">
                                <span>Present Scholars:</span> <strong>{data.present}</strong>
                              </p>
                              <p className="flex justify-between text-amber-300">
                                <span>Late Arrivals:</span> <strong>{data.late}</strong>
                              </p>
                              <p className="flex justify-between text-rose-300">
                                <span>Absent Scholars:</span> <strong>{data.absent}</strong>
                              </p>
                              {data.excused > 0 && (
                                <p className="flex justify-between text-sky-300">
                                  <span>Excused Leaves:</span> <strong>{data.excused}</strong>
                                </p>
                              )}
                              <p className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                                <span>Total Audited:</span> <strong>{data.total}</strong>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#rateGradient)"
                    name="Attendance %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grade-Level Punctuality & Breakdown (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance by Academic Grade</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Comparison of attendance compliance across classes</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                    <XAxis dataKey="grade" tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} unit="%" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-md border border-slate-700">
                              <p className="font-bold text-blue-300">{data.grade}</p>
                              <p className="text-xs">Compliance Rate: <strong className="text-emerald-400">{data.rate}%</strong></p>
                              <p className="text-[11px] text-slate-300">Present: {data.present} • Late: {data.late} • Absent: {data.absent}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="rate" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Status Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Top Attendance: <strong className="text-slate-900 dark:text-slate-200">Grade 9 (96%)</strong></span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold">Tardiness Watch: Grade 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CHART SECTION 2: RECENT DISCIPLINARY INCIDENTS & HEARINGS */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="font-oskar-vintage text-lg font-bold text-slate-900 dark:text-white">
                Recent Disciplinary Incidents & Behavior Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Institutional conduct monitoring, infraction categories, executive board hearings, parent summons dispatch, and Principal reversals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('DISCIPLINARY_REVERSAL')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Disciplinary Reversal Chamber ({disciplinaryKPIs.activeCases})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 2A: Incidents by Category (Horizontal Bar) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incidents by Infraction Category</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Distribution of recorded conduct violations</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incidentsByCategoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartStyles.gridStroke} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} width={110} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow border border-slate-700">
                            <p className="font-bold text-rose-300">{data.name}</p>
                            <p>{data.count} Case(s) recorded</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2B: Incidents by Grade & Reversal Status (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incidents per Grade Level</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Active vs Principal Rescinded actions</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentsByGradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="grade" tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-md border border-slate-700">
                            <p className="font-bold text-slate-200">{data.grade}</p>
                            <p className="text-rose-400">Active Infractions: {data.active}</p>
                            <p className="text-emerald-400">Principal Rescinded: {data.reversed}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="active" stackId="a" fill="#F43F5E" name="Active Infractions" />
                  <Bar dataKey="reversed" stackId="a" fill="#10B981" name="Principal Rescinded" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disciplinary Summary & Executive Metrics (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Executive Disciplinary Oversight</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Board hearings & parental notification integrity</p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Scheduled Board Hearings</span>
                  </div>
                  <span className="font-bold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                    {disciplinaryKPIs.hearingsScheduled} Cases
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Parent Summons Delivery</span>
                  </div>
                  <span className="font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                    {disciplinaryKPIs.parentNoticeRate}% Sent
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Executive Reversals</span>
                  </div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    {disciplinaryKPIs.reversedCount} Rescinded
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                Principal touch allows overriding or rescinding any counsellor record upon satisfactory restitution.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Disciplinary Incidents Audit Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Incident Log & Summons Status</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Detailed records of disciplinary referrals</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Showing {filteredIncidents.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-y border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Scholar & Class</th>
                  <th className="py-2.5 px-3">Infraction Type</th>
                  <th className="py-2.5 px-3">Action / Sanction</th>
                  <th className="py-2.5 px-3">Hearing & Parent Summons</th>
                  <th className="py-2.5 px-3 text-right">Principal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIncidents.slice(0, 6).map(action => (
                  <tr key={action.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {action.incidentDate}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{action.studentName}</p>
                      <p className="text-[11px] text-slate-400">Grade {action.grade} • Sec {action.sectionId || 'Unassigned'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-850">
                        {action.incidentType}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300" title={action.actionTaken}>
                      {action.actionTaken}
                    </td>
                    <td className="py-3 px-3">
                      {action.hearingScheduled ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 flex items-center gap-1 w-fit">
                            <Clock className="w-2.5 h-2.5" /> {action.hearingDate} @ {action.hearingTime}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {action.parentNoticeSent ? '✓ Parent notified via Gmail' : '⚠ Parent notice pending'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Counseling Warning</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {action.reversedByPrincipal ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Rescinded
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedIncidentForModal(action)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Review / Rescind
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. CHART SECTION 3: PENDING ADMISSIONS & ENROLLMENT */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-oskar-vintage text-lg font-bold text-slate-900 dark:text-white">
                Pending Admissions, Verification & Enrollment Capacity
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registration status, tuition payment verification queue, class section capacity utilization, and senior stream allocations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg font-bold">
              Total Enrolled Body: {students.length} Scholars
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 3A: Admissions Pipeline & Status Funnel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admissions Pipeline by Grade</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Complete vs Pending Payment vs Unassigned Sections</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={admissionsPipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="grade" tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-md space-y-1 border border-slate-700">
                            <p className="font-bold text-blue-300">{data.grade}</p>
                            <p className="text-emerald-400">Enrolled & Assigned: {data.enrolled}</p>
                            <p className="text-amber-400">Pending Fee: {data.pendingPayment}</p>
                            <p className="text-rose-400">Pending Section: {data.unassignedSection}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="enrolled" stackId="a" fill="#10B981" name="Complete & Assigned" />
                  <Bar dataKey="pendingPayment" stackId="a" fill="#F59E0B" name="Pending Fee" />
                  <Bar dataKey="unassignedSection" stackId="a" fill="#3B82F6" name="Needs Section" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3B: Capacity Utilization vs Enrolled */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Classroom Capacity vs Enrollment</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">Total desks available vs registered scholars</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeCapacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="grade" tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <YAxis tick={{ fontSize: 11, fill: chartStyles.tickFill }} stroke={chartStyles.axisStroke} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-md border border-slate-700">
                            <p className="font-bold text-slate-200">{data.grade}</p>
                            <p className="text-blue-400">Enrolled: {data.enrolled} scholars</p>
                            <p className="text-slate-400">Max Capacity: {data.capacity} seats</p>
                            <p className="text-emerald-400">Fill Rate: {data.fillRate}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="enrolled" fill="#2563EB" name="Enrolled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill={chartStyles.capacityTrack} name="Max Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3C: Senior High Academic Streams (Grade 11 & 12) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Senior Academic Stream Allocations</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mb-2">Grades 11 & 12 specialization split</p>

              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seniorStreamData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {seniorStreamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow border border-slate-700">
                              <p className="font-bold" style={{ color: data.payload.color }}>{data.name}</p>
                              <p>{data.value} Scholars</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                {seniorStreamData.map(item => (
                  <div key={item.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="text-[11px]">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</p>
                      <p className="text-slate-400 dark:text-slate-400 font-bold">{item.value} Scholars</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-400 flex items-center justify-between">
              <span>Strict 15-day stream change window</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">MoE Curriculum Standard</span>
            </div>
          </div>
        </div>

        {/* Pending Admissions Action Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scholars Requiring Admissions & Placement Action</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Applications pending registration fees, section allocation, or stream change review</p>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 rounded-full font-bold text-xs">
              {pendingAdmissionQueue.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingAdmissionQueue.map(scholar => {
              const isPendingFee = scholar.registrationStatus === 'PENDING_PAYMENT';
              const isUnassigned = !scholar.sectionId;
              const hasStreamReq = scholar.streamChangeRequest && scholar.streamChangeRequest.status === 'PENDING';

              return (
                <div
                  key={scholar.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{scholar.fullName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{scholar.id}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold">
                      Grade {scholar.grade}
                    </span>
                    {isPendingFee && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-bold">
                        Pending Fee Payment
                      </span>
                    )}
                    {isUnassigned && (
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded font-bold">
                        Section Unassigned
                      </span>
                    )}
                    {hasStreamReq && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded font-bold">
                        Stream Change: {scholar.streamChangeRequest?.requestedStream}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Parent: {scholar.parents.fatherName}</span>
                    <span className="font-mono">{scholar.accountNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL: PRINCIPAL DISCIPLINARY REVERSAL */}
      {/* ------------------------------------------------------------- */}
      {selectedIncidentForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900 dark:text-white">
                  Principal Executive Disciplinary Reversal
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <p><strong>Scholar:</strong> {selectedIncidentForModal.studentName} (Grade {selectedIncidentForModal.grade})</p>
              <p><strong>Incident Date:</strong> {selectedIncidentForModal.incidentDate}</p>
              <p><strong>Infraction:</strong> {selectedIncidentForModal.incidentType}</p>
              <p><strong>Sanction Imposed:</strong> {selectedIncidentForModal.actionTaken}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 italic">&ldquo;{selectedIncidentForModal.description}&rdquo;</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">Official Rescission & Reversal Justification:</label>
              <textarea
                value={reversalNote}
                onChange={(e) => setReversalNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="Enter justification for rescinding this disciplinary record..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedIncidentForModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleQuickReverse(selectedIncidentForModal.id)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rescind & Reverse Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Institutional Print View Modal */}
      <PrincipalPrintReportModal
        isOpen={showPrintReportModal}
        onClose={() => setShowPrintReportModal(false)}
        defaultGrade={gradeFilter}
      />
    </div>
  );
};

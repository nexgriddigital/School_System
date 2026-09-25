import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, GradeEntry } from '../../types';
import { 
  Fingerprint, 
  Scan, 
  CreditCard, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserX, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Volume2, 
  VolumeX, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Wifi, 
  ChevronRight,
  ExternalLink,
  Users,
  Search,
  Filter,
  Check,
  Zap,
  ArrowRight,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BiometricAttendanceProps {
  onNavigateToGradebook?: () => void;
  onNavigateToHomeroomAttendance?: () => void;
  onOpenPrintDossier?: (sectionId?: string) => void;
}

type BiometricMethod = 'FINGERPRINT' | 'FACE_ID' | 'RFID_CARD';

interface BiometricLog {
  id: string;
  studentId: string;
  studentName: string;
  method: BiometricMethod;
  timestamp: string;
  timeStr: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  confidence: number;
  temperature?: string;
  minutesLate?: number;
  syncedToGradebook: boolean;
}

export const BiometricAttendance: React.FC<BiometricAttendanceProps> = ({
  onNavigateToGradebook,
  onNavigateToHomeroomAttendance,
  onOpenPrintDossier
}) => {
  const { 
    currentTeacher, 
    teachers, 
    activeTeacherId, 
    sections, 
    students, 
    attendanceRecords, 
    markAttendance, 
    grades, 
    saveGrade, 
    schoolName,
    logAuditAction 
  } = useSchool();

  const teacher = currentTeacher || teachers?.find(t => t.id === activeTeacherId) || teachers?.[0];

  // Available sections for this teacher
  const teacherSections = useMemo(() => {
    if (Array.isArray(teacher?.assignedSections) && teacher.assignedSections.length > 0) {
      return teacher.assignedSections;
    }
    if (teacher?.assignedSectionId) {
      return [teacher.assignedSectionId];
    }
    return sections.length > 0 ? [sections[0].id] : ['9A'];
  }, [teacher, sections]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(teacherSections[0] || '9A');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeMethod, setActiveMethod] = useState<BiometricMethod>('FINGERPRINT');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Simulation controls
  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [currentScanningStudent, setCurrentScanningStudent] = useState<Student | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Biometric Logs state: studentId -> BiometricLog
  const [biometricLogs, setBiometricLogs] = useState<Record<string, BiometricLog>>({});
  const [isSyncingWithGradebook, setIsSyncingWithGradebook] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'UNSCANNED'>('ALL');

  // Filter students in the selected section
  const sectionStudents = useMemo(() => {
    return students.filter(s => s.sectionId === selectedSectionId);
  }, [students, selectedSectionId]);

  // Audio synthesize sound helper
  const playTerminalSound = (type: 'success' | 'warning' | 'beep') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else {
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Ignore audio failure
    }
  };

  // Pre-fill or sync with existing attendanceRecords for this date and section
  useEffect(() => {
    const existingRec = attendanceRecords.find(r => r.sectionId === selectedSectionId && r.date === attendanceDate);
    const initialMap: Record<string, BiometricLog> = {};

    sectionStudents.forEach(st => {
      // Check if student has attendance recorded
      let existingStatus: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' = 'PRESENT';
      let hasRecord = false;

      if (existingRec?.records) {
        const item = existingRec.records.find(r => r.studentId === st.id);
        if (item) {
          existingStatus = item.status;
          hasRecord = true;
        }
      } else if (existingRec?.studentId === st.id && existingRec.status) {
        existingStatus = existingRec.status;
        hasRecord = true;
      }

      if (hasRecord) {
        initialMap[st.id] = {
          id: `BIO-${st.id}-${attendanceDate}`,
          studentId: st.id,
          studentName: st.fullName,
          method: 'FINGERPRINT',
          timestamp: new Date().toISOString(),
          timeStr: existingStatus === 'LATE' ? '08:24 AM' : '08:06 AM',
          status: existingStatus,
          confidence: 98.4 + Math.round(Math.random() * 14) / 10,
          temperature: '36.5°C',
          minutesLate: existingStatus === 'LATE' ? 14 : 0,
          syncedToGradebook: true,
        };
      }
    });

    setBiometricLogs(initialMap);
  }, [selectedSectionId, attendanceDate, sectionStudents]);

  // Execute biometric check-in for a single student
  const performBiometricCheckIn = (st: Student, method: BiometricMethod = activeMethod, isManual = false) => {
    // Generate realistic randomized arrival time (mostly on-time, occasional late)
    const isLate = Math.random() < 0.18;
    const randomMinute = isLate ? 16 + Math.floor(Math.random() * 15) : 1 + Math.floor(Math.random() * 12);
    const minuteStr = randomMinute < 10 ? `0${randomMinute}` : `${randomMinute}`;
    const timeStr = `08:${minuteStr} AM`;
    const status: 'PRESENT' | 'LATE' = isLate ? 'LATE' : 'PRESENT';
    const confidence = +(97.5 + Math.random() * 2.3).toFixed(1);

    const newLog: BiometricLog = {
      id: `BIO-${st.id}-${Date.now()}`,
      studentId: st.id,
      studentName: st.fullName,
      method,
      timestamp: new Date().toISOString(),
      timeStr,
      status,
      confidence,
      temperature: '36.4°C',
      minutesLate: isLate ? randomMinute - 15 : 0,
      syncedToGradebook: false,
    };

    setBiometricLogs(prev => ({
      ...prev,
      [st.id]: newLog
    }));

    // Update real attendance in context
    markAttendance(st.id, attendanceDate, status, selectedSectionId);

    // Audio chirp
    playTerminalSound(isLate ? 'warning' : 'success');
  };

  // Real-Time Walk-In Stream Simulator
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isSimulatingStream) {
      // Find unscanned students in this section
      const unscanned = sectionStudents.filter(s => !biometricLogs[s.id]);

      if (unscanned.length === 0) {
        setIsSimulatingStream(false);
        setCurrentScanningStudent(null);
        setScanProgress(0);
        return;
      }

      const nextStudent = unscanned[0];
      setCurrentScanningStudent(nextStudent);
      setScanProgress(15);

      const delay = Math.max(400, Math.floor(1800 / simSpeed));

      // Simulate optical scan progress animation
      const p1 = setTimeout(() => setScanProgress(55), delay * 0.3);
      const p2 = setTimeout(() => setScanProgress(90), delay * 0.6);

      timer = setTimeout(() => {
        setScanProgress(100);
        performBiometricCheckIn(nextStudent, activeMethod);
        setTimeout(() => {
          setScanProgress(0);
        }, 150);
      }, delay);

      return () => {
        clearTimeout(timer);
        clearTimeout(p1);
        clearTimeout(p2);
      };
    } else {
      setCurrentScanningStudent(null);
      setScanProgress(0);
    }
  }, [isSimulatingStream, biometricLogs, sectionStudents, simSpeed, activeMethod]);

  // One-click batch check-in
  const handleBatchVerifyAll = (scenario: 'PUNCTUAL' | 'MIXED' | 'PERFECT') => {
    const updated: Record<string, BiometricLog> = {};

    sectionStudents.forEach((st, idx) => {
      let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT';
      let minute = 2 + (idx % 12);
      let minutesLate = 0;

      if (scenario === 'MIXED') {
        if (idx === 2 || idx === 6) {
          status = 'LATE';
          minute = 22 + (idx * 2);
          minutesLate = minute - 15;
        } else if (idx === 5) {
          status = 'ABSENT';
        }
      }

      const timeStr = `08:${minute < 10 ? '0' + minute : minute} AM`;

      if (status !== 'ABSENT') {
        updated[st.id] = {
          id: `BIO-${st.id}-${Date.now()}`,
          studentId: st.id,
          studentName: st.fullName,
          method: activeMethod,
          timestamp: new Date().toISOString(),
          timeStr,
          status,
          confidence: +(98.0 + Math.random() * 1.8).toFixed(1),
          temperature: '36.5°C',
          minutesLate,
          syncedToGradebook: false,
        };
        markAttendance(st.id, attendanceDate, status, selectedSectionId);
      } else {
        markAttendance(st.id, attendanceDate, 'ABSENT', selectedSectionId);
      }
    });

    setBiometricLogs(updated);
    playTerminalSound('success');
  };

  // Reset check-in records for current section & date
  const handleResetCheckIn = () => {
    setIsSimulatingStream(false);
    setBiometricLogs({});
    playTerminalSound('beep');
  };

  // -------------------------------------------------------------
  // DEEP SYNC WITH EXISTING GRADEBOOK DATA
  // -------------------------------------------------------------
  // Punctuality & attendance consistency directly calculate into
  // the continuous assessment & participation component (out of 20 pts).
  // Perfect on-time attendance -> +2.0 to +3.0 pts on continuous assessment
  // Repeated tardiness/absence -> -2.0 to -4.0 pts adjustment
  // -------------------------------------------------------------
  const handleSyncToGradebook = () => {
    setIsSyncingWithGradebook(true);

    try {
      let syncedCount = 0;
      const updatedLogEntries: Record<string, BiometricLog> = { ...biometricLogs };

      sectionStudents.forEach(st => {
        const log = biometricLogs[st.id];
        const status = log?.status || 'ABSENT';

        // Find existing grade entry for this student and subject
        const currentGrade = grades.find(g => 
          g.studentId === st.id && 
          (g.subject === (teacher?.subject || 'Mathematics') || g.sectionId === selectedSectionId)
        );

        const currentQuiz = currentGrade?.quiz ?? currentGrade?.test1Score ?? 16;
        const currentAssessment = currentGrade?.assessment ?? 16;
        const currentMid = currentGrade?.midExam ?? currentGrade?.midtermScore ?? 25;
        const currentFinal = currentGrade?.finalExam ?? currentGrade?.finalScore ?? 35;

        // Calculate attendance participation adjustment
        let adjustedAssessment = currentAssessment;
        if (status === 'PRESENT') {
          adjustedAssessment = Math.min(20, currentAssessment + 1.5);
        } else if (status === 'LATE') {
          adjustedAssessment = Math.max(10, currentAssessment - 0.5);
        } else if (status === 'ABSENT') {
          adjustedAssessment = Math.max(8, currentAssessment - 2.0);
        }

        // Save adjusted continuous assessment gradebook record
        saveGrade({
          studentId: st.id,
          studentName: st.fullName,
          subject: teacher?.subject || 'Mathematics',
          grade: st.grade,
          sectionId: st.sectionId || selectedSectionId,
          quiz: currentQuiz,
          assessment: Math.round(adjustedAssessment),
          midExam: currentMid,
          finalExam: currentFinal,
          teacherId: teacher?.id || 'TCH-001',
          teacherName: teacher?.name || 'Faculty Member',
          term: 'Term 1',
        });

        if (log) {
          updatedLogEntries[st.id] = {
            ...log,
            syncedToGradebook: true,
          };
        }

        syncedCount++;
      });

      setBiometricLogs(updatedLogEntries);

      // Audit log entry
      logAuditAction({
        action: 'BIOMETRIC_ATTENDANCE_SYNCED',
        category: 'ACADEMIC_RECORDS',
        severity: 'INFO',
        performedBy: {
          name: teacher?.name || 'Classroom Teacher',
          role: 'TEACHER',
          email: teacher?.email
        },
        targetEntity: {
          type: 'SECTION',
          id: selectedSectionId,
          label: `Section ${selectedSectionId} Biometric Attendance & Gradebook Sync`
        },
        details: `Biometric attendance verified and synced to continuous assessment gradebook for ${syncedCount} students in Section ${selectedSectionId} (${teacher?.subject || 'Academics'}).`
      });

      setSyncSuccessMessage(`Successfully synced biometric attendance for ${syncedCount} students into the Academic Gradebook!`);
      playTerminalSound('success');
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSyncingWithGradebook(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = [
      ['Student ID', 'Student Name', 'Section', 'Date', 'Time In', 'Status', 'Biometric Modality', 'Match Confidence', 'Synced to Gradebook'],
      ...sectionStudents.map(st => {
        const log = biometricLogs[st.id];
        return [
          st.id,
          st.fullName,
          selectedSectionId,
          attendanceDate,
          log?.timeStr || 'N/A',
          log?.status || 'ABSENT',
          log?.method || 'N/A',
          log?.confidence ? `${log.confidence}%` : 'N/A',
          log?.syncedToGradebook ? 'YES' : 'NO'
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Biometric_Attendance_Section_${selectedSectionId}_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics calculation
  const totalStudentsCount = sectionStudents.length;
  const allLogs = Object.values(biometricLogs) as BiometricLog[];
  const verifiedCount = allLogs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length;
  const onTimeCount = allLogs.filter(l => l.status === 'PRESENT').length;
  const lateCount = allLogs.filter(l => l.status === 'LATE').length;
  const absentCount = Math.max(0, totalStudentsCount - verifiedCount);
  const attendanceRate = totalStudentsCount > 0 ? Math.round((verifiedCount / totalStudentsCount) * 100) : 0;

  // Filtered student list for display
  const displayedStudents = useMemo(() => {
    return sectionStudents.filter(st => {
      const log = biometricLogs[st.id];
      const status = log ? log.status : 'UNSCANNED';

      if (statusFilter === 'PRESENT' && status !== 'PRESENT') return false;
      if (statusFilter === 'LATE' && status !== 'LATE') return false;
      if (statusFilter === 'UNSCANNED' && status !== 'UNSCANNED') return false;

      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return st.fullName.toLowerCase().includes(q) || st.id.toLowerCase().includes(q);
    });
  }, [sectionStudents, biometricLogs, searchFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HARDWARE TERMINAL HEADER & CONTROL CONSOLE */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Decorative Grid & Radar Wave */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Terminal Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE • BIO-TERMINAL #CR-{selectedSectionId}</span>
              </div>
              <span className="text-slate-400 text-xs font-mono">
                Firmware: v4.2.8-AI-Biometrics
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-300 text-xs font-semibold">
                Classroom Sensor: Room 104 • {teacher?.subject || 'Academics'}
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Real-Time Biometric Attendance Terminal</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Live contactless check-in simulation syncing optical fingerprint, AI face recognition, and RFID student smart cards directly with daily attendance and continuous assessment gradebook scores.
            </p>
          </div>

          {/* Section & Date Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Classroom Section
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => {
                  setSelectedSectionId(e.target.value);
                  setIsSimulatingStream(false);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {teacherSections.map(secId => (
                  <option key={secId} value={secId}>
                    Section {secId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  setIsSimulatingStream(false);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Audio Chimes
              </label>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
                title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {onOpenPrintDossier && (
              <div className="flex flex-col justify-end">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Report Dossier
                </label>
                <button
                  type="button"
                  onClick={() => onOpenPrintDossier(selectedSectionId)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:border-slate-500"
                  title="Print formatted institutional monochrome attendance history"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>Print Dossier</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sensor Method Selector Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Sensor:
            </span>

            <button
              type="button"
              onClick={() => setActiveMethod('FINGERPRINT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                activeMethod === 'FINGERPRINT'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Optical Fingerprint (500 DPI)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('FACE_ID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                activeMethod === 'FACE_ID'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>AI Face ID (Vision Dual-Lens)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('RFID_CARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                activeMethod === 'RFID_CARD'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>NFC Smart Card Tap</span>
            </button>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Quick Preset:</span>
            <button
              type="button"
              onClick={() => handleBatchVerifyAll('PUNCTUAL')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              All Punctual
            </button>
            <button
              type="button"
              onClick={() => handleBatchVerifyAll('MIXED')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold transition cursor-pointer"
            >
              Realistic Mix (Late & Absent)
            </button>
            <button
              type="button"
              onClick={handleResetCheckIn}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              title="Clear all check-ins for this session"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE SIMULATION STAGE & INTERACTIVE SENSOR VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Animated Sensor Station Hardware Simulation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Biometric Sensor Viewport
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
              {isSimulatingStream ? 'STREAM ACTIVE' : 'AWAITING SCAN'}
            </span>
          </div>

          {/* Interactive Hardware Visualizer Box */}
          <div className="relative rounded-2xl bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[260px] border-2 border-slate-800 overflow-hidden shadow-inner">
            
            {/* Background laser grid lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Scanning line animation */}
            {(isSimulatingStream || scanProgress > 0) && (
              <motion.div
                animate={{ y: [-100, 100, -100] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute w-full h-1 blur-[1px] pointer-events-none z-20 ${
                  activeMethod === 'FACE_ID' ? 'bg-blue-400 shadow-[0_0_12px_#60a5fa]' :
                  activeMethod === 'RFID_CARD' ? 'bg-purple-400 shadow-[0_0_12px_#c084fc]' :
                  'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                }`}
              />
            )}

            {/* SENSOR ICON / GRAPHIC DEPENDING ON MODALITY */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              {activeMethod === 'FINGERPRINT' && (
                <div className="relative w-28 h-28 rounded-full border-2 border-emerald-500/40 bg-emerald-950/20 flex items-center justify-center">
                  <Fingerprint className={`w-16 h-16 transition-all duration-300 ${
                    scanProgress > 0 ? 'text-emerald-400 scale-105 filter drop-shadow-[0_0_8px_#10b981]' : 'text-emerald-600/70'
                  }`} />
                  {scanProgress > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none"
                    />
                  )}
                </div>
              )}

              {activeMethod === 'FACE_ID' && (
                <div className="relative w-32 h-28 rounded-xl border-2 border-blue-500/40 bg-blue-950/20 flex items-center justify-center">
                  <Scan className={`w-16 h-16 transition-all duration-300 ${
                    scanProgress > 0 ? 'text-blue-400 scale-105 filter drop-shadow-[0_0_8px_#3b82f6]' : 'text-blue-600/70'
                  }`} />
                  {/* Viewfinder crosshairs */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                </div>
              )}

              {activeMethod === 'RFID_CARD' && (
                <div className="relative w-32 h-24 rounded-xl border-2 border-purple-500/40 bg-purple-950/20 flex items-center justify-center">
                  <CreditCard className={`w-14 h-14 transition-all duration-300 ${
                    scanProgress > 0 ? 'text-purple-400 scale-105 filter drop-shadow-[0_0_8px_#a855f7]' : 'text-purple-600/70'
                  }`} />
                  {scanProgress > 0 && (
                    <div className="absolute -top-1 w-12 h-1 bg-purple-400 rounded-full animate-ping" />
                  )}
                </div>
              )}

              {/* Live Scanner Telemetry readout */}
              <div className="text-center font-mono">
                {currentScanningStudent ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white tracking-wide">
                      VERIFYING: {currentScanningStudent.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ID: {currentScanningStudent.id} • MATCH CONFIDENCE: {scanProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">
                      Place finger / Look into camera / Tap ID Card
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      Optical Sensor Calibrated • Ready
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar under hardware */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Stream Trigger Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatingStream(!isSimulatingStream)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                  isSimulatingStream
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/30'
                }`}
              >
                {isSimulatingStream ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Live Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Simulate Real-Time Walk-In</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSimSpeed(1)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    simSpeed === 1 ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
                  }`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setSimSpeed(2)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    simSpeed === 2 ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
                  }`}
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={() => setSimSpeed(5)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    simSpeed === 5 ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
                  }`}
                >
                  5x
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Arrivals after 08:15 AM are automatically flagged as <strong>LATE</strong> and logged with exact elapsed minutes.
            </p>
          </div>
        </div>

        {/* Center & Right: Statistics & Live Terminal Check-In Stream */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Enrolled
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalStudentsCount}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Section {selectedSectionId}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                On-Time (Present)
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {onTimeCount}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-500 block mt-0.5 font-semibold">
                Checked before 08:15 AM
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                Tardy / Late
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {lateCount}
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-500 block mt-0.5 font-semibold">
                Checked after 08:15 AM
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Unscanned (Absent)
              </span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {absentCount}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {attendanceRate}% Punctuality Rate
              </span>
            </div>
          </div>

          {/* Syncing with Gradebook Notification Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Automatic Gradebook Synchronization
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Classroom attendance and punctuality records directly factor into students' <strong>Continuous Assessment / Participation (20 pts)</strong> in <strong>{teacher?.subject || 'Academics'}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isSyncingWithGradebook || verifiedCount === 0}
                onClick={handleSyncToGradebook}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {isSyncingWithGradebook ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing Gradebook...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Sync Attendance to Gradebook</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Export CSV Biometric Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {syncSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
              {onNavigateToGradebook && (
                <button
                  type="button"
                  onClick={onNavigateToGradebook}
                  className="underline hover:text-emerald-900 dark:hover:text-emerald-100 font-bold ml-2 cursor-pointer flex items-center gap-1"
                >
                  <span>Open Assessment Gradebook</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Roster & Live Log Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            
            {/* Table Filter Toolbar */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter student name or ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  All ({sectionStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PRESENT')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'PRESENT'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Present ({onTimeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('LATE')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'LATE'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Late ({lateCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('UNSCANNED')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'UNSCANNED'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Unscanned ({absentCount})
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3.5">Student</th>
                    <th className="py-2.5 px-3">Check-In Status</th>
                    <th className="py-2.5 px-3">Biometrics</th>
                    <th className="py-2.5 px-3">Gradebook Link</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedStudents.map((st) => {
                    const log = biometricLogs[st.id];
                    const isCheckedIn = !!log;
                    const isScanning = currentScanningStudent?.id === st.id;

                    // Linked gradebook scores for this student
                    const stGrade = grades.find(g => 
                      g.studentId === st.id && 
                      (g.subject === (teacher?.subject || 'Mathematics') || g.sectionId === selectedSectionId)
                    );
                    const currentAssess = stGrade?.assessment ?? 16;
                    const totalGrade = stGrade?.totalGrade ?? 82;
                    const letterGrade = stGrade?.letterGrade ?? 'A';

                    return (
                      <tr 
                        key={st.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                          isScanning ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''
                        }`}
                      >
                        {/* Student Name & ID */}
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                              {st.fullName[0]}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {st.fullName}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {st.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          {log ? (
                            log.status === 'PRESENT' ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                {log.timeStr} (On-Time)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                {log.timeStr} (Late +{log.minutesLate}m)
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Awaiting Scan
                            </span>
                          )}
                        </td>

                        {/* Biometrics Method & Score */}
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {log ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              {log.method === 'FINGERPRINT' && <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />}
                              {log.method === 'FACE_ID' && <Scan className="w-3.5 h-3.5 text-blue-500" />}
                              {log.method === 'RFID_CARD' && <CreditCard className="w-3.5 h-3.5 text-purple-500" />}
                              <span>{log.confidence}% Match</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Pending</span>
                          )}
                        </td>

                        {/* Gradebook Participation Impact */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Assess: <strong className="font-bold">{currentAssess}/20</strong>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {totalGrade}% ({letterGrade})
                            </span>
                            {log?.syncedToGradebook && (
                              <span className="text-emerald-600 dark:text-emerald-400" title="Synced to Gradebook">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => performBiometricCheckIn(st, activeMethod, true)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                            title="Simulate manual biometric scan for this student"
                          >
                            {isCheckedIn ? 'Re-scan' : 'Scan Now'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

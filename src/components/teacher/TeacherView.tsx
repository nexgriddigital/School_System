import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  generateMedicalLeavePdf, 
  generateRecommendationPdf, 
  fileToDataUrl 
} from '../../utils/pdfGenerator';
import { 
  CheckSquare, 
  Award, 
  CalendarPlus, 
  HeartHandshake, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  Clock, 
  Users,
  FileText,
  Eye,
  Download,
  Sparkles,
  TrendingUp,
  Fingerprint,
  Printer,
  BarChart2
} from 'lucide-react';
import { TelegramInbox } from '../common/TelegramInbox';
import { StudentPerformanceWidget } from './StudentPerformanceWidget';
import { BiometricAttendance } from './BiometricAttendance';
import { TeacherAttendancePrintModal } from './TeacherAttendancePrintModal';
import { ClassSubjectPerformanceTrends } from './ClassSubjectPerformanceTrends';
// Types inferred from SchoolContext

export const TeacherView: React.FC = () => {
  const { 
    currentTeacher, 
    teachers,
    activeTeacherId,
    sections, 
    students, 
    attendanceRecords, 
    markAttendance, 
    grades, 
    schoolName,
    saveGrade, 
    dayOffRequests, 
    submitTeacherDayOff, 
    recommendations, 
    fulfillRecommendationLetter, 
    evaluations, 
    submitCounsellorEvaluation, 
    disciplinaryActions, 
    sendChatMessage,
    openDocumentViewer
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'STUDENT_PERFORMANCE' | 'SUBJECT_TRENDS' | 'BIOMETRIC_ATTENDANCE' | 'ATTENDANCE' | 'GRADEBOOK' | 'DAY_OFF' | 'RECOMMENDATIONS' | 'EVALUATIONS' | 'PARENT_CHAT'>('STUDENT_PERFORMANCE');

  const teacher = currentTeacher || teachers?.find(t => t.id === activeTeacherId) || teachers?.[0];
  const teacherSections: string[] = (Array.isArray(teacher?.assignedSections) && teacher.assignedSections.length > 0)
    ? teacher.assignedSections
    : (teacher?.assignedSectionId ? [teacher.assignedSectionId] : ['General Classes']);

  // Check if current teacher is a homeroom teacher
  const homeroomSection = sections.find(s => s.homeroomTeacherId === teacher?.id);
  const isHomeroom = !!homeroomSection;

  // Disciplinary notifications for this teacher's homeroom section
  const homeroomDisciplinaryAlerts = disciplinaryActions.filter(d => 
    homeroomSection && d.sectionId === homeroomSection.id && !d.reversedByPrincipal
  );

  // Homeroom students for attendance
  const homeroomStudents = students.filter(s => s.sectionId === homeroomSection?.id);

  // Attendance Date
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Printable Monochrome Attendance Dossier Modal State
  const [isAttendancePrintModalOpen, setIsAttendancePrintModalOpen] = useState(false);
  const [attendancePrintSectionId, setAttendancePrintSectionId] = useState<string>(
    homeroomSection?.id || teacherSections[0] || '9A'
  );

  // Gradebook State
  const [selectedGradeSectionId, setSelectedGradeSectionId] = useState<string>(
    homeroomSection?.id || sections[0]?.id || '9A'
  );
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<string>(
    students[0]?.id || ''
  );
  const [quizScore, setQuizScore] = useState<number>(18);
  const [assessmentScore, setAssessmentScore] = useState<number>(19);
  const [midExamScore, setMidExamScore] = useState<number>(27);
  const [finalExamScore, setFinalExamScore] = useState<number>(38);
  const [gradeSaveSuccess, setGradeSaveSuccess] = useState(false);

  // Day Off Request State
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDocName, setLeaveDocName] = useState<string | null>(null);
  const [leaveDocUrl, setLeaveDocUrl] = useState<string>('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Evaluation Form State
  const [evalStudentId, setEvalStudentId] = useState(students[0]?.id || '');
  const [conductRating, setConductRating] = useState<'Excellent' | 'Good' | 'Needs Improvement'>('Excellent');
  const [academicEffort, setAcademicEffort] = useState<'High' | 'Satisfactory' | 'Low'>('High');
  const [evalComments, setEvalComments] = useState('');

  // Parent Message State
  const [chatStudentId, setChatStudentId] = useState(students[0]?.id || '');

  // Recommendation letter fulfillment modal state
  const [fulfillingRecId, setFulfillingRecId] = useState<string | null>(null);
  const [recLetterDraft, setRecLetterDraft] = useState('');

  if (!teacher) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        No teacher profile loaded.
      </div>
    );
  }

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentForGrading);
    if (!st) return;

    saveGrade({
      studentId: st.id,
      studentName: st.fullName,
      subject: teacher.subject,
      grade: st.grade,
      sectionId: st.sectionId || '9A',
      quiz: Number(quizScore),
      assessment: Number(assessmentScore),
      midExam: Number(midExamScore),
      finalExam: Number(finalExamScore),
      teacherId: teacher.id,
      teacherName: teacher.name,
      term: 'Term 1',
    });

    setGradeSaveSuccess(true);
    setTimeout(() => setGradeSaveSuccess(false), 3500);
  };

  const handleDayOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;

    const finalDocUrl = leaveDocUrl || (leaveDocName ? generateMedicalLeavePdf({
      teacherName: teacher.name,
      teacherId: teacher.id,
      date: leaveDate,
      reason: leaveReason,
      clinicName: 'Black Lion Specialized Hospital / Clinic',
    }) : undefined);

    submitTeacherDayOff({
      teacherId: teacher.id,
      teacherName: teacher.name,
      date: leaveDate,
      reason: leaveReason,
      supportingDocName: leaveDocName || undefined,
      supportingDocUrl: finalDocUrl,
      affectedSections: teacherSections,
    });

    setLeaveSuccess(true);
    setLeaveReason('');
    setLeaveDocName(null);
    setLeaveDocUrl('');
    setTimeout(() => setLeaveSuccess(false), 5000);
  };

  const handleAttendanceToggle = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    markAttendance(studentId, attendanceDate, status, homeroomSection?.id || '9A');
  };

  const handleFulfillRec = (recId: string) => {
    const rec = recommendations.find(r => r.id === recId);
    const cleanSchoolPrefix = (schoolName || 'School').replace(/[^a-zA-Z0-9]/g, '_');
    const pdfFileName = `${cleanSchoolPrefix}_RecLetter_${recId}.pdf`;
    const draftText = recLetterDraft || `It is my distinct honor and privilege to provide this recommendation for ${rec?.studentName || 'this student'}. In my academic course, they demonstrated exemplary scholarly discipline, critical analytical thought, and dedicated peer teamwork.`;

    const generatedPdf = generateRecommendationPdf({
      studentName: rec?.studentName || 'Student',
      studentId: rec?.studentId || recId,
      grade: rec?.grade || 10,
      recipientName: rec?.recipientName || 'Admissions Committee',
      purpose: rec?.purpose || 'Academic Advancement',
      counsellorName: teacher.name,
      schoolName,
      letterContent: draftText,
      date: new Date().toISOString().split('T')[0],
    });

    fulfillRecommendationLetter(recId, draftText, pdfFileName, generatedPdf);
    setFulfillingRecId(null);
    setRecLetterDraft('');
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-oskar-vintage text-2xl font-bold shadow-md">
              {(teacher?.name || 'Faculty').split(' ').filter(Boolean).map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 tracking-wider">
                  {teacher?.name || 'Faculty Member'}
                </h1>
                {isHomeroom ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                    Homeroom: Section {homeroomSection?.id}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium text-xs">
                    Subject Faculty ({teacher?.subject || 'Academics'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Faculty ID: {teacher?.id} • Department: {teacher?.subject} • Sections: {teacherSections.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAttendancePrintSectionId(homeroomSection?.id || teacherSections[0] || '9A');
                setIsAttendancePrintModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-slate-900 hover:bg-black text-white shadow-sm cursor-pointer border border-slate-700 hover:border-slate-500"
              title="Export formatted printable classroom attendance history (Institutional Monochrome Report)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print Attendance Dossier</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/20 text-white font-bold uppercase tracking-wider">
                Monochrome
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STUDENT_PERFORMANCE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'STUDENT_PERFORMANCE'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Student Performance
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab('SUBJECT_TRENDS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'SUBJECT_TRENDS'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              Class Subject Trends
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-800 font-bold">
                Recharts
              </span>
            </button>

            <button
              onClick={() => setActiveTab('BIOMETRIC_ATTENDANCE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'BIOMETRIC_ATTENDANCE'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
              Biometric Attendance
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {isHomeroom && (
              <button
                onClick={() => setActiveTab('ATTENDANCE')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'ATTENDANCE' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Homeroom Attendance
              </button>
            )}

            <button
              onClick={() => setActiveTab('GRADEBOOK')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'GRADEBOOK' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Assessment Gradebook
            </button>

            <button
              onClick={() => setActiveTab('DAY_OFF')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'DAY_OFF' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Personal Day-Off Request
            </button>

            <button
              onClick={() => setActiveTab('RECOMMENDATIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'RECOMMENDATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Recommendation Requests
            </button>

            <button
              onClick={() => setActiveTab('PARENT_CHAT')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'PARENT_CHAT' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat with Parents & AI Bot
            </button>
          </div>
        </div>

        {/* AUTOMATED HOMEROOM DISCIPLINARY ALERTS (PER USER SPEC) */}
        {isHomeroom && homeroomDisciplinaryAlerts.length > 0 && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Automated Homeroom Alert: Disciplinary action recorded against your homeroom student!</span>
            </div>
            {homeroomDisciplinaryAlerts.map(d => (
              <p key={d.id} className="text-xs text-rose-800 bg-white/70 p-2 rounded border border-rose-200">
                <strong>{d.studentName}:</strong> {d.incidentType} — "{d.description}". Action Taken: {d.actionTaken} (Recorded by Counselor).
              </p>
            ))}
          </div>
        )}
      </div>

      {/* TAB 0: STUDENT PERFORMANCE WIDGET (RECHARTS GRADE TRENDS & ATTENDANCE CONSISTENCY) */}
      {activeTab === 'STUDENT_PERFORMANCE' && (
        <StudentPerformanceWidget
          defaultSectionId={teacherSections[0]}
          onSelectStudentForGrading={(stId) => {
            setSelectedStudentForGrading(stId);
            setActiveTab('GRADEBOOK');
          }}
          onNavigateToGradebook={() => setActiveTab('GRADEBOOK')}
          onNavigateToAttendance={() => isHomeroom ? setActiveTab('ATTENDANCE') : undefined}
          onNavigateToSubjectTrends={() => setActiveTab('SUBJECT_TRENDS')}
          onOpenPrintDossier={(secId) => {
            setAttendancePrintSectionId(secId || homeroomSection?.id || teacherSections[0] || '9A');
            setIsAttendancePrintModalOpen(true);
          }}
        />
      )}

      {/* TAB: CLASS ACADEMIC PERFORMANCE TRENDS OVER CURRENT TERM FOR EACH SUBJECT (RECHARTS) */}
      {activeTab === 'SUBJECT_TRENDS' && (
        <ClassSubjectPerformanceTrends
          initialSectionId={teacherSections[0]}
          onNavigateToGradebook={() => setActiveTab('GRADEBOOK')}
        />
      )}

      {/* TAB: REAL-TIME BIOMETRIC ATTENDANCE LOGGING */}
      {activeTab === 'BIOMETRIC_ATTENDANCE' && (
        <BiometricAttendance
          onNavigateToGradebook={() => setActiveTab('GRADEBOOK')}
          onNavigateToHomeroomAttendance={() => isHomeroom ? setActiveTab('ATTENDANCE') : undefined}
          onOpenPrintDossier={(secId) => {
            setAttendancePrintSectionId(secId || homeroomSection?.id || teacherSections[0] || '9A');
            setIsAttendancePrintModalOpen(true);
          }}
        />
      )}

      {/* TAB 1: HOMEROOM ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && isHomeroom && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Daily Homeroom Attendance (Section {homeroomSection?.id})
              </h3>
              <p className="text-xs text-slate-500">
                "if a teacher is assigned a homeroom they will be given the ability to take daily attendance."
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAttendancePrintSectionId(homeroomSection?.id || '9A');
                  setIsAttendancePrintModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs border border-slate-700 hover:border-slate-500"
                title="Export formatted printable classroom attendance history (Institutional Monochrome Report)"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print Attendance Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('BIOMETRIC_ATTENDANCE')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                Live Biometric Scanner
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('STUDENT_PERFORMANCE')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                View Consistency
              </button>
              <label className="text-xs font-semibold text-slate-600">Attendance Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Student Name & ID</th>
                  <th className="py-2.5 px-3">Current Status</th>
                  <th className="py-2.5 px-3 text-right">Record Daily Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {homeroomStudents.map((st) => {
                  const record = attendanceRecords.find(a => a.studentId === st.id && a.date === attendanceDate);
                  const status = record?.status || 'PRESENT';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{st.fullName}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{st.id}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          status === 'ABSENT' ? 'bg-rose-100 text-rose-800' :
                          status === 'LATE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleAttendanceToggle(st.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceToggle(st.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            status === 'ABSENT' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleAttendanceToggle(st.id, 'LATE')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            status === 'LATE' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleAttendanceToggle(st.id, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            status === 'EXCUSED' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Excused
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GRADEBOOK (ASSESSMENT, QUIZ, MID EXAM, FINAL EXAM) */}
      {activeTab === 'GRADEBOOK' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Biometric Attendance Link:</strong> Real-time classroom arrivals can be directly synced into students' <strong>Continuous Assessment & Participation</strong> score.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('BIOMETRIC_ATTENDANCE')}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xs underline shrink-0 cursor-pointer"
            >
              Open Biometric Terminal →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enter Grade Form */}
          <form onSubmit={handleSaveAssessment} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Grade Entry ({teacher.subject})
            </h3>
            <p className="text-xs text-slate-500">
              "Assessment grading (Assessment, Mid Exam, Final Exam, Quiz)." Total score calculates automatically out of 100.
            </p>

            {gradeSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Scores saved successfully to student academic transcript!</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Student</label>
              <select
                value={selectedStudentForGrading}
                onChange={(e) => setSelectedStudentForGrading(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id} - Sec {s.sectionId || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Quiz (Max 20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={quizScore}
                  onChange={(e) => setQuizScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Assessment / CW (Max 20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={assessmentScore}
                  onChange={(e) => setAssessmentScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mid Exam (Max 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={midExamScore}
                  onChange={(e) => setMidExamScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Final Exam (Max 40)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  value={finalExamScore}
                  onChange={(e) => setFinalExamScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900">Total Score:</span>
              <span className="font-mono text-base font-bold text-blue-700">
                {quizScore + assessmentScore + midExamScore + finalExamScore} / 110
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Post Assessment to Student Record
            </button>
          </form>

          {/* Gradebook Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Recorded Subject Grades ({grades.length} entries)
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('STUDENT_PERFORMANCE')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                View Analytics & Trends
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Quiz</th>
                    <th className="py-2.5 px-3 text-center">Assess</th>
                    <th className="py-2.5 px-3 text-center">Mid</th>
                    <th className="py-2.5 px-3 text-center">Final</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Letter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{g.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{g.subject}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{g.quiz}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{g.assessment}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{g.midExam}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{g.finalExam}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">{g.total}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">
                          {g.letterGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB 3: PERSONAL DAY-OFF REQUEST */}
      {activeTab === 'DAY_OFF' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleDayOffSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Submit Day-Off Request
            </h3>
            <p className="text-xs text-slate-500">
              "if a teacher is taking a personal Day off for whatever reason they must submit a request with the reason written down and if there are any Supporting Documents they should be attached."
            </p>

            {leaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Leave request submitted for Principal's executive review.</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Requested Leave Date *</label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Absence *</label>
              <textarea
                rows={3}
                required
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Explain the necessity (e.g. medical appointment, family emergency)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Attach Supporting Document (PDF / Image)</label>
              <label className="border border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center bg-slate-50 group">
                <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mb-1 transition" />
                <span className="text-xs font-medium text-slate-700 truncate max-w-full px-2">
                  {leaveDocName ? leaveDocName : 'Click to select doctor note, clinic certificate, or court summons'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLeaveDocName(file.name);
                      try {
                        const dataUrl = await fileToDataUrl(file);
                        setLeaveDocUrl(dataUrl);
                      } catch (err) {
                        console.error('File read error', err);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>

              {/* Instant Medical Certificate PDF Voucher Option */}
              <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Generate Certified Medical Note PDF</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const docUrl = generateMedicalLeavePdf({
                        teacherName: teacher.name,
                        teacherId: teacher.id,
                        date: leaveDate || new Date().toISOString().split('T')[0],
                        reason: leaveReason || 'Medical indisposition and doctor-advised rest',
                        clinicName: 'Black Lion Specialized Teaching Hospital',
                      });
                      setLeaveDocUrl(docUrl);
                      setLeaveDocName(`Medical_Certificate_${teacher.id}_${leaveDate || 'Leave'}.pdf`);
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const docUrl = leaveDocUrl || generateMedicalLeavePdf({
                        teacherName: teacher.name,
                        teacherId: teacher.id,
                        date: leaveDate || new Date().toISOString().split('T')[0],
                        reason: leaveReason || 'Medical indisposition and doctor-advised rest',
                        clinicName: 'Black Lion Specialized Teaching Hospital',
                      });
                      openDocumentViewer({
                        title: 'Medical Certificate Preview',
                        subtitle: `Supporting Leave Document for ${teacher.name}`,
                        docName: leaveDocName || 'Medical_Leave_Certificate.pdf',
                        docUrl: docUrl,
                        category: 'MEDICAL_LEAVE',
                        metadata: {
                          teacherName: teacher.name,
                          date: leaveDate || new Date().toISOString().split('T')[0],
                          clinic: 'Black Lion Specialized Hospital',
                          uploadedDate: new Date().toISOString().split('T')[0],
                        },
                      });
                    }}
                    className="px-2 py-1 bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Submit Leave Request to Principal
            </button>
          </form>

          {/* History of Day Offs */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              My Leave Request History & Automated Notice Status
            </h3>

            <div className="space-y-3">
              {dayOffRequests.filter(d => d.teacherId === teacher.id).map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Requested Date: {req.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-slate-600"><strong>Reason:</strong> {req.reason}</p>

                  {req.supportingDocName && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Attached: <strong>{req.supportingDocName}</strong>
                      </span>
                      <button
                        onClick={() => {
                          const docUrl = req.supportingDocUrl || generateMedicalLeavePdf({
                            teacherName: teacher.name,
                            teacherId: teacher.id,
                            date: req.date,
                            reason: req.reason,
                            clinicName: 'Black Lion Specialized Teaching Hospital',
                          });
                          openDocumentViewer({
                            title: 'Attached Leave Certificate',
                            subtitle: `Official Attachment for Leave Request on ${req.date}`,
                            docName: req.supportingDocName || 'Medical_Leave_Certificate.pdf',
                            docUrl: docUrl,
                            category: 'MEDICAL_LEAVE',
                            metadata: {
                              teacherName: teacher.name,
                              date: req.date,
                              status: req.status,
                              uploadedDate: 'Uploaded in Faculty Portal',
                            },
                          });
                        }}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        View Document PDF
                      </button>
                    </div>
                  )}

                  {req.status === 'APPROVED' && (
                    <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Automated notice broadcasted to affected sections ({(Array.isArray(req.affectedSections) && req.affectedSections.length > 0 ? req.affectedSections.join(', ') : 'All Classes')}) informing them of faculty absence.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATION REQUESTS */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Student Recommendation Requests Directed to Faculty
          </h3>
          <p className="text-xs text-slate-500">
            Review and fulfill formal recommendation letter requests with digital signatures and stamped letters.
          </p>

          <div className="space-y-3">
            {recommendations.filter(r => r.targetRole === 'TEACHER').map((rec) => (
              <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {rec.studentName} ({rec.studentId})
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <p className="text-slate-700"><strong>Purpose:</strong> {rec.purpose}</p>

                {rec.status !== 'COMPLETED' ? (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <textarea
                      rows={3}
                      value={recLetterDraft}
                      onChange={(e) => setRecLetterDraft(e.target.value)}
                      placeholder="Write recommendation narrative regarding scholarly excellence and character..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                    <button
                      onClick={() => handleFulfillRec(rec.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Sign, Generate PDF & Deliver to Student Portal
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 italic space-y-2">
                    <p>"{rec.letterContent}"</p>
                    <div className="flex items-center justify-between not-italic pt-1 border-t border-slate-100 text-[10px] text-emerald-700 font-semibold">
                      <span>✓ Official PDF Dispatched: {rec.pdfFileName}</span>
                      <button
                        onClick={() => {
                          const docUrl = rec.pdfUrl || generateRecommendationPdf({
                            studentName: rec.studentName,
                            studentId: rec.studentId,
                            grade: rec.grade,
                            recipientName: rec.recipientName,
                            purpose: rec.purpose,
                            counsellorName: teacher.name,
                            schoolName,
                            letterContent: rec.letterContent || '',
                            date: new Date().toISOString().split('T')[0],
                          });
                          openDocumentViewer({
                            title: 'Official Recommendation Letter',
                            subtitle: `Certified Letter for ${rec.recipientName} regarding ${rec.studentName}`,
                            docName: rec.pdfFileName || `${rec.studentId}_RecLetter.pdf`,
                            docUrl: docUrl,
                            category: 'RECOMMENDATION',
                            metadata: {
                              studentName: rec.studentName,
                              studentId: rec.studentId,
                              facultyName: teacher.name,
                              uploadedDate: 'Delivered to Portal',
                            },
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        View PDF Letter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DIRECT PARENT CHAT (TELEGRAM INBOX) */}
      {activeTab === 'PARENT_CHAT' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Chat with Parents of Your Students & AI Drafter
              </h3>
              <p className="text-xs text-slate-500">
                Direct Telegram SIS messaging with the parents of your students. Generate academic progress reports, commendations, attendance alerts, or consult the AI Assistant.
              </p>
            </div>
            <span className="px-3 py-1 bg-sky-50 text-[#2481cc] border border-sky-200 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#2481cc] animate-pulse" />
              Telegram Web SIS Active
            </span>
          </div>

          <TelegramInbox mode="TEACHER" preselectedStudentId={chatStudentId} />
        </div>
      )}

      {/* MONOCHROME PRINTABLE ATTENDANCE DOSSIER MODAL */}
      <TeacherAttendancePrintModal
        isOpen={isAttendancePrintModalOpen}
        onClose={() => setIsAttendancePrintModalOpen(false)}
        defaultSectionId={attendancePrintSectionId}
      />

    </div>
  );
};

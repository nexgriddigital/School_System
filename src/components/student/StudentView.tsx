import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  generateReportCardPdf, 
  generateRecommendationPdf, 
  generateOfficialCertificatePdf, 
  generateDepositSlipPdf 
} from '../../utils/pdfGenerator';
import { 
  CreditCard, 
  Award, 
  CheckSquare, 
  Megaphone, 
  HeartHandshake, 
  IdCard, 
  Receipt, 
  AlertTriangle, 
  KeyRound, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Sparkles,
  FileCheck,
  Stamp,
  HelpCircle
} from 'lucide-react';
import { AcademicStream, TranscriptRequest } from '../../types';
import { generateTranscriptPdf } from '../../utils/transcriptPdfGenerator';

export const StudentView: React.FC = () => {
  const { 
    currentStudent, 
    students,
    activeStudentId,
    invoices, 
    grades, 
    attendanceRecords, 
    notices, 
    recommendations, 
    requestRecommendationLetter, 
    requestStreamChange, 
    reportLostId, 
    requestPasswordReset, 
    setSelectedStudentForIdCard, 
    setSelectedInvoiceForReceipt,
    teachers,
    schoolName,
    openDocumentViewer,
    transcriptRequests,
    requestTranscript
  } = useSchool();

  const student = currentStudent || students?.find(s => s.id === activeStudentId) || students?.[0];

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GRADES' | 'TRANSCRIPT' | 'FEES' | 'RECOMMENDATION' | 'STREAM_CHANGE' | 'ID_CARD'>('OVERVIEW');

  // Transcript Request State
  const [transcriptScope, setTranscriptScope] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [transcriptCutoffDate, setTranscriptCutoffDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transcriptReason, setTranscriptReason] = useState('Official College & University Admissions Application');
  const [transcriptRequestSuccess, setTranscriptRequestSuccess] = useState(false);

  // Stream Change Request Form
  const [requestedStream, setRequestedStream] = useState<AcademicStream>('Social Sciences');
  const [streamChangeReason, setStreamChangeReason] = useState('');
  const [streamSuccess, setStreamSuccess] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Recommendation Letter Request Form
  const [recTargetRole, setRecTargetRole] = useState<'TEACHER' | 'COUNSELLOR'>('TEACHER');
  const [recTargetTeacherId, setRecTargetTeacherId] = useState(teachers[0]?.id || '');
  const [recPurpose, setRecPurpose] = useState('Addis Ababa University STEM Honors Program Application');
  const [recHardCopy, setRecHardCopy] = useState(false);
  const [recSuccess, setRecSuccess] = useState(false);

  // Lost ID Report State
  const [lostIdReason, setLostIdReason] = useState('Misplaced during commute from Bole');
  const [lostSuccess, setLostSuccess] = useState(false);

  // Password reset state
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!student) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        No student record selected.
      </div>
    );
  }

  const studentInvoices = invoices.filter(i => i.studentId === student.id);
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
  const studentRecs = recommendations.filter(r => r.studentId === student.id);

  const handleStreamChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamError(null);
    const res = requestStreamChange(student.id, requestedStream, streamChangeReason);
    if (!res.success) {
      setStreamError(res.error || 'Failed to submit stream change request.');
    } else {
      setStreamSuccess(true);
      setTimeout(() => setStreamSuccess(false), 5000);
    }
  };

  const handleRecRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeacher = teachers.find(t => t.id === recTargetTeacherId);
    requestRecommendationLetter({
      studentId: student.id,
      studentName: student.fullName,
      grade: student.grade,
      targetRole: recTargetRole,
      recipientId: recTargetRole === 'TEACHER' ? recTargetTeacherId : 'COUNS-01',
      recipientName: recTargetRole === 'TEACHER' ? (targetTeacher?.name || 'Faculty Member') : 'Guidance & Counselling Office',
      purpose: recPurpose,
      hardCopyRequested: recHardCopy,
    });
    setRecSuccess(true);
    setTimeout(() => setRecSuccess(false), 4000);
  };

  const handleReportLostId = (e: React.FormEvent) => {
    e.preventDefault();
    reportLostId(student.id, lostIdReason);
    setLostSuccess(true);
    setTimeout(() => setLostSuccess(false), 4000);
  };

  const handleRequestPasswordReset = () => {
    requestPasswordReset(student.id, 'STUDENT', student.fullName);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <img 
              src={student.photoUrl} 
              alt={student.fullName} 
              className="w-16 h-20 object-cover rounded-xl border-2 border-slate-300 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 tracking-wider">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                  Grade {student.grade} {student.sectionId ? `Section ${student.sectionId}` : '(Pending Section)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Student ID: <span className="font-mono font-bold text-slate-800">{student.id}</span> • 
                Fee Account Ref: <span className="font-mono font-bold text-blue-600">{student.accountNumber}</span> • 
                Stream: <span className="font-semibold text-slate-700">{student.stream || 'Unified Academic'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Academic Overview
            </button>

            <button
              onClick={() => setActiveTab('GRADES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'GRADES' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />
              Report Card & Grades
            </button>

            <button
              onClick={() => setActiveTab('TRANSCRIPT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'TRANSCRIPT' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              Official Transcript
            </button>

            <button
              onClick={() => setActiveTab('FEES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'FEES' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              Fee Ledger & Receipts
            </button>

            <button
              onClick={() => setActiveTab('RECOMMENDATION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'RECOMMENDATION' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 inline mr-1" />
              Recommendation
            </button>

            {student.grade >= 11 && (
              <button
                onClick={() => setActiveTab('STREAM_CHANGE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'STREAM_CHANGE' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Stream Change Request
              </button>
            )}

            <button
              onClick={() => setActiveTab('ID_CARD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ID_CARD' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <IdCard className="w-3.5 h-3.5 inline mr-1" />
              Digital ID Card
            </button>

            <button
              onClick={() => {
                const certUrl = student.certificateDocUrl || generateOfficialCertificatePdf({
                  studentName: student.fullName,
                  studentId: student.id,
                  score: student.middleSchoolScore || 89.4,
                  grade: 8,
                  completionYear: '2024 / 2016 E.C.',
                  schoolName,
                });
                openDocumentViewer({
                  title: 'Grade 8 Regional Ministry Certificate',
                  subtitle: `Official Primary School Leaving Examination Certificate for ${student.fullName}`,
                  docName: student.certificateDocName || `${student.id}_Grade_8_Ministry_Certificate.pdf`,
                  docUrl: certUrl,
                  category: 'MINISTRY_CERTIFICATE',
                  metadata: {
                    studentName: student.fullName,
                    studentId: student.id,
                    score: `${student.middleSchoolScore || 89.4}%`,
                    status: 'Certified Official Document',
                    uploadedDate: 'Uploaded in Admissions Portal',
                  },
                });
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              8th Grade Cert PDF
            </button>
          </div>
        </div>

        {/* Urgent Policy Notices & Banner */}
        {student.streamChangeRequest?.status === 'PENDING' && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Stream Change Request Pending:</strong> Your application to shift to {student.streamChangeRequest.requestedStream} is currently under evaluation by the Registrar. Classroom allocation and attendance marking are withheld pending decision.
            </span>
          </div>
        )}

        {/* Quick Password Reset button */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>
            Security Credentials: Password encrypted. To reset, request verification through Registrar or Principal.
          </span>
          <button
            onClick={handleRequestPasswordReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Request Password Reset
          </button>
        </div>

        {resetSuccess && (
          <div className="mt-2 p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
            ✓ Password reset request dispatched to Registrar and Principal. A temporary password will be issued.
          </div>
        )}
      </div>

      {/* TAB 1: ACADEMIC OVERVIEW & BULLETINS */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Official Notices */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                Academy Bulletins & Administrative Notices
              </h3>
              <span className="text-xs text-slate-500 font-medium">Filtered for Students</span>
            </div>

            <div className="space-y-3">
              {notices.filter(n => n.targetAudience === 'ALL' || n.targetAudience === 'STUDENTS').map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border text-xs space-y-1.5 transition ${
                    n.isUrgent ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200/70">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Issued by: <strong>{n.postedBy}</strong> ({n.postedRole})</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                      {n.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Log Snapshot */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Daily Attendance Record
              </h3>
              <p className="text-xs text-slate-500">Taken by your appointed Homeroom Teacher</p>
            </div>

            <div className="space-y-2">
              {studentAttendance.map((rec) => (
                <div key={rec.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600">{rec.date}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                    rec.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))}

              {studentAttendance.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No attendance records logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRADES & REPORT CARD */}
      {activeTab === 'GRADES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Official Assessment Transcript & Report Card
              </h3>
              <p className="text-xs text-slate-500">
                Includes continuous assessments, quizzes, mid-term examinations, and final exams.
              </p>
            </div>

            <button
              onClick={() => {
                const pdfUrl = generateReportCardPdf({
                  studentName: student.fullName,
                  studentId: student.id,
                  grade: student.grade,
                  stream: student.stream,
                  schoolName,
                  term: 'Semester 1',
                  grades: studentGrades.map(g => ({
                    subject: g.subject,
                    teacherName: g.teacherName,
                    quiz: g.quiz,
                    assessment: g.assessment,
                    midExam: g.midExam,
                    finalExam: g.finalExam,
                    total: g.total,
                    letterGrade: g.letterGrade,
                  })),
                });
                openDocumentViewer({
                  title: 'Official Academic Report Card',
                  subtitle: `Transcript & Performance Record for ${student.fullName}`,
                  docName: `${student.id}_Report_Card_Semester_1.pdf`,
                  docUrl: pdfUrl,
                  category: 'REPORT_CARD',
                  metadata: {
                    studentName: student.fullName,
                    studentId: student.id,
                    academicYear: '2025-2026 Academic Year',
                    uploadedDate: new Date().toISOString().split('T')[0],
                  },
                });
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Download Report Card PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Faculty Instructor</th>
                  <th className="py-2.5 px-3 text-center">Quiz (20%)</th>
                  <th className="py-2.5 px-3 text-center">Assessment (20%)</th>
                  <th className="py-2.5 px-3 text-center">Mid Exam (30%)</th>
                  <th className="py-2.5 px-3 text-center">Final Exam (40%)</th>
                  <th className="py-2.5 px-3 text-center">Total Score</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{g.subject}</td>
                    <td className="py-3 px-3 text-slate-600">{g.teacherName}</td>
                    <td className="py-3 px-3 text-center font-mono">{g.quiz}</td>
                    <td className="py-3 px-3 text-center font-mono">{g.assessment}</td>
                    <td className="py-3 px-3 text-center font-mono">{g.midExam}</td>
                    <td className="py-3 px-3 text-center font-mono">{g.finalExam}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-600 text-sm">{g.total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                        {g.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: OFFICIAL TRANSCRIPT REQUEST & VERIFIED DOWNLOAD */}
      {activeTab === 'TRANSCRIPT' && (
        <div className="space-y-6">
          {/* Header Policy Ribbon */}
          <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-800/80 border border-indigo-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-oskar-vintage text-lg font-bold tracking-wide">
                    Official Student Transcript Portal
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Dynamic cutoff grade calculation with diagonal &quot;Temporary Transcript&quot; security watermark.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-800/90 text-indigo-200 rounded-lg text-xs font-mono border border-indigo-700">
                  Executive Approval Required
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-950/60 rounded-xl border border-indigo-800/70 text-xs text-indigo-100 flex items-start gap-2.5">
              <Stamp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Official Protocol:</strong> Transcripts calculate grades strictly up to your requested cutoff date. Any unfinalized courses beyond that date are rendered as <strong>&quot;NG&quot; (No Grade)</strong>. Under institutional regulation, students and parents must submit a request. Once authorized and digitally approved by the Principal, you can view and download the verified document with the diagonal <em>&quot;Temporary Transcript&quot;</em> watermark.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Request Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Request Official Transcript
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify scope and grade cutoff date for Principal review.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!student) return;
                  requestTranscript({
                    studentId: student.id,
                    studentName: student.fullName,
                    grade: student.grade,
                    stream: student.stream,
                    requestedByRole: 'STUDENT',
                    requesterName: student.fullName,
                    requesterId: student.id,
                    scope: transcriptScope,
                    requestedDate: transcriptCutoffDate,
                    reason: transcriptReason,
                  });
                  setTranscriptRequestSuccess(true);
                  setTimeout(() => setTranscriptRequestSuccess(false), 4500);
                }} 
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transcript Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTranscriptScope('FULL')}
                      className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                        transcriptScope === 'FULL'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Full Transcript
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Cumulative Records
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTranscriptScope('PARTIAL')}
                      className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                        transcriptScope === 'PARTIAL'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Partial Transcript
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Grade {student.grade} Year-to-Date
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requested Grade Cutoff Date
                  </label>
                  <input
                    type="date"
                    required
                    value={transcriptCutoffDate}
                    onChange={(e) => setTranscriptCutoffDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Grades entered up to this date will appear. Any unentered assessments show as &quot;NG&quot;.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose / Justification
                  </label>
                  <input
                    type="text"
                    required
                    value={transcriptReason}
                    onChange={(e) => setTranscriptReason(e.target.value)}
                    placeholder="e.g., University Admissions, Scholarship, Visa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request to Principal
                </button>

                {transcriptRequestSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Transcript request successfully lodged! Once the Principal reviews and approves, your watermarked transcript will be available below.
                  </div>
                )}
              </form>
            </div>

            {/* My Requests & Approved Transcripts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Transcript Requests & Approvals
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check authorization status and view approved documents.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
                    {transcriptRequests.filter(r => r.studentId === student.id).length} Total
                  </span>
                </div>

                {transcriptRequests.filter(r => r.studentId === student.id).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs">No transcript requests filed yet.</p>
                    <p className="text-[11px] text-slate-400">Use the form on the left to request your Full or Partial transcript.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcriptRequests
                      .filter(r => r.studentId === student.id)
                      .map((req) => (
                        <div
                          key={req.id}
                          className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                            req.status === 'APPROVED'
                              ? 'border-emerald-200 bg-emerald-50/40 shadow-xs'
                              : req.status === 'REJECTED'
                              ? 'border-rose-200 bg-rose-50/40'
                              : 'border-amber-200 bg-amber-50/40'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {req.scope === 'FULL' ? 'Full Cumulative Transcript' : 'Partial Academic Transcript'}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  Cutoff: <strong>{req.requestedDate}</strong>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Reason: <em>{req.reason}</em>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === 'PENDING_APPROVAL' && (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px] flex items-center gap-1 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                                  Awaiting Principal Approval
                                </span>
                              )}
                              {req.status === 'APPROVED' && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  Approved & Ready
                                </span>
                              )}
                              {req.status === 'REJECTED' && (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-full font-bold text-[10px] border border-rose-300">
                                  Rejected: {req.rejectionReason || 'Contact Office'}
                                </span>
                              )}
                            </div>
                          </div>

                          {req.status === 'APPROVED' ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                              <div className="text-[11px] text-emerald-900 space-y-0.5">
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <Stamp className="w-3.5 h-3.5 text-emerald-700" />
                                  Watermarked: &quot;Temporary Transcript&quot;
                                </div>
                                <p className="text-slate-500">
                                  Authorized by <strong>{req.approvedBy || 'School Principal'}</strong> on {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : 'Today'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const pdfUrl = generateTranscriptPdf({
                                      student,
                                      schoolName,
                                      grades,
                                      cutoffDate: req.requestedDate,
                                      scope: req.scope,
                                      watermarkText: 'Temporary Transcript',
                                      authorizedBy: req.approvedBy,
                                      authorizedSignature: req.authorizedSignature,
                                    });

                                    openDocumentViewer({
                                      title: `Official Academic Transcript (${req.scope === 'FULL' ? 'Cumulative' : 'Partial'})`,
                                      subtitle: `${student.fullName} (${student.id}) • Cutoff: ${req.requestedDate}`,
                                      docName: `${student.id}_Temporary_Transcript_${req.requestedDate}.pdf`,
                                      docUrl: pdfUrl,
                                      category: 'TRANSCRIPT',
                                      watermark: 'Temporary Transcript',
                                      metadata: {
                                        studentName: student.fullName,
                                        studentId: student.id,
                                        cutoffDate: req.requestedDate,
                                        scope: req.scope,
                                        watermark: 'Temporary Transcript',
                                        signatures: req.authorizedSignature ? [req.authorizedSignature] : undefined,
                                      }
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Transcript
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const pdfUrl = generateTranscriptPdf({
                                      student,
                                      schoolName,
                                      grades,
                                      cutoffDate: req.requestedDate,
                                      scope: req.scope,
                                      watermarkText: 'Temporary Transcript',
                                      authorizedBy: req.approvedBy,
                                      authorizedSignature: req.authorizedSignature,
                                    });
                                    const a = document.createElement('a');
                                    a.href = pdfUrl;
                                    a.download = `${student.id}_Temporary_Transcript_${req.requestedDate}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download PDF
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                              <span>Filed on {new Date(req.createdAt).toLocaleDateString()}</span>
                              <span className="italic text-amber-700 font-medium">
                                Principal executive clearance in progress
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Real-time Cutoff Grade Simulation Table */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-oskar-vintage text-xs font-bold uppercase tracking-wider text-slate-700">
                    Grade Status for Cutoff: {transcriptCutoffDate}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    System Logic: Entered &le; Cutoff or &quot;NG&quot;
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2 px-3">Subject Course</th>
                        <th className="py-2 px-3">Instructor</th>
                        <th className="py-2 px-3 text-center">Entry Date</th>
                        <th className="py-2 px-3 text-center">Score</th>
                        <th className="py-2 px-3 text-center">Transcript Mark</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentGrades.map((g, idx) => {
                        const isEnteredByCutoff = !g.entryDate || g.entryDate <= transcriptCutoffDate;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-900">{g.subject}</td>
                            <td className="py-2 px-3 text-slate-600 text-[11px]">{g.teacherName}</td>
                            <td className="py-2 px-3 text-center text-slate-500 text-[11px] font-mono">
                              {g.entryDate || 'Prior Term'}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">
                              {isEnteredByCutoff ? `${g.total}%` : '—'}
                            </td>
                            <td className="py-2 px-3 text-center font-bold font-mono">
                              {isEnteredByCutoff ? (
                                <span className="text-blue-700">{g.letterGrade}</span>
                              ) : (
                                <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                                  NG
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isEnteredByCutoff ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                  Finalized
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                  No Grade (NG)
                                </span>
                              )}
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
      )}

      {/* TAB 3: FEES & RECEIPTS (WITH WATERMARKED DIGITAL RECEIPT ACCESS) */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Student Fee Account Ledger & Official Digital Receipts
            </h3>
            <p className="text-xs text-slate-500">
              "Once Payment is approved Both Student and Parents will be able to access a digital copy of the receipt. (The system will auto Generate) (Put a Paid Bill Watermark on it)"
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-700">Your Dedicated Bank Reference Account</p>
              <p className="font-mono text-xl font-bold text-blue-900 mt-0.5">{student.accountNumber}</p>
            </div>
            <p className="text-xs text-blue-800 max-w-sm">
              Always write this number on your CBE/Awash bank deposit slip so the automated bulk reconciliation engine can cross-check and credit your ledger.
            </p>
          </div>

          <div className="space-y-3">
            {studentInvoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inv.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Amount: <strong className="text-slate-800 font-mono">{inv.amount.toLocaleString()} ETB</strong> • Due: {inv.dueDate}
                  </p>
                  {inv.paymentReference && (
                    <p className="text-[11px] font-mono text-blue-600 mt-0.5">
                      Bank Ref: {inv.paymentReference}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {inv.status === 'PAID' ? (
                    <button
                      onClick={() => setSelectedInvoiceForReceipt(inv)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Receipt className="w-4 h-4" />
                      View Official Watermarked Receipt
                    </button>
                  ) : (
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <span className="text-xs font-semibold text-amber-700">
                        Payment Slip Under Reconciliation
                      </span>
                      {inv.slipName && (
                        <button
                          onClick={() => {
                            const docUrl = inv.slipUrl || generateDepositSlipPdf({
                              studentName: student.fullName,
                              studentId: student.id,
                              invoiceTitle: inv.title,
                              amount: inv.amount,
                              bankReference: inv.paymentReference || 'FT-DEMO',
                              bankName: 'Commercial Bank of Ethiopia (CBE)',
                              date: inv.dueDate,
                            });
                            openDocumentViewer({
                              title: 'Bank Deposit Slip Voucher',
                              subtitle: `Voucher for ${inv.title}`,
                              docName: inv.slipName || 'bank_deposit_slip.pdf',
                              docUrl: docUrl,
                              category: 'DEPOSIT_SLIP',
                              metadata: {
                                studentName: student.fullName,
                                studentId: student.id,
                                amount: `${inv.amount.toLocaleString()} ETB`,
                                bankReference: inv.paymentReference || 'N/A',
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Slip PDF
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATION LETTER REQUEST */}
      {activeTab === 'RECOMMENDATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleRecRequestSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Request Recommendation Letter
            </h3>
            <p className="text-xs text-slate-500">
              "request Recommendation letter from any teacher or counsellor. When requesting they can choose the reason and if they want a hardcopy or just in their portal"
            </p>

            {recSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recommendation letter request dispatched to faculty!</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Recipient Role</label>
              <select
                value={recTargetRole}
                onChange={(e) => setRecTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="TEACHER">Subject Teacher</option>
                <option value="COUNSELLOR">School Counselor's Office</option>
              </select>
            </div>

            {recTargetRole === 'TEACHER' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Faculty Teacher</label>
                <select
                  value={recTargetTeacherId}
                  onChange={(e) => setRecTargetTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Purpose / Target Institution</label>
              <input
                type="text"
                required
                value={recPurpose}
                onChange={(e) => setRecPurpose(e.target.value)}
                placeholder="e.g. AAU Engineering / Youth Leadership Fellowship"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hardcopy"
                checked={recHardCopy}
                onChange={(e) => setRecHardCopy(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="hardcopy" className="text-xs font-medium text-slate-700 cursor-pointer">
                Request physical embossed hardcopy in addition to portal digital copy
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Recommendation Request
            </button>
          </form>

          {/* My Requests Tracker */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              My Recommendation Inquiries
            </h3>

            <div className="space-y-3">
              {studentRecs.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Recipient: {r.recipientName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-slate-600"><strong>Purpose:</strong> {r.purpose}</p>

                  {r.status === 'COMPLETED' && r.letterContent && (
                    <div className="p-3 bg-white rounded border border-slate-200 text-slate-700 italic space-y-2">
                      <p>"{r.letterContent}"</p>
                      <div className="flex flex-wrap items-center justify-between not-italic pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 font-bold text-[10px]">
                          ✓ Signed Official PDF Attached: {r.pdfFileName}
                        </span>
                        <button 
                          onClick={() => {
                            const docUrl = r.pdfUrl || generateRecommendationPdf({
                              studentName: r.studentName,
                              studentId: r.studentId,
                              grade: r.grade,
                              recipientName: r.recipientName,
                              purpose: r.purpose,
                              counsellorName: r.targetRole === 'TEACHER' ? 'Faculty Instructor' : 'School Counseling Office',
                              schoolName,
                              letterContent: r.letterContent || '',
                              date: new Date().toISOString().split('T')[0],
                            });
                            openDocumentViewer({
                              title: 'Certified Recommendation Letter',
                              subtitle: `Official Recommendation for ${r.recipientName}`,
                              docName: r.pdfFileName || `${r.studentId}_Recommendation_Letter.pdf`,
                              docUrl: docUrl,
                              category: 'RECOMMENDATION',
                              metadata: {
                                studentName: r.studentName,
                                studentId: r.studentId,
                                recipient: r.recipientName,
                                purpose: r.purpose,
                                status: 'Officially Certified & Stamped',
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
                        >
                          <Eye className="w-3 h-3" /> View & Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {studentRecs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No active recommendation requests.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STREAM CHANGE (WITH 15-DAY STRICT POLICY ENFORCEMENT) */}
      {activeTab === 'STREAM_CHANGE' && student.grade >= 11 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-xl space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Apply to Change Academic Stream (Natural / Social)
          </h3>
          <p className="text-xs text-slate-500">
            "They can apply to change their stream if and only if 15 days haven't passed since the academic year has started. if 15 days have passed the system should prohibit requests. if the request is neither Accepted nor denied the system shouldn't assign the student a classroom and don't put them in the attendance."
          </p>

          {streamError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{streamError}</span>
            </div>
          )}

          {streamSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Stream change request lodged with Registrar Office. Classroom assignment withheld until decision.</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span>Current Stream: <strong className="text-blue-700">{student.stream || 'Natural Sciences'}</strong></span>
            <span className="text-[10px] text-slate-500">Day 8 of 15-Day Policy Window</span>
          </div>

          <form onSubmit={handleStreamChangeSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select New Desired Stream *</label>
              <select
                value={requestedStream}
                onChange={(e) => setRequestedStream(e.target.value as AcademicStream)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Social Sciences">Social Sciences</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Justification & Reason *</label>
              <textarea
                rows={4}
                required
                value={streamChangeReason}
                onChange={(e) => setStreamChangeReason(e.target.value)}
                placeholder="Detail career aspirations, prerequisite subject performance, and counselor advisory..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Submit Official Stream Change Request
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: DIGITAL ID CARD & LOST ID REPORT */}
      {activeTab === 'ID_CARD' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Official Academy Student ID Badge
              </h3>
              <p className="text-xs text-slate-500">
                Rendered with official typography, barcoding, emergency contact, and registrar signature.
              </p>
            </div>

            <button
              onClick={() => setSelectedStudentForIdCard(student)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <IdCard className="w-4 h-4" />
              Open High-Res ID Badge Generator
            </button>
          </div>

          {/* Lost ID Section */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-xl space-y-3">
            <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Report Lost Student ID
            </h4>
            <p className="text-xs text-slate-500">
              "if the student loses his/her ID, finance must give them Clearance in the finance portal after which The ID becomes Downloadable"
            </p>

            {lostSuccess && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                Lost ID logged. Clearance requirements have been initiated across Finance, Library, and Homeroom.
              </div>
            )}

            {student.lostIdRequest ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Replacement Request In Progress</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                    {student.lostIdRequest.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-2">
                  <div className={`p-2 rounded text-center font-bold ${student.lostIdRequest.financeCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    Finance: {student.lostIdRequest.financeCleared ? 'Cleared' : 'Pending (500 ETB)'}
                  </div>
                  <div className={`p-2 rounded text-center font-bold ${student.lostIdRequest.libraryCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    Library: {student.lostIdRequest.libraryCleared ? 'Cleared' : 'Pending'}
                  </div>
                  <div className={`p-2 rounded text-center font-bold ${student.lostIdRequest.homeroomTeacherCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    Homeroom: {student.lostIdRequest.homeroomTeacherCleared ? 'Cleared' : 'Pending'}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportLostId} className="space-y-2">
                <input
                  type="text"
                  required
                  value={lostIdReason}
                  onChange={(e) => setLostIdReason(e.target.value)}
                  placeholder="Describe circumstance of loss..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Report Lost ID & Request Replacement
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

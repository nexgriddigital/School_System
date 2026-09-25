import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { generateRecommendationPdf } from '../../utils/pdfGenerator';
import { 
  HeartHandshake, 
  ShieldAlert, 
  FileText, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  RotateCcw,
  Eye,
  Sparkles,
  Download,
  Calendar,
  Clock,
  MapPin,
  History,
  Users
} from 'lucide-react';
import { DisciplinaryAction, StudentEvaluation } from '../../types';
import { DisciplinaryHearingModal } from './DisciplinaryHearingModal';
import { ParentEmailLogsModal } from '../common/ParentEmailLogsModal';
import { StudentDisciplineModule } from './StudentDisciplineModule';

export const CounsellorView: React.FC = () => {
  const { 
    students, 
    disciplinaryActions, 
    recommendations, 
    fulfillRecommendationLetter,
    evaluations, 
    submitCounsellorEvaluation,
    sendChatMessage,
    schoolName,
    openDocumentViewer,
    currentUser
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'DISCIPLINARY' | 'EVALUATIONS' | 'RECOMMENDATIONS' | 'PARENT_MAIL'>('DISCIPLINARY');
  const [selectedActionForHearing, setSelectedActionForHearing] = useState<DisciplinaryAction | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Evaluation Form State
  const [evalStudentId, setEvalStudentId] = useState<string>(students[0]?.id || '');
  const [conductRating, setConductRating] = useState<'Excellent' | 'Good' | 'Needs Improvement'>('Good');
  const [academicEffort, setAcademicEffort] = useState<'High' | 'Satisfactory' | 'Low'>('Satisfactory');
  const [evalComments, setEvalComments] = useState('');

  // Parent Portal Mail State
  const [parentTargetStudentId, setParentTargetStudentId] = useState<string>(students[0]?.id || '');
  const [mailSubject, setMailSubject] = useState('Academic Guidance & Counseling Progress Update');
  const [mailMessage, setMailMessage] = useState('');
  const [mailSentSuccess, setMailSentSuccess] = useState(false);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === evalStudentId);
    if (!st) return;

    submitCounsellorEvaluation({
      studentId: st.id,
      studentName: st.fullName,
      teacherId: currentUser?.id || 'COUNS-01',
      teacherName: currentUser?.name || 'Guidance Counsellor',
      subject: 'Counseling & Student Life',
      date: new Date().toISOString().split('T')[0],
      conductRating,
      academicEffort,
      comments: evalComments,
    });

    setEvalComments('');
    alert('Counseling evaluation recorded successfully.');
  };

  const handleSendParentMail = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === parentTargetStudentId);
    if (!st) return;

    sendChatMessage('PARENT', `${st.parents.fatherName || st.parents.motherName || 'Parent'}`, `[Counsellor Mail] Subject: ${mailSubject}\n\n${mailMessage}`);
    setMailSentSuccess(true);
    setMailMessage('');
    setTimeout(() => setMailSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded text-xs font-bold uppercase tracking-wider">
              Student Guidance & Pastoral Care
            </span>
            <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
              Counsellor's Office Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Student evaluations, disciplinary recording with automatic homeroom alerts, recommendation letters, and direct parent portal communication.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('DISCIPLINARY')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'DISCIPLINARY' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Student Discipline ({disciplinaryActions.length})
            </button>

            <button
              onClick={() => setActiveTab('EVALUATIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'EVALUATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Student Evaluations
            </button>

            <button
              onClick={() => setActiveTab('RECOMMENDATIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'RECOMMENDATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Recommendation Letters ({recommendations.filter(r => r.targetRole === 'COUNSELLOR').length})
            </button>

            <button
              onClick={() => setActiveTab('PARENT_MAIL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'PARENT_MAIL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Direct Parent Mail
            </button>

            <button
              onClick={() => setShowLogsModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-900 text-blue-300 hover:bg-slate-800 transition border border-slate-700"
              title="View automated Gmail parent alert dispatch audit history"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              Parent Alert Logs (Gmail)
            </button>
          </div>
        </div>

        {/* Counseling Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Disciplinary Cases</p>
            <p className="font-oskar-vintage text-xl font-bold text-slate-900 mt-0.5">{disciplinaryActions.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reversed by Principal</p>
            <p className="font-oskar-vintage text-xl font-bold text-emerald-600 mt-0.5">
              {disciplinaryActions.filter(d => d.reversedByPrincipal).length} Cases
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommendation Requests</p>
            <p className="font-oskar-vintage text-xl font-bold text-blue-600 mt-0.5">{recommendations.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluations Logged</p>
            <p className="font-oskar-vintage text-xl font-bold text-purple-600 mt-0.5">{evaluations.length}</p>
          </div>
        </div>
      </div>

      {/* TAB 1: STUDENT DISCIPLINE LOGGING & MANAGEMENT MODULE */}
      {activeTab === 'DISCIPLINARY' && (
        <StudentDisciplineModule
          onOpenHearingModal={(action) => setSelectedActionForHearing(action)}
        />
      )}

      {/* TAB 2: STUDENT EVALUATIONS */}
      {activeTab === 'EVALUATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitEvaluation} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Submit Counselor Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Record pastoral care, conduct, and psychological maturity assessments.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Student</label>
              <select
                value={evalStudentId}
                onChange={(e) => setEvalStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Conduct Rating</label>
              <select
                value={conductRating}
                onChange={(e) => setConductRating(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Effort & Focus</label>
              <select
                value={academicEffort}
                onChange={(e) => setAcademicEffort(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="High">High</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Counselor Narrative & Notes</label>
              <textarea
                rows={3}
                required
                value={evalComments}
                onChange={(e) => setEvalComments(e.target.value)}
                placeholder="Observation on interpersonal dynamics, peer relations, stress management..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Log Evaluation
            </button>
          </form>

          {/* Evaluations Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Counselor & Teacher Evaluations Feed ({evaluations.length})
            </h3>

            <div className="space-y-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{ev.studentName}</span>
                      <span className="text-slate-400 text-[10px] ml-2 font-mono">({ev.studentId})</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{ev.date}</span>
                  </div>

                  <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-200/80 leading-relaxed">
                    "{ev.comments}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Evaluator: {ev.teacherName} ({ev.subject})</span>
                    <div className="flex gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                        Conduct: {ev.conductRating}
                      </span>
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[10px]">
                        Effort: {ev.academicEffort}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDATION LETTERS */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Student Recommendation Letter Inquiries (Counselor Office)
          </h3>
          <p className="text-xs text-slate-500">
            Review formal recommendation requests lodged by students through their portal for college admissions and summer programs.
          </p>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{rec.studentName}</span>
                    <span className="font-mono text-blue-600 text-xs ml-2 font-semibold">({rec.studentId})</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold ml-2">
                      Grade {rec.grade}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <p className="text-slate-700 font-medium">
                  <strong>Purpose:</strong> {rec.purpose}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Requested Target: <strong>{rec.recipientName}</strong> ({rec.targetRole})</span>
                  <span>Hard Copy Requested: {rec.hardCopyRequested ? 'Yes (Must be printed & stamped)' : 'Digital Only'}</span>
                </div>

                {rec.status === 'COMPLETED' && rec.letterContent && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-slate-700 italic space-y-2">
                    <p>"{rec.letterContent}"</p>
                    <div className="flex flex-wrap items-center justify-between not-italic text-[10px] text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                      <span>✓ Official Stamped Digital PDF Uploaded to Portal</span>
                      <button
                        onClick={() => {
                          const docUrl = rec.pdfUrl || generateRecommendationPdf({
                            studentName: rec.studentName,
                            studentId: rec.studentId,
                            grade: rec.grade,
                            recipientName: rec.recipientName,
                            purpose: rec.purpose,
                            counsellorName: currentUser?.name || 'Head Guidance Counsellor',
                            schoolName,
                            letterContent: rec.letterContent || '',
                            date: new Date().toISOString().split('T')[0],
                          });
                          openDocumentViewer({
                            title: 'Official Recommendation Letter',
                            subtitle: `Certified Letter for ${rec.recipientName} regarding ${rec.studentName}`,
                            docName: rec.pdfFileName || `${rec.studentId}_Recommendation_Letter.pdf`,
                            docUrl: docUrl,
                            category: 'RECOMMENDATION',
                            metadata: {
                              studentName: rec.studentName,
                              studentId: rec.studentId,
                              recipient: rec.recipientName,
                              uploadedDate: 'Uploaded to Portal',
                            },
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        View Official Stamped PDF
                      </button>
                    </div>
                  </div>
                )}

                {rec.status === 'PENDING' && (
                  <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        Awaiting Counselor Fulfillment & Digital Stamp
                      </span>
                      <button
                        onClick={() => {
                          const defaultLetter = `I write with highest enthusiasm recommending ${rec.studentName} for admission and participation. Demonstrating exceptional ethical integrity, outstanding perseverance, and rigorous intellectual engagement throughout Grade ${rec.grade}, ${rec.studentName} consistently elevates the learning community.`;
                          const pdfFileName = `${rec.studentId}_Official_Recommendation_Letter.pdf`;
                          const generatedPdf = generateRecommendationPdf({
                            studentName: rec.studentName,
                            studentId: rec.studentId,
                            grade: rec.grade,
                            recipientName: rec.recipientName,
                            purpose: rec.purpose,
                            counsellorName: currentUser?.name || 'Head Guidance Counsellor',
                            schoolName,
                            letterContent: defaultLetter,
                            date: new Date().toISOString().split('T')[0],
                          });
                          fulfillRecommendationLetter(rec.id, defaultLetter, pdfFileName, generatedPdf);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate & Upload Official PDF Letter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT PARENT PORTAL MAIL */}
      {activeTab === 'PARENT_MAIL' && (
        <form onSubmit={handleSendParentMail} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-xl space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Direct Contact to Parents (Via Portal Mail)
          </h3>
          <p className="text-xs text-slate-500">
            "Direct contact to Parents (Via portal mail)." Messages are securely routed to the parent's verified dashboard.
          </p>

          {mailSentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Portal message successfully delivered to student's parent inbox!</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Student's Parents</label>
            <select
              value={parentTargetStudentId}
              onChange={(e) => setParentTargetStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}'s Parents ({s.parents.fatherName || s.parents.motherName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Header</label>
            <input
              type="text"
              required
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Counselor Message</label>
            <textarea
              rows={5}
              required
              value={mailMessage}
              onChange={(e) => setMailMessage(e.target.value)}
              placeholder="Write direct pastoral or guidance message to parents..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Portal Message to Parents
          </button>
        </form>
      )}

      {/* Disciplinary Hearing & Parent Summons Modal */}
      {selectedActionForHearing && (
        <DisciplinaryHearingModal
          isOpen={!!selectedActionForHearing}
          onClose={() => setSelectedActionForHearing(null)}
          action={selectedActionForHearing}
        />
      )}

      {/* Parent Email Notification Logs Modal */}
      <ParentEmailLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        defaultFilter="DISCIPLINARY"
      />

    </div>
  );
};

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { generateMedicalLeavePdf } from '../../utils/pdfGenerator';
import { 
  GraduationCap, 
  Megaphone, 
  CheckCircle2, 
  RotateCcw, 
  CalendarClock, 
  ShieldCheck, 
  KeyRound, 
  Users, 
  FileCheck,
  Building2,
  AlertCircle,
  Settings,
  Sparkles,
  Edit3,
  Eye,
  FileText,
  UserPlus,
  ShieldAlert
} from 'lucide-react';
import { UserProvisioningTab } from './UserProvisioningTab';
import { MasterResetModal } from './MasterResetModal';

export const PrincipalView: React.FC = () => {
  const { 
    schoolName,
    setSchoolName,
    notices, 
    postNotice, 
    dayOffRequests, 
    reviewTeacherDayOff, 
    disciplinaryActions, 
    reverseDisciplinaryAction, 
    students, 
    principalOverrideLostIdDownload, 
    resetUserPassword,
    sections,
    teachers,
    assignHomeroomTeacher,
    setSelectedStudentForIdCard,
    openDocumentViewer
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'AUTHORIZATIONS' | 'USER_PROVISIONING' | 'BROADCAST' | 'TEACHER_MANAGEMENT' | 'DISCIPLINARY_REVERSAL' | 'INSTITUTION_SETTINGS'>('AUTHORIZATIONS');
  const [customNameInput, setCustomNameInput] = useState(schoolName);
  const [savedNameNotice, setSavedNameNotice] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessBanner, setResetSuccessBanner] = useState(false);

  // Broadcast Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'Academic Calendar' | 'Emergency Closure' | 'General Event'>('Academic Calendar');
  const [noticeContent, setNoticeContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF'>('ALL');
  const [isUrgent, setIsUrgent] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Disciplinary Reversal State
  const [reversalReason, setReversalReason] = useState('Satisfactory restitution achieved and counseling completed with parent agreement.');

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    postNotice({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      postedBy: 'Dr. Henok Kebede (Headmaster & Principal)',
      postedRole: 'School Principal',
      targetAudience,
      isUrgent,
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeSuccess(true);
    setTimeout(() => setNoticeSuccess(false), 4000);
  };

  const handleReverseDisciplinary = (actionId: string) => {
    reverseDisciplinaryAction(actionId, reversalReason);
    alert('Disciplinary action officially rescinded and reversed by the Principal.');
  };

  const pendingTeacherRequests = dayOffRequests.filter(d => d.status === 'PENDING');
  const activeDisciplinaryCases = disciplinaryActions.filter(d => !d.reversedByPrincipal);
  const lostIdCases = students.filter(s => s.lostIdRequest && s.lostIdRequest.status !== 'COLLECTED');

  return (
    <div className="space-y-6">
      {/* System Master Reset Success Banner */}
      {resetSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950">
            <p className="font-bold text-sm text-emerald-900">System Master Reset Successfully Executed!</p>
            <p className="mt-0.5 text-emerald-800">
              All student enrollments, sections, marks, tuition invoices, CBE/Telebirr reconciliations, notices, and user accounts have been restored to initial factory defaults at the Principal&apos;s touch.
            </p>
          </div>
        </div>
      )}

      {/* Principal Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider">
              Executive Administration
            </span>
            <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
              Office of the School Principal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overall leadership, executive authorizations (leaves, reversals, overrides), homeroom faculty appointment, and institutional broadcasts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('USER_PROVISIONING')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'USER_PROVISIONING' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Staff & User Accounts
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => setActiveTab('AUTHORIZATIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 relative transition ${
                activeTab === 'AUTHORIZATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Executive Authorizations
              {pendingTeacherRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingTeacherRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'BROADCAST' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              Post Official Notice
            </button>

            <button
              onClick={() => setActiveTab('TEACHER_MANAGEMENT')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'TEACHER_MANAGEMENT' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Assign Homeroom Teachers
            </button>

            <button
              onClick={() => setActiveTab('DISCIPLINARY_REVERSAL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'DISCIPLINARY_REVERSAL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Disciplinary Reversals ({activeDisciplinaryCases.length})
            </button>

            <button
              onClick={() => setActiveTab('INSTITUTION_SETTINGS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'INSTITUTION_SETTINGS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              School Name & Branding
            </button>

            {/* Principal Touch: Master Reset Everything */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition shadow-xs cursor-pointer ml-auto active:scale-95 group"
              title="Principal Executive Touch: Reset Entire System to Factory Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500 group-hover:text-white group-hover:rotate-180 transition-transform duration-300" />
              <span>Reset Everything</span>
            </button>
          </div>
        </div>

        {/* Administration Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled Body</p>
            <p className="font-oskar-vintage text-xl font-bold text-slate-900 mt-0.5">{students.length} Scholars</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teaching Staff</p>
            <p className="font-oskar-vintage text-xl font-bold text-blue-600 mt-0.5">{teachers.length} Faculty</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Leave Requests</p>
            <p className="font-oskar-vintage text-xl font-bold text-amber-600 mt-0.5">{pendingTeacherRequests.length} Pending</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Notices</p>
            <p className="font-oskar-vintage text-xl font-bold text-purple-600 mt-0.5">{notices.length} Bulletins</p>
          </div>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE AUTHORIZATIONS */}
      {activeTab === 'AUTHORIZATIONS' && (
        <div className="space-y-6">
          {/* 1. Teacher Leave Approvals */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Faculty Personal Day-Off Requests
                </h3>
                <p className="text-xs text-slate-500">
                  "if a teacher is taking a personal Day off for whatever reason they must submit a request with the reason written down and if there are any Supporting Documents they should be attached. Once approved The students affected by the teacher's absense should get a notice Automatically that the teacher won't be there."
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                {pendingTeacherRequests.length} Requiring Action
              </span>
            </div>

            <div className="space-y-3">
              {dayOffRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-xl border text-xs space-y-2 transition ${
                    req.status === 'PENDING' ? 'border-amber-300 bg-amber-50/40 shadow-sm' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{req.teacherName}</span>
                      <span className="text-slate-500 ml-2">Requested Date: <strong>{req.date}</strong></span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                    <strong>Reason:</strong> {req.reason}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Supporting Doc:</span>
                      {req.supportingDocName ? (
                        <button
                          type="button"
                          onClick={() => {
                            const docUrl = req.supportingDocUrl || generateMedicalLeavePdf({
                              teacherName: req.teacherName,
                              teacherId: req.teacherId,
                              date: req.date,
                              reason: req.reason,
                              clinicName: 'Black Lion Specialized Hospital / Authorized Medical Facility',
                            });
                            openDocumentViewer({
                              title: 'Teacher Leave Supporting Document',
                              subtitle: `Absence Certification for ${req.teacherName} on ${req.date}`,
                              docName: req.supportingDocName,
                              docUrl: docUrl,
                              category: 'MEDICAL_LEAVE',
                              metadata: {
                                teacherName: req.teacherName,
                                leaveDate: req.date,
                                reason: req.reason,
                                reviewStatus: req.status,
                              },
                            });
                          }}
                          className="font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>{req.supportingDocName} (View PDF)</span>
                        </button>
                      ) : (
                        <span className="italic text-slate-400">None attached</span>
                      )}
                    </div>
                    <span>Affected Sections: <strong>{(Array.isArray(req.affectedSections) && req.affectedSections.length > 0 ? req.affectedSections.join(', ') : 'All Classes')}</strong></span>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                      <button
                        onClick={() => reviewTeacherDayOff(req.id, false)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition"
                      >
                        Reject Leave
                      </button>
                      <button
                        onClick={() => reviewTeacherDayOff(req.id, true)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Approve Leave & Broadcast Student Notice
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Lost ID Principal Override Download */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Lost Student ID Clearance & Principal Override Desk
              </h3>
              <p className="text-xs text-slate-500">
                "if the student loses his/her ID, finance must give them Clearance in the finance portal after which The ID becomes Downloadable (The principal has the authority to override this and Download the ID at any time.)"
              </p>
            </div>

            <div className="space-y-3">
              {lostIdCases.map((s) => {
                const req = s.lostIdRequest!;
                return (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                        <span className="font-mono text-blue-600 font-semibold">({s.id})</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          Grade {s.grade}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">Loss Reason: {req.reason}</p>
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${req.financeCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          Finance: {req.financeCleared ? 'Cleared' : 'Pending'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${req.libraryCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          Library: {req.libraryCleared ? 'Cleared' : 'Pending'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${req.homeroomTeacherCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          Homeroom: {req.homeroomTeacherCleared ? 'Cleared' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStudentForIdCard(s)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Inspect ID
                      </button>

                      <button
                        onClick={() => {
                          principalOverrideLostIdDownload(s.id);
                          alert(`Principal Override granted for ${s.fullName}. ID badge is now immediately downloadable.`);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Principal Override & Enable Download
                      </button>
                    </div>
                  </div>
                );
              })}

              {lostIdCases.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No pending lost ID replacement clearances.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST OFFICIAL SCHOOL NOTICE */}
      {activeTab === 'BROADCAST' && (
        <form onSubmit={handlePostNotice} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-xl space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Post Official School-Wide Announcement
          </h3>
          <p className="text-xs text-slate-500">
            "posts Notices regarding Academic year and General Topics. The principal has direct contact via portal with all Members of the system (including Students and Parents)"
          </p>

          {noticeSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notice broadcasted successfully to student and parent dashboards.</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Midterm Examination Schedule & Advisory"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Notice Category</label>
              <select
                value={noticeCategory}
                onChange={(e) => setNoticeCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Academic Calendar">Academic Calendar</option>
                <option value="Emergency Closure">Emergency Closure</option>
                <option value="General Event">General Event</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="ALL">Entire Academy (Students, Parents, Faculty)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="PARENTS">Parents Only</option>
                <option value="STAFF">Staff & Faculty Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notice Detailed Content *</label>
            <textarea
              rows={5}
              required
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Write official administrative announcement..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="urgCheck"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="urgCheck" className="text-xs font-semibold text-rose-700 cursor-pointer">
              Mark as Urgent Announcement (Displays red banner in student/parent portal)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            Publish Notice to Portals
          </button>
        </form>
      )}

      {/* TAB 3: ASSIGN HOMEROOM TEACHERS */}
      {activeTab === 'TEACHER_MANAGEMENT' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Principal Appointment of Homeroom Teachers
            </h3>
            <p className="text-xs text-slate-500">
              "NOTICE: Not all teachers are homeroom teachers (the principal assigns them)". Homeroom teachers have the exclusive mandate for section attendance and receive disciplinary alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec) => (
              <div key={sec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Classroom Section {sec.id}</span>
                  <span className="text-[11px] text-slate-500">Grade {sec.grade} {sec.stream ? `(${sec.stream})` : ''}</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Appointed Homeroom Teacher:
                  </label>
                  <select
                    value={sec.homeroomTeacherId || ''}
                    onChange={(e) => assignHomeroomTeacher(sec.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="">-- None Appointed --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] text-slate-400">
                  Current Status: {sec.homeroomTeacherName ? (
                    <strong className="text-emerald-700">{sec.homeroomTeacherName} assigned</strong>
                  ) : (
                    <span className="text-amber-700">Homeroom pending appointment</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCIPLINARY REVERSALS */}
      {activeTab === 'DISCIPLINARY_REVERSAL' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Principal Disciplinary Action Reversal Authority
            </h3>
            <p className="text-xs text-slate-500">
              "Disciplinary Actions (Reversable By the Principal)". Rescinding an action updates student disciplinary standing and removes penalty remarks from permanent academic transcripts.
            </p>
          </div>

          <div className="space-y-3">
            {disciplinaryActions.map((action) => (
              <div 
                key={action.id} 
                className={`p-4 rounded-xl border text-xs space-y-2 transition ${
                  action.reversedByPrincipal ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{action.studentName}</span>
                    <span className="font-mono text-slate-500 ml-2">({action.studentId})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    action.reversedByPrincipal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {action.reversedByPrincipal ? 'REVERSED' : 'ACTIVE DISCIPLINARY'}
                  </span>
                </div>

                <p className="text-slate-700">
                  <strong>Infraction:</strong> {action.incidentType} — "{action.description}"
                </p>
                <p className="text-slate-600">
                  <strong>Action Imposed:</strong> {action.actionTaken} (Recorded by: {action.counsellorName})
                </p>

                {!action.reversedByPrincipal ? (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={reversalReason}
                      onChange={(e) => setReversalReason(e.target.value)}
                      placeholder="Reason for Principal reversal..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                    <button
                      onClick={() => handleReverseDisciplinary(action.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shrink-0 shadow-sm"
                    >
                      Rescind & Reverse Penalty
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-900">
                    <strong>Reversed on {action.reversalDate}:</strong> "{action.reversalReason}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INSTITUTION SETTINGS (SCHOOL NAME & SPECIMEN FONT BRANDING) */}
      {activeTab === 'INSTITUTION_SETTINGS' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase tracking-wider">
                Institutional Identity & Typography
              </span>
              <h2 className="font-oskar-vintage text-xl font-bold text-slate-900 mt-1 tracking-wider">
                School Name & Brand Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your school's official legal name. Changes dynamically cascade to Student ID Cards, Finance Receipts, Transcripts, and Navigation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Live Preview Font:</span>
              <span className="px-3 py-1 bg-slate-900 text-white font-oskar-vintage text-xs tracking-wider rounded-lg shadow-sm">
                Specimen (Oskar Typeface Family)
              </span>
            </div>
          </div>

          {/* School Name Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Edit Official School Name
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School Name (Displayed on ID Cards, Receipts, Headers) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="e.g. Addis International Academy"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customNameInput.trim()) {
                        setSchoolName(customNameInput.trim());
                        setSavedNameNotice(true);
                        setTimeout(() => setSavedNameNotice(false), 4000);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    Save Name
                  </button>
                </div>
                {savedNameNotice && (
                  <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> School name successfully updated across the entire system!
                  </p>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Or select a common standard name:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Apex International Academy',
                    'St. Gabriel Model School',
                    'Addis Heritage Academy',
                    'Horizon High School',
                    'Excellence Academy'
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setCustomNameInput(preset);
                        setSchoolName(preset);
                        setSavedNameNotice(true);
                        setTimeout(() => setSavedNameNotice(false), 4000);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded text-xs font-medium text-slate-700 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Specimen Typography Showcase */}
            <div className="space-y-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Specimen Font Preview
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Paul Renner / Condensed Display
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Large Vintage Display</span>
                  <p className="font-oskar-vintage text-3xl font-bold tracking-widest text-white">
                    {schoolName.toUpperCase()}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Subheading & Badge Font</span>
                  <p className="font-oskar text-lg tracking-wider text-blue-300 font-semibold uppercase">
                    Excellence In Education • Est. 2026
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Numbers & Identification Specimen</span>
                  <p className="font-oskar text-2xl font-bold tracking-wider text-amber-400">
                    0 1 2 3 4 5 6 7 8 9 • GRADE 9-12
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  This custom specimen typography is applied across all institutional headings, ID badge headers, and financial watermarks while keeping the school name completely customizable.
                </p>
              </div>
            </div>

            {/* Master System Reset & Factory Disaster Recovery Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-oskar text-base font-bold text-slate-900 tracking-wide">
                      Master System Reset & Institutional Rollback
                    </h3>
                    <p className="text-xs text-slate-500">
                      Principal exclusive touch command to wipe all active changes and restore factory demonstration defaults.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl text-xs text-rose-950">
                  <p className="font-bold">Need a complete clean slate or term re-initialization?</p>
                  <p className="text-rose-800 text-[11px]">
                    This action immediately clears all registered scholars, grades, bank reconciliations, custom passwords, notices, and homeroom allocations back to pristine initial state.
                  </p>
                </div>

                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Everything Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 0: USER PROVISIONING & TEMPORARY PASSWORD MANAGEMENT */}
      {activeTab === 'USER_PROVISIONING' && (
        <UserProvisioningTab onOpenResetModal={() => setIsResetModalOpen(true)} />
      )}

      {/* Principal Touch: Master Reset Modal */}
      <MasterResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          setResetSuccessBanner(true);
          setTimeout(() => setResetSuccessBanner(false), 7000);
        }}
      />
    </div>
  );
};

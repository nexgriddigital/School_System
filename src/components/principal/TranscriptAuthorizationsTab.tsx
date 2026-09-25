import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Download, 
  Stamp, 
  PenTool, 
  Clock, 
  Filter, 
  Search, 
  BookOpen, 
  AlertCircle, 
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { generateTranscriptPdf, compileTranscriptGrades } from '../../utils/transcriptPdfGenerator';
import { DigitalSignatureModal } from '../common/DigitalSignatureModal';
import { DigitalSignatureInfo } from '../../types';

export const TranscriptAuthorizationsTab: React.FC = () => {
  const { 
    schoolName, 
    students, 
    grades, 
    transcriptRequests, 
    approveTranscriptRequest, 
    rejectTranscriptRequest,
    openDocumentViewer,
    currentUser
  } = useSchool();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Digital Signature Modal state for Transcript Approval
  const [signingRequest, setSigningRequest] = useState<{
    id: string;
    studentName: string;
    studentId: string;
    scope: 'FULL' | 'PARTIAL';
    requestedDate: string;
  } | null>(null);

  // Rejection modal state
  const [rejectModalReq, setRejectModalReq] = useState<{ id: string; studentName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Direct Academic Transcript Inspector State
  const [inspectorStudentId, setInspectorStudentId] = useState<string>(students[0]?.id || '');
  const [inspectorCutoffDate, setInspectorCutoffDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inspectorScope, setInspectorScope] = useState<'FULL' | 'PARTIAL'>('FULL');

  // Filtered requests
  const filteredRequests = (transcriptRequests || []).filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = req.studentName.toLowerCase().includes(term);
      const matchId = req.studentId.toLowerCase().includes(term);
      const matchReq = req.requesterName.toLowerCase().includes(term);
      if (!matchName && !matchId && !matchReq) return false;
    }
    return true;
  });

  const pendingCount = (transcriptRequests || []).filter(r => r.status === 'PENDING').length;
  const approvedCount = (transcriptRequests || []).filter(r => r.status === 'APPROVED').length;
  const rejectedCount = (transcriptRequests || []).filter(r => r.status === 'REJECTED').length;

  // Selected student for Inspector
  const inspectedStudent = students.find(s => s.id === inspectorStudentId) || students[0];
  const compiledInspectorData = inspectedStudent ? compileTranscriptGrades(
    inspectedStudent.id,
    inspectedStudent.grade,
    inspectedStudent.stream,
    inspectorCutoffDate,
    grades
  ) : null;

  const handleOpenPreview = (
    studentData: any,
    cutoffDate: string,
    scope: 'FULL' | 'PARTIAL',
    isTemporary: boolean = true,
    signature?: DigitalSignatureInfo,
    approverName?: string
  ) => {
    const pdfUrl = generateTranscriptPdf({
      student: studentData,
      schoolName,
      cutoffDate,
      scope,
      isTemporary,
      watermarkText: isTemporary ? 'Temporary Transcript' : undefined,
      grades,
      authorizedBy: approverName || currentUser?.name || 'Dr. O. Woldeyesus',
      authorizedSignature: signature,
    });

    openDocumentViewer({
      title: isTemporary ? 'Official Temporary Academic Transcript' : 'Official Sealed Academic Transcript',
      subtitle: `${studentData.fullName} (${studentData.id}) • Cutoff: ${cutoffDate}`,
      docName: `${studentData.id}_${isTemporary ? 'Temporary' : 'Official'}_Transcript_${cutoffDate}.pdf`,
      docUrl: pdfUrl,
      category: 'TRANSCRIPT',
      watermark: isTemporary ? 'Temporary Transcript' : undefined,
      metadata: {
        studentName: studentData.fullName,
        studentId: studentData.id,
        cutoffDate,
        scope,
        watermark: isTemporary ? 'Temporary Transcript' : undefined,
        signatures: signature ? [signature] : undefined,
      }
    });
  };

  const handleDownloadPdf = (
    studentData: any,
    cutoffDate: string,
    scope: 'FULL' | 'PARTIAL',
    isTemporary: boolean = true,
    signature?: DigitalSignatureInfo,
    approverName?: string
  ) => {
    const pdfUrl = generateTranscriptPdf({
      student: studentData,
      schoolName,
      cutoffDate,
      scope,
      isTemporary,
      watermarkText: isTemporary ? 'Temporary Transcript' : undefined,
      grades,
      authorizedBy: approverName || currentUser?.name || 'Dr. O. Woldeyesus',
      authorizedSignature: signature,
    });

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${studentData.id}_${isTemporary ? 'Temporary' : 'Official'}_Transcript_${cutoffDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Policy Directive & Context Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-800">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <Stamp className="w-3.5 h-3.5 text-blue-300" />
            <span>Academic Transcript Governance Protocol</span>
          </div>
          <h2 className="text-xl font-bold font-oskar-vintage text-white tracking-wide">
            Transcript Authorization & Clearance Desk
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Institutional policy strictly dictates: <em>&quot;For students and Parents before viewing the Transcript (Full or Partial) they must first request it, then when the principal approves the request they can download it (it should have a watermark across the page diagonally &apos;Temporary Transcript&apos;). Take the grades Entered till the Day requested, the rest should be &apos;NG&apos; Or &apos;No Grade&apos;.&quot;</em>
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: TRANSCRIPT REQUESTS QUEUE & APPROVAL                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Student & Parent Transcript Requests Queue</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  {pendingCount} Pending Action
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming student and guardian requests, verify cutoff dates, and authorize with digital signature.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                All ({transcriptRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'hover:text-amber-800'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('APPROVED')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-emerald-800'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('REJECTED')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'hover:text-rose-800'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scholar or ID..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const studentData = students.find(s => s.id === req.studentId);
            return (
              <div 
                key={req.id} 
                className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                  req.status === 'PENDING'
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                    : req.status === 'APPROVED'
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      G{req.studentGrade}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.studentName}</span>
                        <span className="font-mono text-blue-700 font-semibold text-xs">({req.studentId})</span>
                        {req.studentStream && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium">
                            {req.studentStream}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Requester: <strong>{req.requesterName}</strong> ({req.requesterRole}) • Submitted on {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold border border-slate-200">
                      Cutoff: {req.requestedDate}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Transcript Scope:</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {req.scope === 'FULL' ? 'Full Cumulative Official Transcript' : 'Partial Academic Progress Transcript'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Purpose / Reason:</span>
                    <span className="text-slate-800 italic text-xs">&quot;{req.reason}&quot;</span>
                  </div>
                </div>

                {/* Status & Approver Footnote */}
                {req.status === 'APPROVED' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Stamp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        Principal Authorized on {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : 'Today'} by {req.approvedBy || currentUser?.name || 'School Principal'}
                      </span>
                    </div>
                    {req.authorizedSignature && (
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                        Signature Hash: {req.authorizedSignature.verificationHash.slice(0, 16)}...
                      </span>
                    )}
                  </div>
                )}

                {req.status === 'REJECTED' && (
                  <div className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    <strong>Rejection Notice:</strong> {req.rejectionReason || 'Declined by School Administration.'}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetStudent = studentData || {
                          id: req.studentId,
                          fullName: req.studentName,
                          grade: req.studentGrade,
                          stream: req.studentStream,
                        };
                        handleOpenPreview(
                          targetStudent,
                          req.requestedDate,
                          req.scope,
                          true, // with diagonal watermark "Temporary Transcript"
                          req.authorizedSignature,
                          req.approvedBy
                        );
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Inspect transcript with diagonal Temporary Transcript watermark"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Preview Watermarked Transcript</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetStudent = studentData || {
                          id: req.studentId,
                          fullName: req.studentName,
                          grade: req.studentGrade,
                          stream: req.studentStream,
                        };
                        handleDownloadPdf(
                          targetStudent,
                          req.requestedDate,
                          req.scope,
                          true,
                          req.authorizedSignature,
                          req.approvedBy
                        );
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Download PDF directly with diagonal Temporary Transcript watermark"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalReq({ id: req.id, studentName: req.studentName });
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSigningRequest({
                            id: req.id,
                            studentName: req.studentName,
                            studentId: req.studentId,
                            scope: req.scope,
                            requestedDate: req.requestedDate,
                          });
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
                      >
                        <PenTool className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Authorize & Sign Request (Online Signature)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No transcript requests matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: ACADEMIC TRANSCRIPT INSPECTOR (CUTOFF & NG AUDIT)       */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Direct Scholar Academic Transcript Inspector</span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit the transcript of any scholar enrolled in the academy for any arbitrary cutoff date. Grades entered on or before the cutoff date are computed; unrecorded or future grades show as <strong>&quot;NG&quot; (No Grade)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (inspectedStudent) {
                  handleOpenPreview(
                    inspectedStudent,
                    inspectorCutoffDate,
                    inspectorScope,
                    true // temporary watermark
                  );
                }
              }}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Preview Watermarked PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (inspectedStudent) {
                  handleDownloadPdf(
                    inspectedStudent,
                    inspectorCutoffDate,
                    inspectorScope,
                    true
                  );
                }
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Download Transcript</span>
            </button>
          </div>
        </div>

        {/* Controls: Student selector, Cutoff date, Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Select Scholar to Audit:
            </label>
            <select
              value={inspectorStudentId}
              onChange={(e) => setInspectorStudentId(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.id}) - Grade {s.grade} {s.stream ? `[${s.stream}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Cutoff Date (Grades Entered &le; Date):
            </label>
            <input
              type="date"
              value={inspectorCutoffDate}
              onChange={(e) => setInspectorCutoffDate(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Transcript Scope:
            </label>
            <div className="flex items-center gap-2 mt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="inspectorScope"
                  checked={inspectorScope === 'FULL'}
                  onChange={() => setInspectorScope('FULL')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span>Full Cumulative</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer ml-2">
                <input
                  type="radio"
                  name="inspectorScope"
                  checked={inspectorScope === 'PARTIAL'}
                  onChange={() => setInspectorScope('PARTIAL')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span>Partial Term</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Subject Grades Table with NG calculation */}
        {compiledInspectorData && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <span className="text-indigo-950 font-bold">
                  Calculated Cumulative GPA: <span className="font-mono text-base text-indigo-700">{compiledInspectorData.calculatedGpa.toFixed(2)}</span>
                </span>
                <span className="text-slate-600">
                  Recorded Subjects: <strong className="text-emerald-700">{compiledInspectorData.recordedCount}</strong>
                </span>
                <span className="text-slate-600">
                  Pending (&quot;NG&quot;) Subjects: <strong className="text-amber-700">{compiledInspectorData.unrecordedCount}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Watermark on Download: &quot;Temporary Transcript&quot;
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Subject / Course</th>
                    <th className="py-2.5 px-3 text-center">Quiz (10%)</th>
                    <th className="py-2.5 px-3 text-center">Assessment (10%)</th>
                    <th className="py-2.5 px-3 text-center">Mid Exam (30%)</th>
                    <th className="py-2.5 px-3 text-center">Final Exam (50%)</th>
                    <th className="py-2.5 px-3 text-center">Total (100)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Transcript Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compiledInspectorData.subjectGrades.map((subj, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-900">{subj.subject}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{subj.quiz !== null ? subj.quiz : '-'}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{subj.assessment !== null ? subj.assessment : '-'}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{subj.midExam !== null ? subj.midExam : '-'}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{subj.finalExam !== null ? subj.finalExam : '-'}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                        {subj.total !== null ? `${subj.total}%` : '-'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        {subj.isRecorded ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {subj.letterGrade}
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            NG
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {subj.isRecorded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Recorded (&le; Cutoff)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                            No Grade (Pending Entry)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* DIGITAL SIGNATURE MODAL FOR TRANSCRIPT AUTHORIZATION               */}
      {/* ----------------------------------------------------------------- */}
      {signingRequest && (
        <DigitalSignatureModal
          isOpen={Boolean(signingRequest)}
          onClose={() => setSigningRequest(null)}
          title={`Authorize Academic Transcript: ${signingRequest.studentName}`}
          subtitle={`Student ID: ${signingRequest.studentId} • Scope: ${signingRequest.scope} • Cutoff Date: ${signingRequest.requestedDate}`}
          signatoryRole="PRINCIPAL"
          defaultSignerName={currentUser?.name || 'Dr. O. Woldeyesus'}
          defaultSignerTitle="Executive Principal & Headmaster"
          onSignComplete={(signature) => {
            approveTranscriptRequest(signingRequest.id, signature);
            setSigningRequest(null);
          }}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* REJECT MODAL FOR TRANSCRIPT REQUEST                                */}
      {/* ----------------------------------------------------------------- */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
              Decline Transcript Request
            </h4>
            <p className="text-xs text-slate-600">
              Please specify the administrative reason for declining the transcript request for <strong>{rejectModalReq.studentName}</strong>:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unreconciled tuition balance; please contact the bursar's office before re-requesting."
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectTranscriptRequest(rejectModalReq.id, rejectReason || 'Administrative request hold.');
                  setRejectModalReq(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

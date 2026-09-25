import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  generateDepositSlipPdf, 
  generateReportCardPdf, 
  fileToDataUrl 
} from '../../utils/pdfGenerator';
import { 
  CreditCard, 
  Award, 
  CheckSquare, 
  ShieldAlert, 
  MessageSquare, 
  Receipt, 
  Send, 
  KeyRound, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Megaphone,
  FileText,
  Eye,
  Download,
  Sparkles,
  Clock,
  Stamp,
  FileCheck
} from 'lucide-react';
import { TelegramInbox } from '../common/TelegramInbox';
import { TranscriptRequest } from '../../types';
import { generateTranscriptPdf } from '../../utils/transcriptPdfGenerator';

export const ParentView: React.FC = () => {
  const { 
    currentParentStudent, 
    students,
    activeStudentId,
    invoices, 
    grades, 
    attendanceRecords, 
    disciplinaryActions, 
    notices, 
    submitPaymentSlip, 
    setSelectedInvoiceForReceipt, 
    requestPasswordReset, 
    teachers,
    schoolName,
    openDocumentViewer,
    transcriptRequests,
    requestTranscript
  } = useSchool();

  const student = currentParentStudent || students?.find(s => s.id === activeStudentId) || students?.[0];

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEES' | 'ACADEMICS' | 'TRANSCRIPT' | 'DISCIPLINARY' | 'COMMUNICATION'>('OVERVIEW');

  // Guardian Transcript Request Form State
  const [transcriptScope, setTranscriptScope] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [transcriptCutoffDate, setTranscriptCutoffDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transcriptReason, setTranscriptReason] = useState('Guardian Formal Academic Evaluation & College Application');
  const [transcriptSuccess, setTranscriptSuccess] = useState(false);

  // Bank Deposit Slip Upload form
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [slipReference, setSlipReference] = useState('');
  const [slipFileName, setSlipFileName] = useState('cbe_deposit_slip.pdf');
  const [slipDataUrl, setSlipDataUrl] = useState<string>('');
  const [slipSuccess, setSlipSuccess] = useState(false);

  // Password reset state
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!student) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        No linked student record found for this guardian account.
      </div>
    );
  }

  const studentInvoices = invoices.filter(i => i.studentId === student.id);
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
  const studentDisciplinary = disciplinaryActions.filter(d => d.studentId === student.id);

  const handleUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !slipReference) return;

    const targetInv = invoices.find(i => i.id === selectedInvoiceId);
    const finalSlipUrl = slipDataUrl || generateDepositSlipPdf({
      studentName: student.fullName,
      studentId: student.id,
      invoiceTitle: targetInv?.title || 'Academy School Fee',
      amount: targetInv?.amount || 15000,
      bankReference: slipReference,
      bankName: 'Commercial Bank of Ethiopia (CBE)',
      date: new Date().toISOString().split('T')[0],
    });

    submitPaymentSlip(selectedInvoiceId, slipReference, slipFileName, finalSlipUrl);
    setSlipSuccess(true);
    setSlipReference('');
    setSlipDataUrl('');
    setTimeout(() => setSlipSuccess(false), 4500);
  };

  const handleRequestPasswordReset = () => {
    requestPasswordReset(student.id, 'PARENT', `${student.parents.fatherName || 'Parent'} (Parent)`);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Parent Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-oskar-vintage text-2xl font-bold shadow-md">
              P
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs uppercase tracking-wider">
                Parent & Guardian Portal
              </span>
              <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
                Guardian: {student.parents.fatherName || student.parents.motherName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring Scholar: <strong className="text-slate-800">{student.fullName}</strong> ({student.id} • Grade {student.grade}) • 
                Fee Ref: <span className="font-mono font-bold text-blue-600">{student.accountNumber}</span>
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
              Portal Overview
            </button>

            <button
              onClick={() => setActiveTab('FEES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'FEES' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              Tuition & Receipts
            </button>

            <button
              onClick={() => setActiveTab('ACADEMICS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ACADEMICS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />
              Grades & Attendance
            </button>

            <button
              onClick={() => setActiveTab('TRANSCRIPT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'TRANSCRIPT' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Official Transcript
            </button>

            <button
              onClick={() => setActiveTab('DISCIPLINARY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'DISCIPLINARY' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
              Disciplinary Notices ({studentDisciplinary.length})
            </button>

            <button
              onClick={() => setActiveTab('COMMUNICATION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'COMMUNICATION' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              Teachers, Principal & Offices Chatbot
            </button>
          </div>
        </div>

        {/* Portal Information */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>
            Active Guardian Portal • Primary Contact: {student.parents.fatherPhone || student.parents.motherPhone || 'Verified Contact'}
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Verified Direct Family Line
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & NOTICES */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements & Payment Due Notices */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                School Notices & Payment Due Bulletins
              </h3>
              <span className="text-xs text-slate-500">For Parents & Guardians</span>
            </div>

            <div className="space-y-3">
              {notices.filter(n => n.targetAudience === 'ALL' || n.targetAudience === 'PARENTS').map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border text-xs space-y-1.5 transition ${
                    n.isUrgent ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Issued By: <strong>{n.postedBy}</strong> ({n.postedRole})</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold">
                      {n.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-oskar-vintage text-sm font-bold text-slate-900">
                Child's Enrollment Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scholar Name:</span>
                  <span className="font-bold text-slate-800">{student.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Grade:</span>
                  <span className="font-bold text-slate-800">Grade {student.grade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Class Section:</span>
                  <span className="font-bold text-blue-600">{student.sectionId || 'Pending Allocation'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Fee Account Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{student.accountNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Registration Status:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    {student.registrationStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEES & RECEIPTS (WITH BANK SLIP UPLOAD & WATERMARKED RECEIPT) */}
      {activeTab === 'FEES' && (
        <div className="space-y-6">
          {/* Account instructions */}
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Official School Bank Account Reference</span>
              <p className="font-mono text-2xl font-bold text-blue-950 mt-0.5">{student.accountNumber}</p>
              <p className="text-blue-800 mt-1">
                When depositing via Commercial Bank of Ethiopia (CBE) or Awash Bank, write <strong className="font-mono">{student.accountNumber}</strong> in the reason/reference field.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoices List */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                School Fee Ledger ({studentInvoices.length})
              </h3>

              <div className="space-y-3">
                {studentInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{inv.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 
                          inv.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Amount: <strong className="font-mono text-slate-900 text-sm">{inv.amount.toLocaleString()} ETB</strong> • Due: {inv.dueDate}
                      </p>
                      {inv.paymentReference && (
                        <p className="font-mono text-[11px] text-blue-600 mt-0.5">
                          Bank Reference Slip: {inv.paymentReference}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      {inv.status === 'PAID' ? (
                        <button
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Receipt className="w-4 h-4" />
                          Download Paid Receipt (Watermarked)
                        </button>
                      ) : (
                        <div className="flex flex-col sm:items-end gap-1.5">
                          <span className="text-xs font-semibold text-slate-500">
                            {inv.status === 'PENDING_APPROVAL' ? 'Reconciliation In Progress' : 'Awaiting Payment'}
                          </span>
                          {inv.slipName && (
                            <button
                              onClick={() => {
                                const docUrl = inv.slipUrl || generateDepositSlipPdf({
                                  studentName: student.fullName,
                                  studentId: student.id,
                                  invoiceTitle: inv.title,
                                  amount: inv.amount,
                                  bankReference: inv.paymentReference || 'FT-CBE-PENDING',
                                  bankName: 'Commercial Bank of Ethiopia (CBE)',
                                  date: inv.dueDate,
                                });
                                openDocumentViewer({
                                  title: 'Bank Deposit Slip Voucher',
                                  subtitle: `Payment Record for ${inv.title}`,
                                  docName: inv.slipName || 'bank_deposit_slip.pdf',
                                  docUrl: docUrl,
                                  category: 'DEPOSIT_SLIP',
                                  metadata: {
                                    studentName: student.fullName,
                                    studentId: student.id,
                                    amount: `${inv.amount.toLocaleString()} ETB`,
                                    referenceNumber: inv.paymentReference || 'N/A',
                                    uploadedDate: 'Uploaded in Parent Portal',
                                  },
                                });
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Uploaded Slip PDF
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Payment Slip Form */}
            <form onSubmit={handleUploadSlip} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Submit Bank Deposit Slip
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded slips are saved as verified PDFs in the portal and crosschecked against bank statements.
                </p>
              </div>

              {slipSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deposit slip PDF uploaded & saved to portal! Finance office notified for reconciliation.</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Invoice *</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">-- Choose Fee --</option>
                  {studentInvoices.filter(i => i.status !== 'PAID').map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.title} ({inv.amount.toLocaleString()} ETB)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bank Reference Number *</label>
                <input
                  type="text"
                  required
                  value={slipReference}
                  onChange={(e) => setSlipReference(e.target.value)}
                  placeholder="e.g. FT26257WJ83P or Awash-88219"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Attach Deposit Slip (PDF / Image)</label>
                <label className="border border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center bg-slate-50 group">
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mb-1 transition" />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-full px-2">
                    {slipFileName}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Click to browse PDF or photo voucher
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSlipFileName(file.name);
                        try {
                          const dataUrl = await fileToDataUrl(file);
                          setSlipDataUrl(dataUrl);
                        } catch (err) {
                          console.error('File read error', err);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Instant CBE PDF Voucher Generator & Preview */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Generate Official Bank Deposit Slip PDF</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetInv = invoices.find(i => i.id === selectedInvoiceId) || studentInvoices[0];
                      const refNum = slipReference || `FT${Math.floor(10000000 + Math.random() * 90000000)}`;
                      if (!slipReference) setSlipReference(refNum);
                      const generated = generateDepositSlipPdf({
                        studentName: student.fullName,
                        studentId: student.id,
                        invoiceTitle: targetInv?.title || 'Tuition Fee Payment',
                        amount: targetInv?.amount || 15000,
                        bankReference: refNum,
                        bankName: 'Commercial Bank of Ethiopia (CBE)',
                        date: new Date().toISOString().split('T')[0],
                      });
                      setSlipDataUrl(generated);
                      setSlipFileName(`CBE_Deposit_Slip_${refNum}.pdf`);
                    }}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const targetInv = invoices.find(i => i.id === selectedInvoiceId) || studentInvoices[0];
                      const docUrl = slipDataUrl || generateDepositSlipPdf({
                        studentName: student.fullName,
                        studentId: student.id,
                        invoiceTitle: targetInv?.title || 'Tuition Fee Payment',
                        amount: targetInv?.amount || 15000,
                        bankReference: slipReference || 'FT-DEMO-REF',
                        bankName: 'Commercial Bank of Ethiopia (CBE)',
                        date: new Date().toISOString().split('T')[0],
                      });
                      openDocumentViewer({
                        title: 'Bank Deposit Slip Preview',
                        subtitle: `Payment Voucher for ${student.fullName}`,
                        docName: slipFileName,
                        docUrl: docUrl,
                        category: 'DEPOSIT_SLIP',
                        metadata: {
                          studentName: student.fullName,
                          studentId: student.id,
                          amount: `${(targetInv?.amount || 15000).toLocaleString()} ETB`,
                          referenceNumber: slipReference || 'FT-DEMO-REF',
                          uploadedDate: new Date().toISOString().split('T')[0],
                        },
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview PDF
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Upload & Save Bank Slip to Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMICS & ATTENDANCE */}
      {activeTab === 'ACADEMICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grades */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Academic Performance Report Card
                </h3>
                <p className="text-[11px] text-slate-500">Official term transcript and GPA record</p>
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
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <FileText className="w-3.5 h-3.5" />
                Download Report Card PDF
              </button>
            </div>

            <div className="space-y-2">
              {studentGrades.map((g) => (
                <div key={g.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{g.subject}</p>
                    <p className="text-[11px] text-slate-500">Instructor: {g.teacherName}</p>
                    <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                      <span>Quiz: {g.quiz}/20</span>
                      <span>Assess: {g.assessment}/20</span>
                      <span>Mid: {g.midExam}/30</span>
                      <span>Final: {g.finalExam}/40</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-blue-600 block">{g.total} / 110</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                      Grade {g.letterGrade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Attendance Log
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
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
            </div>
          </div>
        </div>
      )}

      {/* TAB: OFFICIAL TRANSCRIPT REQUEST & DOWNLOAD (GUARDIAN PORTAL) */}
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
                    Guardian Academic Transcript Portal
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Official cumulative and partial transcripts with executive Principal authorization &amp; &quot;Temporary Transcript&quot; security watermark.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-800/90 text-indigo-200 rounded-lg text-xs font-mono border border-indigo-700">
                Principal Executive Approval Required
              </span>
            </div>

            <div className="p-3.5 bg-indigo-950/60 rounded-xl border border-indigo-800/70 text-xs text-indigo-100 flex items-start gap-2.5">
              <Stamp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Policy Mandate:</strong> Transcripts calculate subject grades strictly up to your requested cutoff date. All unfinalized subject components or subsequent terms will be marked as <strong>&quot;NG&quot; (No Grade)</strong>. Guardians must lodge a request for the Executive Principal&apos;s review. Once approved and digitally authorized, the transcript can be viewed and downloaded carrying the permanent diagonal <em>&quot;Temporary Transcript&quot;</em> watermark.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Request Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Request Transcript for {student.fullName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select transcript scope and grade cutoff date.
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
                    requestedByRole: 'PARENT',
                    requesterName: student.parents.fatherName || student.parents.motherName || 'Verified Guardian',
                    requesterId: `P-${student.id}`,
                    scope: transcriptScope,
                    requestedDate: transcriptCutoffDate,
                    reason: transcriptReason,
                  });
                  setTranscriptSuccess(true);
                  setTimeout(() => setTranscriptSuccess(false), 4500);
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
                    placeholder="e.g., Transfer application, Scholarship, Visa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request to Office of the Principal
                </button>

                {transcriptSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Request submitted! As soon as the Principal approves your application, your watermarked transcript can be viewed and downloaded below.
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
                      Guardian Transcript Requests &amp; Records
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Approvals from the Principal for {student.fullName}.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
                    {transcriptRequests.filter(r => r.studentId === student.id).length} Requests
                  </span>
                </div>

                {transcriptRequests.filter(r => r.studentId === student.id).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs">No transcript requests filed for this student yet.</p>
                    <p className="text-[11px] text-slate-400">Submit a request on the left to obtain the official document.</p>
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
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                                  Requested by: {req.requestedByRole === 'PARENT' ? 'Guardian' : 'Student'}
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
                                  Approved &amp; Ready
                                </span>
                              )}
                              {req.status === 'REJECTED' && (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-full font-bold text-[10px] border border-rose-300">
                                  Rejected: {req.rejectionReason || 'Contact School'}
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
                                      docName: `${student.id}_Guardian_Temporary_Transcript_${req.requestedDate}.pdf`,
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

              {/* Real-time Cutoff Grade Simulation Table for Parent */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-oskar-vintage text-xs font-bold uppercase tracking-wider text-slate-700">
                    Grade Breakdown for Cutoff Date: {transcriptCutoffDate}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Official Grade Status: Entered &le; Cutoff or &quot;NG&quot;
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-3">Instructor</th>
                        <th className="py-2 px-3 text-center">Date Logged</th>
                        <th className="py-2 px-3 text-center">Score</th>
                        <th className="py-2 px-3 text-center">Transcript Mark</th>
                        <th className="py-2 px-3 text-center">Transcript Status</th>
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
      {activeTab === 'DISCIPLINARY' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
            Official Disciplinary Records & Counselor Advisory
          </h3>
          <p className="text-xs text-slate-500">
            Notices regarding behavior or infractions recorded by the Counselor or Administration.
          </p>

          <div className="space-y-3">
            {studentDisciplinary.map((d) => (
              <div 
                key={d.id} 
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  d.reversedByPrincipal ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{d.incidentType}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.reversedByPrincipal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {d.reversedByPrincipal ? 'REVERSED BY PRINCIPAL' : 'ACTIVE RECORD'}
                  </span>
                </div>

                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {d.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Action: <strong>{d.actionTaken}</strong></span>
                  <span>Recorded: {d.incidentDate}</span>
                </div>

                {d.reversedByPrincipal && (
                  <p className="text-[11px] text-emerald-900 font-semibold pt-1">
                    Principal Reversal Note: "{d.reversalReason}"
                  </p>
                )}
              </div>
            ))}

            {studentDisciplinary.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                ✓ No disciplinary records on file. Scholar maintains exemplary conduct standing.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DIRECT PORTAL MESSAGING (TELEGRAM INBOX) */}
      {activeTab === 'COMMUNICATION' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Chat with Kid's Teachers, Principal & All Other Offices
              </h3>
              <p className="text-xs text-slate-500">
                Direct Telegram SIS messaging with your child's teachers, Principal's Office, Finance, Registrar, Academic Program Office, and the 24/7 Smart School AI Assistant.
              </p>
            </div>
            <span className="px-3 py-1 bg-sky-50 text-[#2481cc] border border-sky-200 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#2481cc] animate-pulse" />
              Telegram Web SIS Active
            </span>
          </div>

          <TelegramInbox mode="PARENT" preselectedStudentId={student.id} />
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { generateDepositSlipPdf } from '../../utils/pdfGenerator';
import { 
  CreditCard, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  Receipt, 
  Search, 
  Send, 
  ShieldCheck, 
  LogOut, 
  AlertTriangle,
  Eye,
  FileText,
  Mail,
  History,
  Users,
  Download,
  RotateCcw,
  BadgeCheck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { BankStatementRow, Invoice } from '../../types';
import { UrgentFeeAlertModal } from './UrgentFeeAlertModal';
import { BatchFeeAlertModal } from './BatchFeeAlertModal';
import { ParentEmailLogsModal } from '../common/ParentEmailLogsModal';
import { ExportDataModal } from '../common/ExportDataModal';
import { exportInvoicesCsv, exportBankStatementsCsv } from '../../utils/csvExport';

export const FinanceView: React.FC = () => {
  const { 
    invoices, 
    approvePayment, 
    setSelectedInvoiceForReceipt, 
    bulkReconcileBankStatement, 
    reconcileSingleBankStatement,
    resetBankStatementsDemoFeed,
    bankStatements,
    students,
    grantLeavingClearance,
    clearLostIdFinance,
    postNotice,
    openDocumentViewer,
    currentUser
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'BULK_RECONCILE' | 'CLEARANCES'>('INVOICES');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showExportModal, setShowExportModal] = useState(false);

  // Modals for automated parent email alerts via Gmail
  const [selectedInvoiceForAlert, setSelectedInvoiceForAlert] = useState<Invoice | null>(null);
  const [showBatchAlertModal, setShowBatchAlertModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Bulk Reconciliation simulation feedback
  const [reconciliationResult, setReconciliationResult] = useState<{ matchedCount: number; approvedTotal: number } | null>(null);
  const [resetFeedNotification, setResetFeedNotification] = useState<string | null>(null);

  // Payment notice broadcaster modal
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeGrade, setNoticeGrade] = useState('ALL');
  const [noticeMessage, setNoticeMessage] = useState('Gentle reminder to all parents: Term 1 Tuition fee is due on September 30. Please ensure you cite your student account number on your bank deposit slip.');

  const handleSendPaymentNotice = (e: React.FormEvent) => {
    e.preventDefault();
    postNotice({
      title: `Payment Due Notice - Academic Term 1 (Grade ${noticeGrade})`,
      category: 'Payment Due',
      content: noticeMessage,
      postedBy: currentUser?.name ? `${currentUser.name} (${currentUser.title || 'Finance'})` : 'Finance & Accounts Division',
      postedRole: 'Finance',
      targetAudience: 'PARENTS',
      isUrgent: true,
    });
    alert('Payment Due Notice successfully dispatched to Student & Parent Portals!');
    setShowNoticeModal(false);
  };

  const handleSimulateBankStatementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading statement and performing cross-check
    const res = bulkReconcileBankStatement();
    setReconciliationResult(res);
  };

  const handleRunReconciliation = () => {
    const res = bulkReconcileBankStatement();
    setReconciliationResult(res);
  };

  // Bank Statement Reconciliation Metrics
  const totalBankStatements = bankStatements.length;
  const reconciledBankStatements = bankStatements.filter(b => b.status === 'RECONCILED');
  const matchedPendingBankStatements = bankStatements.filter(b => b.status === 'MATCHED_PENDING');
  const unmatchedBankStatements = bankStatements.filter(b => b.status === 'UNMATCHED');

  const reconciledCount = reconciledBankStatements.length;
  const matchedPendingCount = matchedPendingBankStatements.length;
  const unmatchedCount = unmatchedBankStatements.length;

  const reconciliationRate = totalBankStatements > 0 
    ? Math.round((reconciledCount / totalBankStatements) * 100) 
    : 0;
  const matchReadyRate = totalBankStatements > 0 
    ? Math.round((matchedPendingCount / totalBankStatements) * 100) 
    : 0;
  const unmatchedRate = totalBankStatements > 0 
    ? Math.round((unmatchedCount / totalBankStatements) * 100) 
    : 0;

  const totalBankAmount = bankStatements.reduce((sum, b) => sum + b.amount, 0);
  const reconciledAmount = reconciledBankStatements.reduce((sum, b) => sum + b.amount, 0);
  const matchedPendingAmount = matchedPendingBankStatements.reduce((sum, b) => sum + b.amount, 0);
  const unmatchedAmount = unmatchedBankStatements.reduce((sum, b) => sum + b.amount, 0);
  const amountReconciledPercent = totalBankAmount > 0 
    ? Math.round((reconciledAmount / totalBankAmount) * 100) 
    : 0;

  // Deposit slip verification metrics
  const invoicesWithSlip = invoices.filter(i => !!i.paymentSlipUrl || !!i.paymentReference);
  const invoicesSlipApproved = invoicesWithSlip.filter(i => i.status === 'PAID');
  const slipVerificationRate = invoicesWithSlip.length > 0 
    ? Math.round((invoicesSlipApproved.length / invoicesWithSlip.length) * 100) 
    : 0;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.paymentReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Finance Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold uppercase tracking-wider">
              Bursar & Finance Office
            </span>
            <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
              Tuition, Payments & Bank Reconciliation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unique student fee account numbers, automated statement cross-checking, leaving clearances, and watermarked receipts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'INVOICES' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Fee Ledger & Invoices ({invoices.length})
            </button>

            <button
              onClick={() => setActiveTab('BULK_RECONCILE')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'BULK_RECONCILE' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Bulk Bank Statement Cross-Check
            </button>

            <button
              onClick={() => setActiveTab('CLEARANCES')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'CLEARANCES' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Department Clearances
            </button>

            <button
              onClick={() => setShowNoticeModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast Notice
            </button>

            <button
              onClick={() => setShowBatchAlertModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Send batch urgent fee deadline alerts to all unpaid parents via Gmail"
            >
              <Mail className="w-3.5 h-3.5" />
              Bulk Urgent Fee Alerts (Gmail)
            </button>

            <button
              onClick={() => setShowLogsModal(true)}
              className="px-3.5 py-2 bg-slate-900 text-blue-300 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Audit parent email dispatch logs"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              Email Audit Logs
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
              title="Export financial records, filtered invoices or bank statements to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Data (CSV)
            </button>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Collected</p>
            <p className="font-oskar-vintage text-2xl font-bold text-emerald-900 mt-0.5 font-mono">
              {totalCollected.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Outstanding Receivable</p>
            <p className="font-oskar-vintage text-2xl font-bold text-amber-900 mt-0.5 font-mono">
              {pendingAmount.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Bank Reconciled Records</p>
            <p className="font-oskar-vintage text-2xl font-bold text-blue-900 mt-0.5">
              {bankStatements.filter(b => b.status === 'RECONCILED').length} Records
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unpaid Invoices</p>
            <p className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-0.5">
              {invoices.filter(i => i.status !== 'PAID').length} Students
            </p>
          </div>
        </div>

        {/* Institutional Bank Statement Reconciliation Progress Bar */}
        <div className="mt-5 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 tracking-wide">
                    Bank Statement Reconciliation & Ledger Cross-Check Progress
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reconciliationRate === 100
                      ? 'bg-emerald-100 text-emerald-800'
                      : reconciliationRate >= 50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {reconciliationRate}% Reconciled
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {reconciledCount} of {totalBankStatements} Transactions Cleared • {reconciledAmount.toLocaleString()} ETB of {totalBankAmount.toLocaleString()} ETB ({amountReconciledPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {matchedPendingCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('BULK_RECONCILE')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    Open Desk ({matchedPendingCount} Ready)
                  </button>
                  <button
                    type="button"
                    onClick={handleRunReconciliation}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Batch Approve Matches
                  </button>
                </>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bank Ledger Reconciled
                </span>
              )}
            </div>
          </div>

          {/* Segmented Visual Animated Progress Bar Track */}
          <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reconciliationRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-emerald-500 rounded-l-full"
              title={`Reconciled: ${reconciliationRate}%`}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchReadyRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-blue-500"
              title={`Match Ready: ${matchReadyRate}%`}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${unmatchedRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-slate-300 rounded-r-full"
              title={`Manual Review: ${unmatchedRate}%`}
            />
          </div>

          {/* Reconciliation Sub-Metrics Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Reconciled</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {reconciledCount}/{totalBankStatements} ({reconciledAmount.toLocaleString()} ETB)
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Match Ready</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {matchedPendingCount}/{totalBankStatements} ({matchedPendingAmount.toLocaleString()} ETB)
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-600 font-medium">Manual Review</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {unmatchedCount}/{totalBankStatements} ({unmatchedAmount.toLocaleString()} ETB)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NOTICE DISPATCH MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <form onSubmit={handleSendPaymentNotice} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900">
              Dispatch Payment Due Notice
            </h3>
            <p className="text-xs text-slate-500">
              "Each student & Parents Will be Given Notices when payments are due." Broadcasts alerts to parent dashboards.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Grade Audience</label>
              <select
                value={noticeGrade}
                onChange={(e) => setNoticeGrade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="ALL">All Grades (9, 10, 11, 12)</option>
                <option value="9">Grade 9 Freshmen</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12 Seniors</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Notice Message Text</label>
              <textarea
                rows={4}
                required
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow"
              >
                Broadcast Notice Now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: INVOICES & LEDGER */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          {/* Tuition Deposit Slip Cross-Check & Verification Progress */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-oskar-vintage text-xs font-bold text-slate-900 tracking-wide">
                    Bank Deposit Slip Verification & Approval Progress
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    slipVerificationRate === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {slipVerificationRate}% Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {invoicesSlipApproved.length} of {invoicesWithSlip.length} student deposit slips cross-referenced and cleared by finance bursars
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-56">
              <div className="flex-1">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${slipVerificationRate}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${slipVerificationRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                {invoicesSlipApproved.length}/{invoicesWithSlip.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student, account no, bank ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">All Invoices</option>
                <option value="PAID">Paid Only</option>
                <option value="PENDING_APPROVAL">Pending Bank Slip Verification</option>
                <option value="UNPAID">Unpaid / Due</option>
              </select>

              <button
                type="button"
                onClick={() => exportInvoicesCsv(filteredInvoices, { filterLabel: filterStatus !== 'ALL' ? filterStatus : 'Ledger' })}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                title={`Export ${filteredInvoices.length} currently filtered invoices as CSV`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                Export CSV ({filteredInvoices.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] bg-slate-50">
                  <th className="py-3 px-3">Student & Account Ref</th>
                  <th className="py-3 px-3">Fee Title</th>
                  <th className="py-3 px-3">Amount & Due Date</th>
                  <th className="py-3 px-3">Payment Reference</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions & Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{inv.studentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-blue-600 font-bold">{inv.accountNumber}</span>
                        <span className="text-slate-400 text-[10px] font-mono">({inv.studentId})</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{inv.title}</span>
                      <span className="block text-[10px] text-slate-400">Grade {inv.grade}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block text-sm">
                        {inv.amount.toLocaleString()} ETB
                      </span>
                      <span className="text-[10px] text-slate-500">Due: {inv.dueDate}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="text-slate-700 block">{inv.paymentReference || 'No Ref'}</span>
                      {inv.slipName && (
                        <button
                          type="button"
                          onClick={() => {
                            const docUrl = inv.slipUrl || generateDepositSlipPdf({
                              studentName: inv.studentName,
                              studentId: inv.studentId,
                              invoiceTitle: inv.title,
                              amount: inv.amount,
                              bankReference: inv.paymentReference || 'N/A',
                              bankName: 'Commercial Bank of Ethiopia (CBE)',
                              date: inv.dueDate,
                            });
                            openDocumentViewer({
                              title: 'Bank Deposit Slip Verification',
                              subtitle: `Voucher for ${inv.studentName} (${inv.title})`,
                              docName: inv.slipName || 'deposit_slip.pdf',
                              docUrl: docUrl,
                              category: 'DEPOSIT_SLIP',
                              metadata: {
                                studentName: inv.studentName,
                                studentId: inv.studentId,
                                amount: `${inv.amount.toLocaleString()} ETB`,
                                bankReference: inv.paymentReference || 'N/A',
                                status: inv.status,
                              },
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] font-bold underline flex items-center gap-1 mt-1 transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>Slip: {inv.slipName}</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {inv.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Paid & Cleared
                        </span>
                      ) : inv.status === 'PENDING_APPROVAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase tracking-wider">
                          Slip Uploaded (Verify)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase tracking-wider">
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right space-y-1">
                      {inv.status === 'PAID' ? (
                        <button
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto border border-emerald-200 transition cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          View Receipt (Watermarked)
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => approvePayment(inv.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition block cursor-pointer"
                          >
                            Approve Payment
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForAlert(inv)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Send urgent fee deadline email notification to scholar's parents via Gmail"
                          >
                            <Mail className="w-3 h-3 text-amber-700" />
                            {inv.parentAlertSent ? 'Resend Gmail Alert' : 'Urgent Parent Alert (Gmail)'}
                          </button>

                          {inv.parentAlertSent && (
                            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Notice sent via Gmail
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BULK BANK STATEMENT CROSS-CHECK */}
      {activeTab === 'BULK_RECONCILE' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
                Bulk Bank Statement Cross-Checking Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                "Bulk approvals Can be made by uploading a bank statement of the school. (The system will approve each Student's payment by crosschecking The reference Number they specified with the attached slip)"
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                id="reset-bank-feed-btn"
                type="button"
                onClick={() => {
                  resetBankStatementsDemoFeed();
                  setReconciliationResult(null);
                  setResetFeedNotification('Demo bank feed & linked test invoices successfully reset to un-reconciled testing state.');
                  setTimeout(() => setResetFeedNotification(null), 4000);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-slate-200"
                title="Reset bank statements to initial state with mixed pending transactions to test the reconciliation progress workflow"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                Reset Feed for Testing
              </button>
            </div>
          </div>

          {/* Feedback banner when feed is reset */}
          {resetFeedNotification && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{resetFeedNotification}</span>
              </div>
              <button 
                onClick={() => setResetFeedNotification(null)}
                className="text-blue-500 hover:text-blue-800 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Visual Bank Statement Reconciliation Task Completion Tracker */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                      Bank Reconciliation Task Completion
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      reconciliationRate === 100
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {reconciliationRate}% Reconciled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {reconciledCount} of {totalBankStatements} bank transaction records cleared & matched with student tuition invoices
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {reconciledAmount.toLocaleString()} ETB <span className="text-slate-400 font-normal text-xs">/ {totalBankAmount.toLocaleString()} ETB</span>
                </span>
              </div>
            </div>

            {/* Visual Animated Segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reconciliationRate}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 rounded-l-full relative"
                  title={`Reconciled: ${reconciliationRate}%`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchReadyRate}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-blue-500 relative"
                  title={`Match Ready: ${matchReadyRate}%`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unmatchedRate}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-slate-300 rounded-r-full relative"
                  title={`Manual Review: ${unmatchedRate}%`}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>0% Ingested</span>
                <span>{matchReadyRate + reconciliationRate}% Auto-Matched</span>
                <span>100% Fully Cleared</span>
              </div>
            </div>

            {/* 3 Interactive KPI Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Card 1: Reconciled */}
              <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Reconciled</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">{reconciliationRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${reconciliationRate}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-300" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{reconciledCount} transactions</span>
                  <span className="font-mono font-semibold text-slate-700">{reconciledAmount.toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Card 2: Match Ready */}
              <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Match Ready</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-700">{matchReadyRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${matchReadyRate}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-300" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{matchedPendingCount} transactions</span>
                  <span className="font-mono font-semibold text-slate-700">{matchedPendingAmount.toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Card 3: Manual Review */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">Manual Review</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600">{unmatchedRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${unmatchedRate}%` }} className="h-full bg-slate-400 rounded-full transition-all duration-300" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{unmatchedCount} transactions</span>
                  <span className="font-mono font-semibold text-slate-700">{unmatchedAmount.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Sequential 3-Step Verification Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  ✓
                </span>
                <div>
                  <p className="font-bold text-slate-800 text-[11px]">1. Ingest Bank Statement</p>
                  <p className="text-[10px] text-slate-500">{totalBankStatements} rows parsed (100%)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                  matchReadyRate + reconciliationRate === 100
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {matchReadyRate + reconciliationRate === 100 ? '✓' : '2'}
                </span>
                <div>
                  <p className="font-bold text-slate-800 text-[11px]">2. Cross-Check Reference</p>
                  <p className="text-[10px] text-slate-500">{reconciledCount + matchedPendingCount} of {totalBankStatements} matched</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                  reconciliationRate === 100
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {reconciliationRate === 100 ? '✓' : '3'}
                </span>
                <div>
                  <p className="font-bold text-slate-800 text-[11px]">3. Reconcile & Clear</p>
                  <p className="text-[10px] text-slate-500">{reconciliationRate}% completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-2xl p-8 text-center transition">
            <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-bounce" />
            <h4 className="font-bold text-slate-800 text-sm">
              Upload Commercial Bank of Ethiopia (CBE) / Awash Bank Statement (CSV or Excel)
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              The engine automatically parses transaction logs, extracts student account numbers (e.g. ACC-11904), cross-checks reference numbers, and batch approves matching invoices.
            </p>

            <div className="flex justify-center gap-3">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition">
                Select Bank Statement File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleSimulateBankStatementUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleRunReconciliation}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Run Batch Cross-Check On Stored Feed
              </button>
            </div>
          </div>

          {/* Reconciliation Feedback */}
          {reconciliationResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Automated Statement Cross-Check Succeeded!</p>
                  <p className="mt-0.5 text-emerald-800">
                    Approved and marked {reconciliationResult.matchedCount} matching student fee records. Total reconciled amount: <span className="font-mono font-bold">{reconciliationResult.approvedTotal.toLocaleString()} ETB</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statement Rows Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                Bank Transaction Feed & Cross-Check Status
              </h4>
              <button
                type="button"
                onClick={() => exportBankStatementsCsv(bankStatements, { filterLabel: 'Feed' })}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                title={`Export ${bankStatements.length} bank feed records as CSV`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                Export Feed CSV ({bankStatements.length})
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference Code</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payer Details & Description</th>
                    <th className="py-2.5 px-3">Cross-Check Match</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankStatements.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{row.transactionDate}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{row.referenceNumber}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.amount.toLocaleString()} ETB</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{row.payerName}</span>
                        <span className="block text-[10px] text-slate-500">{row.bankDescription}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.matchedStudentId ? (
                          <span className="font-mono text-emerald-700 font-semibold">
                            Matched: {row.matchedStudentId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No exact account match</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {row.status === 'RECONCILED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            RECONCILED
                          </span>
                        ) : row.status === 'MATCHED_PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-blue-600" />
                            MATCH READY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-slate-500" />
                            MANUAL REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.status === 'RECONCILED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Cleared
                          </span>
                        ) : row.status === 'MATCHED_PENDING' ? (
                          <button
                            type="button"
                            onClick={() => reconcileSingleBankStatement(row.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition shadow-2xs cursor-pointer active:scale-95 inline-flex items-center gap-1"
                            title="Approve matched fee invoice and mark bank statement as reconciled"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => reconcileSingleBankStatement(row.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 rounded text-[11px] font-semibold transition cursor-pointer active:scale-95 inline-flex items-center gap-1"
                            title="Mark statement row as manually reconciled"
                          >
                            Reconcile
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
      )}

      {/* TAB 3: CLEARANCES (LEAVING SCHOOL & LOST ID) */}
      {activeTab === 'CLEARANCES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              Financial Clearances Desk
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Financial clearance for Leaving the school can be given through this department" & "if the student loses his/her ID, finance must give them Clearance in the finance portal after which The ID becomes Downloadable".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Leaving School Clearance */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-blue-600" />
                <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                  School Leaving Financial Clearance
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Grants official financial sign-off for transferring students, confirming zero remaining arrears or property penalties.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {students.map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{s.id} • {s.accountNumber}</p>
                    </div>

                    {s.leavingClearance?.status === 'APPROVED' ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Cleared
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          grantLeavingClearance(s.id);
                          alert(`Financial leaving clearance granted for ${s.fullName}. Records released.`);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition"
                      >
                        Grant Clearance
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Lost ID Replacement Financial Clearance */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Lost ID Badge Financial Clearance
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Finance verifies that the 500 ETB replacement charge is settled and approves the reprint pipeline.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {students.filter(s => s.lostIdRequest).map((s) => {
                  const req = s.lostIdRequest!;
                  return (
                    <div key={s.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[10px] text-slate-500">Reported: {req.date} • Reason: {req.reason}</p>
                        </div>
                        <span className="font-mono font-bold text-blue-600 text-xs">500 ETB</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-600">
                          Finance Sign-off: {req.financeCleared ? <span className="text-emerald-600 font-bold">Approved</span> : <span className="text-amber-600 font-bold">Pending</span>}
                        </span>

                        {!req.financeCleared ? (
                          <button
                            onClick={() => {
                              clearLostIdFinance(s.id);
                              alert(`Finance sign-off recorded for ${s.fullName}. ID now cleared for reprint.`);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                          >
                            Approve Clearance
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Finance Cleared
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {students.filter(s => s.lostIdRequest).length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-6">No active lost ID clearance requests.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Invoice Urgent Fee Alert Modal */}
      {selectedInvoiceForAlert && (
        <UrgentFeeAlertModal
          isOpen={!!selectedInvoiceForAlert}
          onClose={() => setSelectedInvoiceForAlert(null)}
          invoice={selectedInvoiceForAlert}
        />
      )}

      {/* Batch Fee Alert Modal */}
      <BatchFeeAlertModal
        isOpen={showBatchAlertModal}
        onClose={() => setShowBatchAlertModal(false)}
      />

      {/* Parent Email Notification Logs Modal */}
      <ParentEmailLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        defaultFilter="FINANCE"
      />

      {/* Global Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportType="FINANCE_INVOICES"
        filteredInvoices={filteredInvoices}
        allInvoices={invoices}
        bankStatements={bankStatements}
        financeFilterSummary={{
          searchQuery,
          filterStatus,
        }}
      />

    </div>
  );
};

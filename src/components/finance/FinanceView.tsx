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
  Download
} from 'lucide-react';
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
    bankStatements,
    students,
    grantLeavingClearance,
    clearLostIdFinance,
    postNotice,
    openDocumentViewer
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
      postedBy: 'Ato Fisseha Tamrat (Chief Financial Officer)',
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
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              Bulk Bank Statement Cross-Checking Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Bulk approvals Can be made by uploading a bank statement of the school. (The system will approve each Student's payment by crosschecking The reference Number they specified with the attached slip)"
            </p>
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
                    <th className="py-2.5 px-3 text-right">Status</th>
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
                      <td className="py-2.5 px-3 text-right">
                        {row.status === 'RECONCILED' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            RECONCILED
                          </span>
                        ) : row.status === 'MATCHED_PENDING' ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                            MATCH READY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[10px]">
                            MANUAL REVIEW
                          </span>
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

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice } from '../../types';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser 
} from '../../services/gmailAuthService';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  CreditCard,
  Users,
  CheckSquare,
  Square,
  Search,
  Filter
} from 'lucide-react';

interface BatchFeeAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchFeeAlertModal: React.FC<BatchFeeAlertModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    invoices, 
    students, 
    sendBatchUrgentFeeEmails 
  } = useSchool();

  const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'PENDING_APPROVAL');

  const [selectedIds, setSelectedIds] = useState<string[]>(() => unpaidInvoices.map(i => i.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [useTestEmailForAll, setUseTestEmailForAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    results: any[];
  } | null>(null);

  if (!isOpen) return null;

  const filteredInvoices = unpaidInvoices.filter(inv => 
    inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === unpaidInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unpaidInvoices.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedInvoices = unpaidInvoices.filter(inv => selectedIds.includes(inv.id));
  const totalAmountSelected = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleStartBatchDispatch = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setBatchResults(null);

    try {
      const res = await sendBatchUrgentFeeEmails(selectedIds);
      setBatchResults(res);
    } catch (err: any) {
      alert(err.message || 'Batch dispatch failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasAuthorizedGmail = isGmailAuthorized();
  const currentGoogleUser = getCurrentGoogleUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                  Bulk Gmail Dispatcher
                </span>
                <span className="text-xs text-slate-400">
                  Total Outstanding Records: <strong className="text-slate-200">{unpaidInvoices.length}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Batch Urgent Fee Email Notifications to Parents
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center">
            <span className="text-slate-400">Selected Invoices:</span>
            <span className="font-bold text-slate-100">{selectedIds.length} of {unpaidInvoices.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center">
            <span className="text-slate-400">Total Unpaid Balance:</span>
            <span className="font-bold text-emerald-400">{totalAmountSelected.toLocaleString()} ETB</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center">
            <span className="text-slate-400">Gmail API Status:</span>
            <span className="font-mono text-emerald-300 flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {currentGoogleUser?.email || 'nexgriddigital@gmail.com'}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {batchResults && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-slate-100">Batch Dispatch Summary</h4>
                </div>
                <div className="text-xs">
                  <span className="text-emerald-400 font-bold">{batchResults.successful} sent</span>
                  <span className="text-slate-500 mx-1.5">&bull;</span>
                  <span className="text-red-400 font-bold">{batchResults.failed} failed</span>
                </div>
              </div>

              {/* Mini results list */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                {batchResults.results.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="font-medium text-slate-200">{r.studentName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{r.recipientEmail}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {r.success ? 'SENT' : 'ERROR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Selection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                {selectedIds.length === unpaidInvoices.length ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                {selectedIds.length === unpaidInvoices.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-slate-400">
                ({selectedIds.length} recipients selected)
              </span>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter by student or account..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900/60">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Select</th>
                    <th className="py-2.5 px-3">Scholar</th>
                    <th className="py-2.5 px-3">Bank Account</th>
                    <th className="py-2.5 px-3">Invoice</th>
                    <th className="py-2.5 px-3 text-right">Amount (ETB)</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Parent Email</th>
                    <th className="py-2.5 px-3 text-center">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredInvoices.map(inv => {
                    const isSelected = selectedIds.includes(inv.id);
                    const st = students.find(s => s.id === inv.studentId);
                    const pEmail = st?.parents?.email || 'nexgriddigital@gmail.com';
                    const isOverdue = new Date(inv.dueDate) < new Date();

                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => toggleSelectOne(inv.id)}
                        className={`hover:bg-slate-800/40 transition cursor-pointer ${
                          isSelected ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {inv.studentName}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            {inv.studentId} &bull; Gr {inv.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 font-bold text-[11px]">
                          {inv.accountNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {inv.title}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {inv.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[11px] font-semibold ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                            {inv.dueDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                          {pEmail}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {inv.parentAlertSent ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold">
                              Sent [✓]
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                              Pending
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

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">
              Each email is individually personalized with scholar name, unique student bank account number, exact balance, and CBE/Telebirr payment channels.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>

          <button
            onClick={handleStartBatchDispatch}
            disabled={isProcessing || selectedIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-900/30 transition disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching {selectedIds.length} Emails via Gmail...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch Automated Gmail Alerts to {selectedIds.length} Parents
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { Invoice } from '../../../types';
import { 
  X, 
  Receipt, 
  Search, 
  CheckCircle2, 
  Clock, 
  Printer, 
  CreditCard, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface QuickReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickReceiptModal: React.FC<QuickReceiptModalProps> = ({ isOpen, onClose }) => {
  const { 
    invoices, 
    approvePayment, 
    setSelectedInvoiceForReceipt, 
    setCurrentRole,
    students 
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [justPaidInvoiceId, setJustPaidInvoiceId] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (filterStatus === 'PAID' && inv.status !== 'PAID') return false;
      if (filterStatus === 'UNPAID' && inv.status === 'PAID') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = inv.studentName?.toLowerCase().includes(q);
      const matchAcc = inv.accountNumber?.toLowerCase().includes(q);
      const matchId = inv.studentId?.toLowerCase().includes(q);
      const matchRef = inv.paymentReference?.toLowerCase().includes(q);
      const matchTitle = inv.title?.toLowerCase().includes(q);
      return matchName || matchAcc || matchId || matchRef || matchTitle;
    });
  }, [invoices, searchQuery, filterStatus]);

  if (!isOpen) return null;

  const handleOpenReceipt = (invoice: Invoice) => {
    setSelectedInvoiceForReceipt(invoice);
    onClose();
  };

  const handleQuickPayAndIssue = (invoice: Invoice) => {
    approvePayment(invoice.id);
    setJustPaidInvoiceId(invoice.id);
    
    // Find updated invoice from updated list or construct it
    setTimeout(() => {
      const updatedInv: Invoice = {
        ...invoice,
        status: 'PAID',
        paidWatermark: true,
        paidDate: new Date().toISOString().split('T')[0],
        receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setSelectedInvoiceForReceipt(updatedInv);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Issue Official Receipt
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                  Finance FAB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly generate or inspect stamped payment vouchers with official watermark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, account or REF..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PAID')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'PAID'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paid Receipts ({invoices.filter(i => i.status === 'PAID').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('UNPAID')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'UNPAID'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unpaid ({invoices.filter(i => i.status !== 'PAID').length})
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="p-4 max-h-[55vh] overflow-y-auto space-y-2">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No invoices matching your search.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Try searching for a different student name or account number.
              </p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isPaid = inv.status === 'PAID';
              const isProcessingThis = justPaidInvoiceId === inv.id;

              return (
                <div
                  key={inv.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isPaid
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {inv.studentName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {inv.accountNumber}
                      </span>
                      {isPaid ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          PAID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          UNPAID
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>{inv.title}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {inv.amount.toLocaleString()} ETB
                      </span>
                      <span>•</span>
                      <span>Ref: <strong className="font-mono text-slate-700 dark:text-slate-300">{inv.paymentReference}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(inv)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Issue / View Receipt</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => handleQuickPayAndIssue(inv)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isProcessingThis ? 'Processing...' : 'Mark Paid & Issue Receipt'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Receipts include the official diagonal <strong>PAID BILL</strong> watermark and institutional seal.
          </span>
          <button
            type="button"
            onClick={() => {
              setCurrentRole('FINANCE');
              onClose();
            }}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Finance Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

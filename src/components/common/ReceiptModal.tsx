import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice } from '../../types';
import { X, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  invoice?: Invoice | null;
  onClose?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice: propInvoice, onClose: propOnClose }) => {
  const { schoolName, selectedInvoiceForReceipt, setSelectedInvoiceForReceipt } = useSchool();

  const invoice = propInvoice || selectedInvoiceForReceipt;
  const onClose = propOnClose || (() => setSelectedInvoiceForReceipt(null));

  if (!invoice) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900 tracking-wider">
              Official Finance Receipt
            </h3>
            <p className="text-xs text-slate-500">Auto-Generated Digital Bill Voucher</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container with Watermark */}
        <div className="p-8 bg-slate-50 relative overflow-hidden">
          <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-sm relative overflow-hidden">
            
            {/* WATERMARK: "PAID BILL" diagonally across the receipt */}
            {invoice.paidWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                <div className="transform -rotate-30 border-8 border-emerald-600/30 rounded-2xl px-10 py-4">
                  <span className="font-oskar-vintage text-6xl font-black text-emerald-600/25 tracking-widest block uppercase">
                    PAID BILL
                  </span>
                  <span className="text-center block text-xs tracking-widest font-mono text-emerald-600/30 uppercase mt-1">
                    VERIFIED BY {(schoolName || 'ACADEMY').toUpperCase()} FINANCE
                  </span>
                </div>
              </div>
            )}

            {/* School Receipt Top Brand */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <h1 className="font-oskar-vintage text-2xl font-black tracking-widest text-slate-900">
                  {(schoolName || 'ACADEMY').toUpperCase()}
                </h1>
                <p className="text-xs text-slate-500 font-medium">Bole Sub-City, Addis Ababa, Ethiopia</p>
                <p className="text-xs text-slate-400 font-mono">finance@school.edu • +251 11 551 2026</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full uppercase tracking-wider mb-1">
                  OFFICIAL RECEIPT
                </span>
                <p className="font-mono text-sm font-bold text-slate-800">
                  {invoice.receiptNumber || `REC-2026-${invoice.id.slice(-4)}`}
                </p>
                <p className="text-xs text-slate-500">Date: {invoice.paidDate || '2026-09-15'}</p>
              </div>
            </div>

            {/* Student & Account Reference Information */}
            <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Billed To Student:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.studentName}</p>
                <p className="text-slate-600 mt-0.5">Student ID: <span className="font-mono font-semibold">{invoice.studentId}</span></p>
                <p className="text-slate-600">Grade Level: <span className="font-semibold">Grade {invoice.grade}</span></p>
              </div>

              <div className="text-right">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Payment Account Reference:</p>
                <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{invoice.accountNumber}</p>
                <p className="text-slate-600 mt-0.5">Bank Ref: <span className="font-mono">{invoice.paymentReference || 'Direct Bank Settlement'}</span></p>
                <p className="text-slate-600">Status: <span className="text-emerald-700 font-semibold uppercase">{invoice.status}</span></p>
              </div>
            </div>

            {/* Line items */}
            <div className="py-5 border-b border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="text-left py-2">Fee Description</th>
                    <th className="text-center py-2">Term</th>
                    <th className="text-right py-2">Amount (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-slate-800">
                      {invoice.title}
                      <span className="block text-[11px] font-normal text-slate-400">
                        Academic Year 2026/2027 Registration & Maintenance
                      </span>
                    </td>
                    <td className="text-center py-3 text-slate-600">Term 1</td>
                    <td className="text-right py-3 font-mono font-bold text-slate-900">
                      {invoice.amount.toLocaleString()} ETB
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="pt-4 flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Cleared with Finance Department</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold block">Total Paid:</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {invoice.amount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Footer Signature & Seal */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
              <div>
                <div className="w-28 border-b border-slate-300 pb-1 mb-1 font-serif italic text-slate-600">
                  Fisseha Tamrat
                </div>
                <span>Chief Financial Officer Signature</span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tamper-proof Digital Voucher</span>
                </div>
                <span>System generated at {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Reference this voucher for student clearance and term exams.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

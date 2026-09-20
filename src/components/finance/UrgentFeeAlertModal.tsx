import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice } from '../../types';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser 
} from '../../services/gmailAuthService';
import { generateUrgentFeeDeadlineEmailHtml } from '../../services/parentEmailNotificationService';
import { 
  X, 
  Mail, 
  Calendar, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Loader2, 
  CreditCard,
  Building,
  Sparkles
} from 'lucide-react';

interface UrgentFeeAlertModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const UrgentFeeAlertModal: React.FC<UrgentFeeAlertModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { 
    students, 
    schoolName, 
    sendUrgentFeeDeadlineEmail 
  } = useSchool();

  const student = students.find(s => s.id === invoice.studentId);
  const defaultEmail = student?.parents?.email || 'nexgriddigital@gmail.com';
  const isOverdue = new Date(invoice.dueDate) < new Date();

  const [recipientEmail, setRecipientEmail] = useState<string>(defaultEmail);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'PREVIEW'>('CONFIG');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const previewHtml = generateUrgentFeeDeadlineEmailHtml({
    recipientEmail,
    recipientName: student?.parents?.fatherName || student?.parents?.motherName || 'Parent / Legal Guardian',
    studentName: invoice.studentName,
    studentId: invoice.studentId,
    grade: invoice.grade,
    accountNumber: invoice.accountNumber,
    invoiceTitle: invoice.title,
    amount: invoice.amount,
    dueDate: invoice.dueDate,
    paymentReference: invoice.paymentReference,
    isOverdue,
    schoolName,
    customMessage: customMessage.trim() || undefined,
  });

  const handleConnectGmail = async () => {
    setIsAuthorizing(true);
    try {
      await signInWithGoogle();
      alert('Google Workspace Gmail authorization connected successfully!');
    } catch (err: any) {
      alert(err.message || 'Google authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSendAlert = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await sendUrgentFeeDeadlineEmail(invoice.id, {
        recipientEmail,
        customMessage: customMessage.trim() || undefined,
      });
      setSendResult(res);
    } catch (err: any) {
      setSendResult({
        success: false,
        error: err?.message || 'Failed to dispatch email via Gmail API',
      });
    } finally {
      setIsSending(false);
    }
  };

  const hasAuthorizedGmail = isGmailAuthorized();
  const currentGoogleUser = getCurrentGoogleUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between ${
          isOverdue ? 'bg-gradient-to-r from-red-950/50 to-slate-900' : 'bg-gradient-to-r from-amber-950/40 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isOverdue
                ? 'bg-red-900/40 border-red-700/60 text-red-400'
                : 'bg-amber-900/40 border-amber-700/60 text-amber-400'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isOverdue
                    ? 'bg-red-950 border-red-800 text-red-300'
                    : 'bg-amber-950 border-amber-800 text-amber-300'
                }`}>
                  {isOverdue ? 'FINAL NOTICE: OVERDUE' : 'URGENT FEE DEADLINE'}
                </span>
                <span className="text-xs text-slate-400">
                  Inv: <span className="font-mono font-bold text-slate-300">{invoice.id}</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Parent Urgent Fee Alert Dispatcher
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

        {/* Tab Controls & Authorization Status */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('CONFIG')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'CONFIG'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alert Parameters & Recipient
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Email Preview (HTML)
            </button>
          </div>

          {/* Gmail API Status Indicator */}
          <div className="flex items-center gap-2">
            {hasAuthorizedGmail ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gmail API Connected</span>
                <span className="text-[11px] text-emerald-400/80 font-mono">
                  ({currentGoogleUser?.email || 'nexgriddigital@gmail.com'})
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnectGmail}
                disabled={isAuthorizing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer"
              >
                {isAuthorizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Connect Google Account (nexgriddigital@gmail.com)
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {sendResult && (
            <div
              className={`p-4 rounded-xl border ${
                sendResult.success
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                  : 'bg-red-950/50 border-red-700/60 text-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {sendResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {sendResult.success ? 'Urgent Fee Alert Dispatched Successfully!' : 'Email Dispatch Failed'}
                  </h4>
                  <p className="text-xs mt-1 text-slate-300">
                    {sendResult.success
                      ? `Automated fee alert was sent to ${recipientEmail} with complete CBE & Telebirr deposit instructions.`
                      : sendResult.error}
                  </p>
                  {sendResult.messageId && (
                    <div className="mt-2 text-[11px] font-mono bg-slate-900/80 px-2 py-1 rounded border border-emerald-800/40 inline-block text-emerald-300">
                      Gmail Message ID: {sendResult.messageId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CONFIG' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Invoice Details */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Invoice & Scholar Ledger
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Scholar Name:</span>
                      <span className="font-bold text-slate-200">{invoice.studentName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Student ID / Grade:</span>
                      <span className="font-mono text-slate-200">{invoice.studentId} &bull; Grade {invoice.grade}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Bank Account No:</span>
                      <span className="font-mono font-bold text-amber-400">{invoice.accountNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Fee Category:</span>
                      <span className="font-semibold text-slate-200">{invoice.title}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Due Date:</span>
                      <span className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-slate-200'}`}>
                        {invoice.dueDate} {isOverdue && '(Past Due)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/40 bg-slate-900/40 px-2 rounded-lg">
                      <span className="text-slate-300 font-medium">Outstanding Balance:</span>
                      <span className="font-bold text-sm text-emerald-400">
                        {invoice.amount.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipient Parent Settings */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    Recipient Parent Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Parent Email Address
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="parent.email@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pre-populated with parent record. Test with <strong>nexgriddigital@gmail.com</strong> for instant delivery.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40 text-[11px] text-slate-300">
                      <strong>Registered Guardian:</strong> {student?.parents?.fatherName || 'Parent / Legal Guardian'} ({student?.parents?.fatherPhone || 'N/A'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Message & Institutional Payment Channels */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bursar Remarks & Instructions
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Custom Urgent Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                      placeholder="e.g. Please present or upload the bank deposit slip before registration closing on Friday afternoon to avoid administrative late fines."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>

                  {/* Payment Channels Info */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Institutional Payment Channels:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/40">
                        <div className="font-semibold text-slate-200">Commercial Bank (CBE)</div>
                        <div className="font-mono text-[11px] text-amber-400 mt-0.5">1000 2345 6789 1</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/40">
                        <div className="font-semibold text-slate-200">Telebirr SuperApp</div>
                        <div className="font-mono text-[11px] text-emerald-400 mt-0.5">+251 91 123 4567</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 leading-relaxed">
                  <strong>Automated Audit:</strong> Once sent, this dispatch is recorded in the institutional parent email alert log with timestamp and Gmail tracking ID.
                </div>
              </div>

            </div>
          ) : (
            /* Live HTML Preview Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Rendering exact HTML email dispatched to {recipientEmail}</span>
                <span className="font-mono text-[11px] text-slate-500">
                  Subject: {schoolName} - {isOverdue ? 'FINAL NOTICE: Tuition Past Due' : 'URGENT: Fee Deadline Alert'}
                </span>
              </div>
              <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                <iframe
                  title="Urgent Fee Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[480px] border-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {invoice.parentAlertSent ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Alert previously sent on {new Date(invoice.parentAlertSentAt || '').toLocaleDateString()}
              </span>
            ) : (
              <span>Parent has not received an automated Gmail alert for this invoice.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Close
            </button>

            <button
              onClick={handleSendAlert}
              disabled={isSending || !recipientEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching Fee Alert via Gmail...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {invoice.parentAlertSent ? 'Resend Fee Alert via Gmail' : 'Send Urgent Fee Alert (Gmail)'}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

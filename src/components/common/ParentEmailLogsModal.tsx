import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser,
  sendRawHtmlEmailViaGmail 
} from '../../services/gmailAuthService';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  CreditCard,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface ParentEmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFilter?: 'ALL' | 'DISCIPLINARY' | 'FINANCE';
}

export const ParentEmailLogsModal: React.FC<ParentEmailLogsModalProps> = ({
  isOpen,
  onClose,
  defaultFilter = 'ALL',
}) => {
  const { 
    parentEmailAlertLogs, 
    clearParentEmailAlertLogs, 
    logParentEmailAlert,
    schoolName 
  } = useSchool();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DISCIPLINARY' | 'FINANCE'>(defaultFilter);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = parentEmailAlertLogs.filter(log => {
    if (activeFilter === 'DISCIPLINARY') return log.type === 'DISCIPLINARY_HEARING';
    if (activeFilter === 'FINANCE') return log.type === 'URGENT_FEE_DEADLINE';
    return true;
  });

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      if (!isGmailAuthorized()) {
        await signInWithGoogle();
      }
      const googleUser = getCurrentGoogleUser();
      const testEmail = googleUser?.email || 'nexgriddigital@gmail.com';
      const nowStr = new Date().toLocaleString();

      const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">${schoolName} - Gmail Service Test</h2>
          <p>Hello,</p>
          <p>This is a verification test email dispatched from <strong>${schoolName}</strong> automated parent notification infrastructure at <strong>${nowStr}</strong>.</p>
          <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Google Account Authorized:</strong> ${testEmail}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Scope:</strong> https://www.googleapis.com/auth/gmail.send</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">The notification service is active and ready to transmit disciplinary summons and urgent fee deadline alerts to parents.</p>
        </div>
      `;

      const res = await sendRawHtmlEmailViaGmail({
        recipientEmail: testEmail,
        subject: `${schoolName} - Parent Notification Service Connection Test (${nowStr})`,
        htmlBody: testHtml,
      });

      logParentEmailAlert({
        id: `LOG-TEST-${Date.now()}`,
        type: 'DISCIPLINARY_HEARING',
        studentId: 'SYS-LOG-TEST',
        studentName: 'Diagnostic Verification Student',
        parentName: 'NexGrid Digital Admin',
        parentEmail: testEmail,
        subject: `${schoolName} - Parent Notification Service Test (${nowStr})`,
        dispatchedAt: new Date().toISOString(),
        status: 'SENT',
        messageId: res.messageId,
        referenceId: `TEST-${Date.now()}`,
        details: 'Live system diagnostic test verification email sent via Google Workspace API',
      });

      setTestResult(`Test email successfully delivered to ${testEmail}! (Gmail ID: ${res.messageId.slice(0, 14)}...)`);
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message || 'Authorization required'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const hasAuthorizedGmail = isGmailAuthorized();
  const currentGoogleUser = getCurrentGoogleUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-300">
                  Audit & Delivery Logs
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredLogs.length} events recorded
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                Automated Parent Email Notification History
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Notifications ({parentEmailAlertLogs.length})
            </button>
            <button
              onClick={() => setActiveFilter('DISCIPLINARY')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeFilter === 'DISCIPLINARY'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Disciplinary Summons
            </button>
            <button
              onClick={() => setActiveFilter('FINANCE')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeFilter === 'FINANCE'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Urgent Fee Alerts
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium transition cursor-pointer"
              title="Send a quick diagnostic email to nexgriddigital@gmail.com"
            >
              {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Test Gmail Connection
            </button>

            {parentEmailAlertLogs.length > 0 && (
              <button
                onClick={clearParentEmailAlertLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800 text-slate-300 hover:text-red-300 text-xs font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div className="px-6 py-2.5 bg-slate-800/90 border-b border-slate-700 text-xs flex items-center justify-between text-slate-200">
            <span>{testResult}</span>
            <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Mail className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No parent email notifications recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Dispatched disciplinary summons and urgent tuition alerts sent via the Gmail integration will appear here with delivery timestamps and Gmail tracking IDs.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Dispatched</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Scholar</th>
                    <th className="py-2.5 px-3">Parent Recipient</th>
                    <th className="py-2.5 px-3">Subject / Details</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Gmail Message ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.map(log => {
                    const isDisc = log.type === 'DISCIPLINARY_HEARING';
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          {new Date(log.dispatchedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isDisc ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-[10px] font-bold flex items-center gap-1 w-max">
                              <ShieldAlert className="w-3 h-3" />
                              Hearing Summons
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-bold flex items-center gap-1 w-max">
                              <CreditCard className="w-3 h-3" />
                              Urgent Fee
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {log.studentName}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            {log.studentId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px]">
                          {log.parentEmail}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {log.parentName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={log.details || log.subject}>
                          <div className="font-medium truncate">{log.subject}</div>
                          {log.details && (
                            <div className="text-[11px] text-slate-400 truncate">{log.details}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {log.status === 'SENT' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                              DELIVERED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 text-[10px] font-bold">
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {log.messageId || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Connected Google Workspace Account: <strong>nexgriddigital@gmail.com</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

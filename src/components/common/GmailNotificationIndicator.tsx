import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  signOutGoogle,
  getCurrentGoogleUser,
  sendRawHtmlEmailViaGmail,
  initGoogleAuth
} from '../../services/gmailAuthService';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  History, 
  ChevronDown, 
  Loader2, 
  Sparkles,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { ParentEmailLogsModal } from './ParentEmailLogsModal';

export const GmailNotificationIndicator: React.FC = () => {
  const { schoolName, parentEmailAlertLogs, logParentEmailAlert } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(() => isGmailAuthorized());

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthorized(isGmailAuthorized());
    const unsubscribe = initGoogleAuth(
      () => setAuthorized(true),
      () => setAuthorized(isGmailAuthorized())
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const googleUser = getCurrentGoogleUser();
  const emailAccount = googleUser?.email || 'nexgriddigital@gmail.com';

  const handleConnect = async () => {
    setIsAuthorizing(true);
    setFeedback(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setAuthorized(true);
        setFeedback(`Connected as ${res.user.email || emailAccount}! Parent email alerts are active.`);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleDisconnect = async () => {
    await signOutGoogle();
    setAuthorized(false);
    setFeedback('Google Workspace disconnected.');
  };

  const handleTestSend = async () => {
    setIsSendingTest(true);
    setFeedback(null);
    try {
      // Auto-connect if needed so test send never fails with authorization error
      if (!isGmailAuthorized()) {
        const connectRes = await signInWithGoogle();
        if (connectRes) {
          setAuthorized(true);
        }
      }

      const nowStr = new Date().toLocaleTimeString();
      const testHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">${schoolName} - Gmail Service Live Test</h2>
          <p>This automated verification was dispatched from <strong>${schoolName}</strong> parent alert infrastructure at ${nowStr}.</p>
          <p>Disciplinary hearing summons and urgent fee deadline email dispatches are operational.</p>
        </div>
      `;
      const res = await sendRawHtmlEmailViaGmail({
        recipientEmail: emailAccount,
        subject: `${schoolName} - Gmail Notification Service Test (${nowStr})`,
        htmlBody: testHtml,
      });
      setAuthorized(true);
      setFeedback(`Delivered to ${emailAccount}! (Message ID: ${res.messageId.slice(0, 12)}...)`);

      logParentEmailAlert({
        id: `LOG-TEST-${Date.now()}`,
        type: 'DISCIPLINARY_HEARING',
        studentId: 'SYS-DIAG-01',
        studentName: 'Diagnostic Verification Student',
        parentName: 'NexGrid Digital Admin',
        parentEmail: emailAccount,
        subject: `${schoolName} - Gmail Notification Service Test (${nowStr})`,
        dispatchedAt: new Date().toISOString(),
        status: 'SENT',
        messageId: res.messageId,
        referenceId: `TEST-${Date.now()}`,
        details: 'Live system diagnostic test verification email sent via Google Workspace API',
      });
    } catch (err: any) {
      setFeedback(`Failed: ${err.message || 'Auth error'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          id="btn-gmail-indicator"
          type="button"
          onClick={() => {
            setAuthorized(isGmailAuthorized());
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer group"
          title="Automated Parent Email Notification Service via Gmail"
        >
          <div className="relative flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition" />
            <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              authorized ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            } ring-1 ring-slate-900`} />
          </div>
          <span className="hidden 2xl:inline font-medium">Gmail Alerts</span>
          <span className="hidden sm:inline 2xl:hidden font-medium">Gmail</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-76 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-3.5 text-slate-200 animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-100">Parent Alert Service</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                authorized
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {authorized ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>

            {/* Target / Authenticated Account Info */}
            <div className={`p-2.5 rounded-lg border space-y-1.5 ${
              authorized
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {authorized ? 'Authenticated Account:' : 'Target Account:'}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  authorized ? 'text-emerald-300 bg-emerald-900/60' : 'text-amber-300 bg-amber-900/50'
                }`}>
                  {authorized ? 'Ready' : 'Pending Auth'}
                </span>
              </div>
              <div className="font-mono text-white font-semibold truncate text-[11px]">
                {emailAccount}
              </div>
              <div className="text-[10px] text-slate-400">
                {authorized
                  ? 'Dispatches hearing summons & fee alerts via Google Workspace API.'
                  : 'Connect your Google account to authorize automated parent alert emails.'}
              </div>
            </div>

            {feedback && (
              <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                feedback.startsWith('Delivered') || feedback.startsWith('Connected') || feedback.startsWith('Sent')
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
                  : 'bg-blue-950/70 border-blue-800/60 text-blue-200'
              }`}>
                {feedback}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowLogsModal(true);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Parent Email Dispatch Logs
                </span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full font-mono">
                  {parentEmailAlertLogs.length}
                </span>
              </button>

              {!authorized ? (
                <>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isAuthorizing}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isAuthorizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>{isAuthorizing ? 'Connecting Google Account...' : 'Sign In with Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSend}
                    disabled={isSendingTest || isAuthorizing}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    {isSendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Send Diagnostic Test Email
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleTestSend}
                    disabled={isSendingTest}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isSendingTest ? 'Dispatching Test Email...' : 'Send Diagnostic Test Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-slate-200 py-1 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3 h-3 text-slate-400" />
                    <span>Disconnect Google Account</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ParentEmailLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />
    </>
  );
};

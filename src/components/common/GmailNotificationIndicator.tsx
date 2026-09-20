import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser,
  sendRawHtmlEmailViaGmail 
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
  ExternalLink
} from 'lucide-react';
import { ParentEmailLogsModal } from './ParentEmailLogsModal';

export const GmailNotificationIndicator: React.FC = () => {
  const { schoolName, parentEmailAlertLogs } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasAuthorized = isGmailAuthorized();
  const googleUser = getCurrentGoogleUser();
  const emailAccount = googleUser?.email || 'nexgriddigital@gmail.com';

  const handleConnect = async () => {
    setIsAuthorizing(true);
    setFeedback(null);
    try {
      await signInWithGoogle();
      setFeedback('Gmail authorization connected!');
    } catch (err: any) {
      setFeedback(err.message || 'Authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleTestSend = async () => {
    setIsSendingTest(true);
    setFeedback(null);
    try {
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
      setFeedback(`Sent to ${emailAccount} (Msg ID: ${res.messageId.slice(0, 10)}...)`);
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
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer group"
          title="Automated Parent Email Notification Service via Gmail"
        >
          <div className="relative flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition" />
            <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              hasAuthorized ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            } ring-1 ring-slate-900`} />
          </div>
          <span className="hidden sm:inline font-medium">Gmail Alerts</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-3.5 text-slate-200 animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-100">Parent Alert Service</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hasAuthorized
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {hasAuthorized ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1">
              <div className="text-[11px] text-slate-400">Authenticated Google Account:</div>
              <div className="font-mono text-slate-200 font-semibold truncate text-[11px]">
                {emailAccount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Dispatches hearing summons & fee alerts via Google Workspace API.
              </div>
            </div>

            {feedback && (
              <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/50 text-[11px] text-blue-300">
                {feedback}
              </div>
            )}

            <div className="space-y-1.5 pt-1">
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

              <button
                type="button"
                onClick={handleTestSend}
                disabled={isSendingTest}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Send Diagnostic Test Email
              </button>

              {!hasAuthorized && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isAuthorizing}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isAuthorizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  Sign In with Google
                </button>
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

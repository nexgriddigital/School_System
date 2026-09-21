import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DisciplinaryAction } from '../../types';
import { 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser 
} from '../../services/gmailAuthService';
import { generateDisciplinaryHearingEmailHtml } from '../../services/parentEmailNotificationService';
import { 
  X, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  ShieldAlert,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface DisciplinaryHearingModalProps {
  action: DisciplinaryAction;
  isOpen: boolean;
  onClose: () => void;
}

export const DisciplinaryHearingModal: React.FC<DisciplinaryHearingModalProps> = ({
  action,
  isOpen,
  onClose,
}) => {
  const { 
    students, 
    schoolName, 
    sendDisciplinaryHearingEmail, 
    scheduleDisciplinaryHearing 
  } = useSchool();

  const student = students.find(s => s.id === action.studentId);
  const defaultEmail = student?.parents?.email || 'nexgriddigital@gmail.com';

  const [hearingDate, setHearingDate] = useState<string>(
    action.hearingDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [hearingTime, setHearingTime] = useState<string>(action.hearingTime || '10:30 AM');
  const [hearingLocation, setHearingLocation] = useState<string>(
    action.hearingLocation || 'Academic Disciplinary Board Room (Hall B, Rm 204)'
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(defaultEmail);
  const [committeeText, setCommitteeText] = useState<string>(
    (action.hearingCommittee && action.hearingCommittee.length > 0)
      ? action.hearingCommittee.join(', ')
      : 'Office of the Principal, Head of Guidance & Counselling, Homeroom Teacher'
  );

  const [activeTab, setActiveTab] = useState<'CONFIG' | 'PREVIEW'>('CONFIG');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const committeeArray = committeeText.split(',').map(s => s.trim()).filter(Boolean);

  const previewHtml = generateDisciplinaryHearingEmailHtml({
    recipientEmail,
    recipientName: student?.parents?.fatherName || student?.parents?.motherName || 'Parent / Legal Guardian',
    studentName: action.studentName,
    studentId: action.studentId,
    grade: action.grade,
    sectionId: action.sectionId,
    incidentType: action.incidentType,
    incidentDate: action.incidentDate,
    description: action.description,
    hearingDate,
    hearingTime,
    hearingLocation,
    hearingCommittee: committeeArray,
    schoolName,
    counsellorName: action.counsellorName,
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

  const handleSendNotification = async () => {
    setIsSending(true);
    setSendResult(null);

    // Ensure hearing schedule is saved to the disciplinary record
    scheduleDisciplinaryHearing(action.id, {
      hearingDate,
      hearingTime,
      hearingLocation,
      hearingCommittee: committeeArray,
    });

    try {
      const res = await sendDisciplinaryHearingEmail(action.id, {
        hearingDate,
        hearingTime,
        hearingLocation,
        recipientEmail,
        hearingCommittee: committeeArray,
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
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-300">
                  Gmail Notification Service
                </span>
                <span className="text-xs text-slate-400">
                  Ref: <span className="font-mono">{action.id}</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Disciplinary Hearing Summons & Parent Alert
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
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hearing & Recipient Details
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'bg-red-700 text-white shadow-sm'
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
                    {sendResult.success ? 'Parent Alert Dispatched Successfully!' : 'Email Dispatch Failed'}
                  </h4>
                  <p className="text-xs mt-1 text-slate-300">
                    {sendResult.success
                      ? `Summons email was delivered to ${recipientEmail} via Google Workspace Gmail API.`
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
              
              {/* Left Column: Student & Infraction Context */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Scholar & Infraction Profile
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Scholar Name:</span>
                      <span className="font-bold text-slate-200">{action.studentName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Student ID:</span>
                      <span className="font-mono font-bold text-slate-200">{action.studentId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Grade / Section:</span>
                      <span className="text-slate-200">
                        Grade {action.grade} {action.sectionId ? `(${action.sectionId})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Infraction Type:</span>
                      <span className="text-red-400 font-semibold">{action.incidentType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Incident Date:</span>
                      <span className="text-slate-200">{action.incidentDate}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1">Counsellor Statement:</span>
                      <p className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40 text-slate-300 italic text-xs leading-relaxed">
                        "{action.description}"
                      </p>
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
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Defaulted to registered parent guardian email. You can change this to <strong>nexgriddigital@gmail.com</strong> for immediate testing.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300">
                      <strong>Parent Contact on Record:</strong> {student?.parents?.fatherName || student?.parents?.motherName || 'Parent on Record'} &bull; {student?.parents?.fatherPhone || student?.parents?.motherPhone || 'Phone on file'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hearing Logistics */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    Hearing Session Logistics
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hearing Date
                    </label>
                    <input
                      type="date"
                      value={hearingDate}
                      onChange={e => setHearingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Convening Time
                    </label>
                    <input
                      type="text"
                      value={hearingTime}
                      onChange={e => setHearingTime(e.target.value)}
                      placeholder="e.g. 10:30 AM or 02:00 PM"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Location / Chamber
                    </label>
                    <input
                      type="text"
                      value={hearingLocation}
                      onChange={e => setHearingLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Presiding Committee (comma-separated)
                    </label>
                    <textarea
                      rows={2}
                      value={committeeText}
                      onChange={e => setCommitteeText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 leading-relaxed">
                  <strong>Notice Protocol:</strong> Dispatching this summons will record the hearing on the official institutional agenda and transmit the full RFC 2822 formatted summons to the parent's inbox via the Gmail API.
                </div>
              </div>

            </div>
          ) : (
            /* Live HTML Preview Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Rendering exact HTML email dispatched to {recipientEmail}</span>
                <span className="font-mono text-[11px] text-slate-500">Subject: {schoolName} - Disciplinary Hearing Notice</span>
              </div>
              <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                <iframe
                  title="Hearing Notice Email Preview"
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
            {action.parentNoticeSent ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Summons previously dispatched on {new Date(action.parentNoticeSentAt || '').toLocaleDateString()}
              </span>
            ) : (
              <span>Summons has not yet been dispatched to parent.</span>
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
              onClick={handleSendNotification}
              disabled={isSending || !recipientEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching Summons via Gmail...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {action.parentNoticeSent ? 'Resend Summons via Gmail' : 'Send Hearing Summons to Parent (Gmail)'}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

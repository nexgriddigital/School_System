import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  X, 
  KeyRound, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface QuickPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPasswordResetModal: React.FC<QuickPasswordResetModalProps> = ({ isOpen, onClose }) => {
  const { 
    students, 
    resetUserPassword, 
    currentRole 
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [resetResult, setResetResult] = useState<{
    studentName: string;
    studentId: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return false;
    const q = searchTerm.toLowerCase().trim();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.accountNumber.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  const handleReset = (studentId: string, studentName: string) => {
    try {
      setError(null);
      const role = (currentRole === 'FINANCE' || currentRole === 'REGISTRAR' || currentRole === 'PRINCIPAL')
        ? currentRole
        : 'PRINCIPAL';
      const tempPass = resetUserPassword(studentId, role);
      setResetResult({
        studentName,
        studentId,
        tempPassword: tempPass,
      });
      setCopied(false);
    } catch (err: any) {
      setError(err?.message || 'Password reset unauthorized');
    }
  };

  const handleCopy = () => {
    if (!resetResult) return;
    navigator.clipboard.writeText(resetResult.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Authorized Credential Reset
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                  {currentRole} Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate temporary login credentials for locked or forgotten accounts
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetResult ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Temporary Password Issued
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Issued for <strong>{resetResult.studentName}</strong> ({resetResult.studentId}). User will be required to create a new password on login.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <span className="font-mono font-bold text-base text-blue-600 dark:text-blue-400 select-all">
                  {resetResult.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Credential'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Reset another student account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type student name, OSK ID, or account number..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                />
              </div>

              {searchTerm.trim() ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Matching Student Records:
                  </span>
                  {filteredStudents.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      No students found matching "{searchTerm}"
                    </p>
                  ) : (
                    filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.fullName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {s.id} • Grade {s.grade} • {s.accountNumber}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReset(s.id, s.fullName)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Generate Temp Pass</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Institutional Policy: Password resets generate a secure one-time temporary code. Only <strong>Finance, Registrar, and Principal</strong> are authorized to invoke this security override.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

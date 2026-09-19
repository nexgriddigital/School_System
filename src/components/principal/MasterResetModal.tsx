import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Users, 
  CreditCard, 
  BookOpen, 
  Building2, 
  KeyRound,
  FileText
} from 'lucide-react';

interface MasterResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterResetModal: React.FC<MasterResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { resetEverything, schoolName } = useSchool();
  const [keepPrincipalLoggedIn, setKeepPrincipalLoggedIn] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      resetEverything({ keepPrincipalLoggedIn });
      setIsResetting(false);
      onSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wider uppercase">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                Principal Executive Touch
              </div>
              <h2 className="font-oskar-vintage text-2xl font-bold tracking-wide mt-1.5 text-white">
                Master System Reset
              </h2>
              <p className="text-xs text-rose-100 mt-1 max-w-lg leading-relaxed">
                Full institutional rollback. At the Principal&apos;s touch, every record, admission, mark, and financial transaction will be permanently restored to initial factory defaults.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Warning Advisory Card */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-bold text-rose-950 mb-1">Irreversible Institutional Rollback</p>
              This command wipes all local changes in current runtime and browser storage. It re-initializes <span className="font-bold">{schoolName}</span> back to its pristine demonstration & factory configuration.
            </div>
          </div>

          {/* Reset Scope Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              What Will Be Reset (System-Wide Inventory)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Scholars & Admissions</p>
                  <p className="text-slate-500 text-[10px]">Restored to 4 demo scholars; new admissions & clearances cleared.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">User Accounts & Credentials</p>
                  <p className="text-slate-500 text-[10px]">Provisioned staff accounts & custom passwords restored to defaults.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Finance & Invoices</p>
                  <p className="text-slate-500 text-[10px]">Tuition payments, slips & CBE/Telebirr reconciliations reset.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Grades & Marksheets</p>
                  <p className="text-slate-500 text-[10px]">Entered marks, assessments & report card comments restored.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Notices, Leaves & Discipline</p>
                  <p className="text-slate-500 text-[10px]">Bulletins, teacher day-offs & disciplinary actions reset.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Institution Branding</p>
                  <p className="text-slate-500 text-[10px]">Name restored to &ldquo;Academy of Excellence&rdquo;.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Options & Executive Acknowledgement */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={keepPrincipalLoggedIn}
                onChange={(e) => setKeepPrincipalLoggedIn(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Keep me authenticated as School Principal after reset (view clean dashboard immediately)
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-slate-200">
              <input 
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-rose-900">
                I confirm this executive action and authorize the full institutional data rollback.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition"
          >
            Cancel & Keep Current Data
          </button>

          <button
            onClick={handleExecuteReset}
            disabled={!isConfirmed || isResetting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md ${
              !isConfirmed || isResetting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white hover:from-rose-500 hover:to-red-600 cursor-pointer shadow-rose-200 active:scale-98'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Executing System Reset...' : 'Reset Everything Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

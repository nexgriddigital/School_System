import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

interface ChangeMasterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCode: string) => void;
}

export const ChangeMasterCodeModal: React.FC<ChangeMasterCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    principalMasterCode, 
    updatePrincipalMasterCode, 
    institutionalUsers,
    currentUser 
  } = useSchool();

  const [currentVerificationCredential, setCurrentVerificationCredential] = useState('');
  const [newMasterCode, setNewMasterCode] = useState('');
  const [confirmMasterCode, setConfirmMasterCode] = useState('');
  
  const [showCurrentCredential, setShowCurrentCredential] = useState(false);
  const [showNewCode, setShowNewCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const principalAccount = institutionalUsers.find(u => u.role === 'PRINCIPAL');

  const handleGenerateKey = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generated = `OSK-PRN-${randomDigits}#${randomChars}`;
    setNewMasterCode(generated);
    setConfirmMasterCode(generated);
    setErrorMsg(null);
  };

  const handleCopyNewKey = () => {
    navigator.clipboard.writeText(newMasterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetForm = () => {
    setCurrentVerificationCredential('');
    setNewMasterCode('');
    setConfirmMasterCode('');
    setErrorMsg(null);
    setIsSuccess(false);
    setCopied(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNew = newMasterCode.trim();
    const cleanConfirm = confirmMasterCode.trim();

    if (!currentVerificationCredential.trim()) {
      setErrorMsg('Please enter your Principal account password or current master code for verification.');
      return;
    }

    if (!cleanNew || cleanNew.length < 6) {
      setErrorMsg('The new Master Authorization Code must contain at least 6 characters.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg('New Master Authorization Codes do not match. Please re-enter accurately.');
      return;
    }

    if (cleanNew === principalMasterCode.trim()) {
      setErrorMsg('The new Master Code cannot be identical to the current Master Code. Please choose a new unique key.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = updatePrincipalMasterCode({
        currentMasterCodeOrPassword: currentVerificationCredential.trim(),
        newMasterCode: cleanNew,
      });

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to update Master Authorization Code.');
      } else {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(cleanNew);
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-amber-200/80 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 relative border-b border-amber-500/20">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3" /> Apex Executive Security
              </span>
              <h2 className="text-xl font-bold font-oskar tracking-wide text-white mt-1">
                Change Master Authorization Code
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Configure the confidential Master Key that authorizes executive Principal accounts and catastrophic recovery.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">
                    Master Code Successfully Updated!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    The Principal Master Authorization Code has been rotated. Future institutional registrations or emergency authorizations will require this key.
                  </p>
                </div>
              </div>

              {/* Updated Key Display */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono uppercase tracking-wider text-[10px]">New Master Authorization Key</span>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live & Saved
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono text-base font-bold text-amber-300 tracking-wider break-all select-all">
                    {newMasterCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNewKey}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0 cursor-pointer shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-amber-300/80 flex items-start gap-1.5 pt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Keep this confidential code safe. It should only be known to the authorized Headmaster & Executive Principal.
                  </span>
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Done & Return to Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* Notice banner */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Principal Authorization Required:</span> To update the institutional Master Code, you must verify your identity using your Principal account password or current Master Code.
                </div>
              </div>

              {/* Step 1: Principal Identity Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Current Principal Password or Master Code *</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {principalAccount ? `Principal: ${principalAccount.name}` : 'Executive Verification'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentCredential ? 'text' : 'password'}
                    value={currentVerificationCredential}
                    onChange={(e) => {
                      setCurrentVerificationCredential(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter Principal password or active Master Code"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentCredential(!showCurrentCredential)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentCredential ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: New Master Authorization Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    New Master Authorization Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    title="Generate a secure recommended code"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Code</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewCode ? 'text' : 'password'}
                    value={newMasterCode}
                    onChange={(e) => {
                      setNewMasterCode(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter new confidential code (min 6 chars)"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowNewCode(!showNewCode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newMasterCode.length > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Length: <strong className={newMasterCode.length >= 6 ? 'text-emerald-600' : 'text-rose-600'}>{newMasterCode.length} chars</strong>
                    </span>
                    {newMasterCode.length < 6 && (
                      <span className="text-rose-600 font-medium">Minimum 6 characters required</span>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Confirm New Master Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Master Authorization Code *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmCode ? 'text' : 'password'}
                    value={confirmMasterCode}
                    onChange={(e) => {
                      setConfirmMasterCode(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Re-enter new master code to confirm"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmCode(!showConfirmCode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmMasterCode.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    {newMasterCode === confirmMasterCode ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Codes match perfectly
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium">
                        Codes do not match yet
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newMasterCode || newMasterCode.length < 6 || newMasterCode !== confirmMasterCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Master Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

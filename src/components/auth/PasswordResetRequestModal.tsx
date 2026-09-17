import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle2, X, Building2, CreditCard, GraduationCap, ArrowRight } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface PasswordResetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIdentifier?: string;
}

export const PasswordResetRequestModal: React.FC<PasswordResetRequestModalProps> = ({
  isOpen,
  onClose,
  defaultIdentifier = '',
}) => {
  const { addNotice } = useSchool();
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [targetDept, setTargetDept] = useState<'REGISTRAR' | 'FINANCE' | 'PRINCIPAL'>('REGISTRAR');
  const [reason, setReason] = useState('Forgot account password or lost credentials');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    // Dispatch official credential assistance notice
    addNotice(
      `Credential Reset Request: ${identifier.trim()}`,
      `Verified request submitted to ${targetDept} for password reset assistance. Reason: "${reason}". Authorized offices (Finance, Registrar, Principal) can issue a temporary password.`,
      'System Security',
      'URGENT'
    );

    setIsSubmitted(true);
    setTimeout(() => {
      // Auto-close after notification
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2500);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-[#0B192C] to-[#1E3E62] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-oskar">Institutional Password Assistance</h3>
                  <p className="text-xs text-blue-200">Strict Authorization Protocol</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-3"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Verification Request Logged</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your request has been queued for the <strong>{targetDept}</strong>. Once your identity is verified in-person or via recorded parent phone, a temporary login code will be issued.
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium">Closing in a moment...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Security Policy Reminder */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <strong className="block font-bold text-amber-950 mb-0.5">Official Security Rule:</strong>
                    Direct self-service password resets are disabled for student safety. Temporary access passwords can strictly be generated only by the <strong>Finance Office</strong>, <strong>Registrar</strong>, or <strong>Principal</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student ID, Account Number, or Staff Email
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. OSK-2026-0901 or teacher@oskaracademy.edu"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Direct Request To Authorized Department:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'REGISTRAR', label: 'Registrar', icon: Building2 },
                        { id: 'FINANCE', label: 'Finance', icon: CreditCard },
                        { id: 'PRINCIPAL', label: 'Principal', icon: GraduationCap },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTargetDept(id as any)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                            targetDept === id
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${targetDept === id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason for Assistance
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit Official Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

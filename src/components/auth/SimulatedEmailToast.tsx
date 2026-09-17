import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, Copy, Check, X } from 'lucide-react';

interface SimulatedEmailToastProps {
  isOpen: boolean;
  email: string;
  otpCode: string;
  onClose: () => void;
  onCopyOrFill: () => void;
}

export const SimulatedEmailToast: React.FC<SimulatedEmailToastProps> = ({
  isOpen,
  email,
  otpCode,
  onClose,
  onCopyOrFill,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(otpCode);
    setCopied(true);
    onCopyOrFill();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/40 p-4 overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-amber-400" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-400 shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-300">Simulated Inbox Notification</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">2FA Dispatched</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-snug">
                  To: <span className="font-mono text-white">{email}</span>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Passcode:</span>
                  <span className="text-sm font-mono font-bold text-amber-300 tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {otpCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Inserted!' : 'Insert'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

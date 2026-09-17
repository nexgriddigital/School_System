import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, X, ArrowRight, AlertCircle } from 'lucide-react';

interface GmailSendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientEmail: string;
  senderEmail: string;
  otpCode: string;
  roleLabel: string;
  isSending: boolean;
}

export const GmailSendConfirmationModal: React.FC<GmailSendConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recipientEmail,
  senderEmail,
  otpCode,
  roleLabel,
  isSending,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 border border-white/30 text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Confirm Gmail Dispatch</h3>
                  <p className="text-xs text-red-100">Send Authentication Email via Gmail</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSending}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4 text-slate-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  You are about to dispatch an official 6-digit OTP verification email directly through your connected Gmail account.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Sender Account:</span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[220px]">{senderEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Recipient:</span>
                  <span className="font-mono font-bold text-blue-700 truncate max-w-[220px]">{recipientEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Target Portal:</span>
                  <span className="font-semibold text-slate-800">{roleLabel}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Security:</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Strict Live Gmail OTP</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isSending}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Email Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

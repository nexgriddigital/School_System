import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft, RotateCw, Sparkles, KeyRound, Check } from 'lucide-react';

interface EmailOtpViewProps {
  email: string;
  expectedOtp: string;
  roleLabel: string;
  isSentViaGmail?: boolean;
  gmailSender?: string | null;
  onVerifySuccess: () => void;
  onBack: () => void;
  onResendOtp: () => void;
  onShake: () => void;
}

export const EmailOtpView: React.FC<EmailOtpViewProps> = ({
  email,
  expectedOtp,
  roleLabel,
  isSentViaGmail = false,
  gmailSender = null,
  onVerifySuccess,
  onBack,
  onResendOtp,
  onShake,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (errorMsg) setErrorMsg(null);

    // Handle paste event of full code
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (newDigits.every((d) => d !== '')) {
        verifyOtp(newDigits.join(''));
      }
      return;
    }

    // Single digit input
    const cleanDigit = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    setDigits(newDigits);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are filled
    if (cleanDigit && index === 5 && newDigits.every((d) => d !== '')) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    pastedData.split('').forEach((d, i) => {
      newDigits[i] = d;
    });
    setDigits(newDigits);

    const focusIdx = Math.min(pastedData.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pastedData.length === 6) {
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = (code: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (code === expectedOtp) {
        setIsSuccess(true);
        setTimeout(() => {
          onVerifySuccess();
        }, 600);
      } else {
        setErrorMsg('Invalid verification passcode. Please check the exact 6-digit code sent to your email.');
        onShake();
      }
    }, 500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      onShake();
      return;
    }
    verifyOtp(code);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(60);
    setErrorMsg(null);
    onResendOtp();
    inputRefs.current[0]?.focus();
  };

  // Mask email display for privacy: r***r@oskaracademy.edu
  const maskedEmail = (() => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  })();

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Email Verification Required</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          For security compliance, an encrypted 6-digit One-Time Passcode (OTP) was dispatched to:
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-200">
          <span>{maskedEmail}</span>
        </div>

        {/* Gmail Delivery Status Badge */}
        {isSentViaGmail && gmailSender && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 mt-1 max-w-sm mx-auto">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Sent via Gmail API (<strong className="font-mono">{gmailSender}</strong>)</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* 6-Digit OTP Boxes */}
      <form onSubmit={handleManualSubmit} className="space-y-5">
        <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all outline-none ${
                digit
                  ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white focus:shadow-md'
              }`}
            />
          ))}
        </div>

        {/* Verification Passcode Help & Expiry */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-500">
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Check your inbox for the code</span>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">Expires in 5m</span>
        </div>

        {/* Action Button */}
        <motion.button
          type="submit"
          disabled={isVerifying || isSuccess}
          whileHover={!isVerifying && !isSuccess ? { scale: 1.01 } : {}}
          whileTap={!isVerifying && !isSuccess ? { scale: 0.99 } : {}}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
          }`}
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Validating OTP Passcode...</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4" />
              <span>OTP Confirmed • Authorizing {roleLabel}...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>Verify & Complete Sign In</span>
            </div>
          )}
        </motion.button>
      </form>

      {/* Footer controls: Resend and Back */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-medium hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Account / Back</span>
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0}
          className={`inline-flex items-center gap-1.5 font-semibold transition cursor-pointer ${
            timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${timer > 0 ? '' : 'text-blue-600'}`} />
          <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend OTP Code'}</span>
        </button>
      </div>
    </div>
  );
};

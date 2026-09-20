import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ShieldAlert, Clock, RefreshCw, LogOut, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Web Audio synthesizer for subtle institutional security chime
const playSecurityChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Dual-tone gentle warning chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (err) {
    // Audio autoplay or browser context restrictions handled silently
  }
};

export const SessionTimeoutManager: React.FC = () => {
  const {
    isAuthenticated,
    sessionTimeoutMinutes,
    lastActivityTimestamp,
    recordUserActivity,
    triggerSessionTimeout,
    logout,
    currentUser,
    schoolName
  } = useSchool();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => sessionTimeoutMinutes * 60);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const chimePlayedRef = useRef<boolean>(false);
  const lastRecordedRef = useRef<number>(Date.now());

  // Determine warning threshold: 30 seconds for <= 1 min timeout, otherwise 60 seconds
  const warningThresholdSeconds = sessionTimeoutMinutes <= 1 ? 30 : 60;

  // Throttled user activity recorder
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated) return;
    const now = Date.now();
    // Only update context state at most once every 1500ms to maintain optimal 60fps UI performance
    if (now - lastRecordedRef.current > 1500) {
      lastRecordedRef.current = now;
      recordUserActivity();
    }
  }, [isAuthenticated, recordUserActivity]);

  // Attach global activity event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel'
    ];

    events.forEach(eventName => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);

  // Inactivity countdown ticker
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarningModal(false);
      chimePlayedRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityTimestamp) / 1000);
      const totalTimeoutSeconds = sessionTimeoutMinutes * 60;
      const remaining = Math.max(0, totalTimeoutSeconds - elapsedSeconds);

      setSecondsRemaining(remaining);

      // Check if session has fully expired
      if (remaining <= 0) {
        setShowWarningModal(false);
        chimePlayedRef.current = false;
        triggerSessionTimeout();
        return;
      }

      // Check if warning threshold reached
      if (remaining <= warningThresholdSeconds) {
        setShowWarningModal(true);
        if (!chimePlayedRef.current) {
          playSecurityChime();
          chimePlayedRef.current = true;
        }
      } else {
        setShowWarningModal(false);
        chimePlayedRef.current = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivityTimestamp, sessionTimeoutMinutes, warningThresholdSeconds, triggerSessionTimeout]);

  // Tab visibility change handler: immediate check when returning to tab
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastActivityTimestamp) / 1000);
        const totalTimeoutSeconds = sessionTimeoutMinutes * 60;
        if (elapsedSeconds >= totalTimeoutSeconds) {
          triggerSessionTimeout();
        } else {
          setSecondsRemaining(Math.max(0, totalTimeoutSeconds - elapsedSeconds));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, lastActivityTimestamp, sessionTimeoutMinutes, triggerSessionTimeout]);

  const handleExtendSession = () => {
    recordUserActivity();
    setShowWarningModal(false);
    chimePlayedRef.current = false;
    setSecondsRemaining(sessionTimeoutMinutes * 60);
  };

  const handleManualLogout = () => {
    setShowWarningModal(false);
    logout();
  };

  if (!isAuthenticated || !showWarningModal) {
    return null;
  }

  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / warningThresholdSeconds) * 100));

  return (
    <AnimatePresence>
      <div 
        id="session-timeout-modal-overlay" 
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <motion.div
          id="session-timeout-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white rounded-2xl shadow-2xl border-2 border-amber-400 max-w-lg w-full overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-timeout-title"
        >
          {/* High-priority institutional banner */}
          <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-6 py-4 flex items-center justify-between border-b border-amber-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/30 rounded-xl border border-amber-300/40 animate-pulse">
                <ShieldAlert className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <h3 id="session-timeout-title" className="text-base font-bold tracking-wide">
                  Session Security Inactivity Alert
                </h3>
                <p className="text-xs text-amber-100 font-medium">
                  {schoolName} Institutional Data Safety
                </p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-amber-900/60 border border-amber-400/50 text-amber-200 font-mono text-xs font-bold">
              IDLE LOCK
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Countdown Badge & Circular Progress Indicator */}
            <div className="flex flex-col items-center justify-center text-center p-4 bg-amber-50/80 rounded-xl border border-amber-200/80">
              <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#FDE68A"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#D97706"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-amber-900 leading-none">
                    {secondsRemaining}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight mt-0.5">
                    sec
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold text-amber-900">
                Automatic termination in <span className="font-mono text-sm font-bold text-amber-800">{secondsRemaining} seconds</span>
              </p>
            </div>

            {/* Explanatory security policy message */}
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  Your workstation has been inactive for an extended duration. To protect sensitive institutional records, student transcripts, and financial ledgers, your session will automatically lock.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-medium">
                <span>Active User: <strong className="text-slate-700">{currentUser?.name || 'Staff Member'}</strong></span>
                <span>Configured Limit: <strong className="text-slate-700">{sessionTimeoutMinutes} min</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                id="btn-extend-session"
                type="button"
                onClick={handleExtendSession}
                className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Extend Session & Keep Working</span>
              </button>

              <button
                id="btn-logout-now"
                type="button"
                onClick={handleManualLogout}
                className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Sign Out Now</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

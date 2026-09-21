import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchool } from '../../context/SchoolContext';
import { Sparkles, RefreshCw, X, Move, ChevronDown, CheckCircle2, Play } from 'lucide-react';

export const FloatingMascotCompanion: React.FC = () => {
  const { 
    isAuthenticated, 
    isGlobalLoading, 
    globalLoadingMessage, 
    startGlobalLoading,
    currentRole,
    schoolName 
  } = useSchool();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRoaming, setIsRoaming] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Eye cursor-tracking coordinates
  const [pupilPos, setPupilPos] = useState({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const rawMouseRef = useRef<{ x: number; y: number } | null>(null);

  // Natural blinking
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, delay);
    };
    scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Eye tracking when not in full flight
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      rawMouseRef.current = { x: e.clientX, y: e.clientY };

      if (animFrameRef.current === null) {
        animFrameRef.current = requestAnimationFrame(() => {
          animFrameRef.current = null;
          if (!containerRef.current || !rawMouseRef.current) return;

          const rect = containerRef.current.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const mouseX = rawMouseRef.current.x;
          const mouseY = rawMouseRef.current.y;

          // Screen coords for eyes
          const leftEyeScreenX = rect.left + (62 / 160) * rect.width;
          const leftEyeScreenY = rect.top + (50 / 120) * rect.height;

          const rightEyeScreenX = rect.left + (98 / 160) * rect.width;
          const rightEyeScreenY = rect.top + (50 / 120) * rect.height;

          const ldx = mouseX - leftEyeScreenX;
          const ldy = mouseY - leftEyeScreenY;
          const ldist = Math.hypot(ldx, ldy);
          const lAngle = Math.atan2(ldy, ldx);
          const maxLook = 5.2;
          const lStrength = Math.min(1, ldist / 140);
          const lRadius = maxLook * lStrength;

          const rdx = mouseX - rightEyeScreenX;
          const rdy = mouseY - rightEyeScreenY;
          const rdist = Math.hypot(rdx, rdy);
          const rAngle = Math.atan2(rdy, rdx);
          const rStrength = Math.min(1, rdist / 140);
          const rRadius = maxLook * rStrength;

          setPupilPos({
            leftX: Math.cos(lAngle) * lRadius,
            leftY: Math.sin(lAngle) * lRadius,
            rightX: Math.cos(rAngle) * rRadius,
            rightY: Math.sin(rAngle) * rRadius,
          });
        });
      }
    };

    const handleMouseLeave = () => {
      setPupilPos({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Only show while logged in
  if (!isAuthenticated) {
    return null;
  }

  // Minimized state dock button
  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl border-2 border-blue-300/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
        title="Open Floating Mascot Companion"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-900 flex items-center justify-center relative">
          <span className="text-base">🦉</span>
          {isGlobalLoading && (
            <span className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          )}
        </div>
        <span className="text-xs font-bold pr-1 group-hover:inline hidden transition-all">
          {isGlobalLoading ? 'Processing...' : 'Scholar Companion'}
        </span>
      </motion.button>
    );
  }

  const isFlying = isGlobalLoading || isRoaming;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 pointer-events-none select-none"
    >
      {/* Draggable & Floating Container */}
      <motion.div
        drag
        dragMomentum={false}
        className="relative pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center"
        // Flight floating animation around the UI when loading or roaming!
        animate={
          isFlying
            ? {
                x: [0, -140, -60, -220, -110, 0],
                y: [0, -60, -140, -70, -20, 0],
                rotate: [0, -5, 4, -6, 3, 0],
                transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
            : {
                y: [-6, 6, -6],
                rotate: [-1.5, 1.5, -1.5],
                transition: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
        }
      >
        {/* Active Loading Speech Bubble / Status Pill */}
        <AnimatePresence>
          {isGlobalLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.85 }}
              className="absolute -top-14 mb-2 whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center gap-2.5 pointer-events-auto"
            >
              {/* Spinning progress beacon */}
              <div className="relative flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                  Institutional Sync
                </span>
                <span className="text-xs text-slate-100 font-medium">
                  {globalLoadingMessage}
                </span>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-amber-400/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbiting Loading Energy Halo when Loading is Needed */}
        {isGlobalLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 -m-4 rounded-full border-2 border-dashed border-amber-400/70 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/80" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-md shadow-blue-400/80" />
          </motion.div>
        )}

        {/* The Big Scholar Owl Mascot */}
        <div 
          onClick={() => setShowMenu(!showMenu)}
          className="relative w-36 h-28 drop-shadow-xl hover:scale-105 transition-transform duration-200"
        >
          <svg
            viewBox="0 0 160 120"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="floatingOwlBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="floatingOwlBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E0F2FE" />
              </linearGradient>
              <clipPath id="floatOwlLeftEyeClip">
                <ellipse cx="62" cy="50" rx="13.2" ry="13.2" />
              </clipPath>
              <clipPath id="floatOwlRightEyeClip">
                <ellipse cx="98" cy="50" rx="13.2" ry="13.2" />
              </clipPath>
            </defs>

            {/* Glowing Aura when loading */}
            {isGlobalLoading && (
              <circle cx="80" cy="65" r="50" fill="#F59E0B" fillOpacity="0.22" className="animate-pulse" />
            )}

            {/* Ear Tufts */}
            <polygon points="46,35 34,16 60,26" fill="#1E3A8A" />
            <polygon points="114,35 126,16 100,26" fill="#1E3A8A" />

            {/* Main Body */}
            <motion.path
              d="M 38 75 C 38 40, 60 22, 80 22 C 100 22, 122 40, 122 75 C 122 102, 105 110, 80 110 C 55 110, 38 102, 38 75 Z"
              fill="url(#floatingOwlBodyGrad)"
              stroke="#1E3A8A"
              strokeWidth="2.5"
              animate={isFlying ? { scaleY: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />

            {/* White/Sky Blue Belly */}
            <path
              d="M 54 75 C 54 60, 65 52, 80 52 C 95 52, 106 60, 106 75 C 106 95, 95 106, 80 106 C 65 106, 54 95, 54 75 Z"
              fill="url(#floatingOwlBellyGrad)"
            />

            {/* Scholar Orange Tie on Belly */}
            <path d="M 76 68 L 84 68 L 82 86 L 80 90 L 78 86 Z" fill="#F59E0B" />
            <circle cx="80" cy="72" r="2.5" fill="#B45309" />

            {/* Blush Cheeks */}
            <ellipse cx="46" cy="62" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.6" />
            <ellipse cx="114" cy="62" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.6" />

            {/* Eye Sockets */}
            <ellipse cx="62" cy="50" rx="14" ry="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
            <ellipse cx="98" cy="50" rx="14" ry="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />

            {/* ------------------------------------------- */}
            {/* BIG EYE ANIMATION & PUPILS */}
            {/* ------------------------------------------- */}
            <g
              style={{
                transformOrigin: '80px 50px',
                transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
                transition: 'transform 0.08s ease-in-out',
              }}
            >
              {/* Left Eye */}
              <g clipPath="url(#floatOwlLeftEyeClip)">
                <motion.g
                  animate={
                    isGlobalLoading
                      ? {
                          x: [0, -3, 3, -2, 0],
                          y: [0, -2, 2, -1, 0],
                          transition: { repeat: Infinity, duration: 1.2 },
                        }
                      : {
                          x: pupilPos.leftX,
                          y: pupilPos.leftY,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  style={{ transformOrigin: '62px 50px' }}
                >
                  <circle cx="62" cy="50" r="7.5" fill="#0F172A" />
                  <circle cx="64" cy="48" r="2.5" fill="#FFFFFF" />
                  <circle cx="60" cy="52" r="1.2" fill="#FFFFFF" />
                </motion.g>
              </g>

              {/* Right Eye */}
              <g clipPath="url(#floatOwlRightEyeClip)">
                <motion.g
                  animate={
                    isGlobalLoading
                      ? {
                          x: [0, -3, 3, -2, 0],
                          y: [0, -2, 2, -1, 0],
                          transition: { repeat: Infinity, duration: 1.2 },
                        }
                      : {
                          x: pupilPos.rightX,
                          y: pupilPos.rightY,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  style={{ transformOrigin: '98px 50px' }}
                >
                  <circle cx="98" cy="50" r="7.5" fill="#0F172A" />
                  <circle cx="100" cy="48" r="2.5" fill="#FFFFFF" />
                  <circle cx="96" cy="52" r="1.2" fill="#FFFFFF" />
                </motion.g>
              </g>
            </g>

            {/* Golden Spectacles Rims & Bridge */}
            <circle cx="62" cy="50" r="14.5" stroke="#F59E0B" strokeWidth="2.6" fill="none" />
            <circle cx="98" cy="50" r="14.5" stroke="#F59E0B" strokeWidth="2.6" fill="none" />
            <path d="M 76 50 Q 80 47 84 50" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Cute Beak */}
            <polygon points="76,57 84,57 80,66" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />

            {/* FLAPPING WINGS IN FLIGHT / LOADING */}
            {/* Left Wing */}
            <motion.g
              animate={
                isFlying
                  ? {
                      rotate: [-18, 16, -18],
                      y: [-2, 2, -2],
                      transition: { repeat: Infinity, duration: 0.35, ease: 'easeInOut' },
                    }
                  : {
                      rotate: [-2, 2, -2],
                      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                    }
              }
              style={{ transformOrigin: '38px 80px' }}
            >
              <path
                d="M 38 82 C 24 76, 18 64, 30 58 C 40 54, 46 66, 44 80 Z"
                fill="#2563EB"
                stroke="#1D4ED8"
                strokeWidth="1.5"
              />
              <circle cx="28" cy="65" r="3" fill="#60A5FA" fillOpacity="0.7" />
              <circle cx="34" cy="71" r="2.5" fill="#60A5FA" fillOpacity="0.7" />
            </motion.g>

            {/* Right Wing */}
            <motion.g
              animate={
                isFlying
                  ? {
                      rotate: [18, -16, 18],
                      y: [-2, 2, -2],
                      transition: { repeat: Infinity, duration: 0.35, ease: 'easeInOut' },
                    }
                  : {
                      rotate: [2, -2, 2],
                      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                    }
              }
              style={{ transformOrigin: '122px 80px' }}
            >
              <path
                d="M 122 82 C 136 76, 142 64, 130 58 C 120 54, 114 66, 116 80 Z"
                fill="#2563EB"
                stroke="#1D4ED8"
                strokeWidth="1.5"
              />
              <circle cx="132" cy="65" r="3" fill="#60A5FA" fillOpacity="0.7" />
              <circle cx="126" cy="71" r="2.5" fill="#60A5FA" fillOpacity="0.7" />
            </motion.g>

            {/* Graduation Cap (Mortarboard) with Dynamic Tassel */}
            <g>
              <polygon points="80,4 122,18 80,27 38,18" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              <path d="M 58 20 C 58 28, 102 28, 102 20 Z" fill="#1E293B" />
              <circle cx="80" cy="16" r="2.5" fill="#F59E0B" />
              <motion.path
                d="M 80 16 Q 106 20 108 34"
                stroke="#F59E0B"
                strokeWidth="1.8"
                fill="none"
                animate={isFlying ? { rotate: [-4, 6, -4] } : {}}
                transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ transformOrigin: '80px 16px' }}
              />
              <circle cx="108" cy="35" r="2.2" fill="#D97706" />
            </g>
          </svg>
        </div>

        {/* Companion Control Menu / Popover */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              className="absolute bottom-28 right-0 w-64 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-700/80 text-white flex flex-col gap-2.5 z-50 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scholar Companion</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-300">
                <p className="leading-tight">
                  <span className="font-semibold text-white">{schoolName}</span>
                </p>
                <p className="text-slate-400 mt-0.5">Role: <span className="font-mono text-blue-300">{currentRole}</span></p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                {isGlobalLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-[11px] font-medium text-slate-200">
                  {isGlobalLoading ? globalLoadingMessage : 'System Operations Synced & Healthy'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  onClick={() => {
                    startGlobalLoading('Synchronizing institutional registry...', 2500);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Test Loading Flight Animation</span>
                </button>

                <button
                  onClick={() => setIsRoaming(!isRoaming)}
                  className={`w-full py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isRoaming
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Move className="w-3 h-3" />
                  <span>{isRoaming ? 'Stop Roaming Float' : 'Float Around UI (Roam)'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsMinimized(true);
                    setShowMenu(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-center transition cursor-pointer"
                >
                  Minimize to Corner Dock
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-1.5">
                Drag to reposition • Floats automatically during system operations
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

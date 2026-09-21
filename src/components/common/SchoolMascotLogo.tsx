import React, { useState, useEffect, useRef, useId } from 'react';

interface SchoolMascotLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showGlow?: boolean;
  withBackground?: boolean;
  interactive?: boolean;
  followCursor?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

/**
 * Official School Mascot Guy (Scholar Blue Owl with Graduation Cap & Round Spectacles)
 * Features dynamic cursor-tracking eyes and natural blinking animations.
 */
export const SchoolMascotLogo: React.FC<SchoolMascotLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = false,
  withBackground = false,
  interactive = false,
  followCursor = true,
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const rawMouseRef = useRef<{ x: number; y: number } | null>(null);

  // Pupil offsets in SVG coordinate units
  const [pupilPos, setPupilPos] = useState({
    leftX: 0,
    leftY: 0,
    rightX: 0,
    rightY: 0,
  });

  // Natural blink state
  const [isBlinking, setIsBlinking] = useState(false);

  // Cursor Tracking Animation Logic
  useEffect(() => {
    if (!followCursor) return;

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

          // Eye centers in screen pixels (left eye at 38%, right eye at 62%, vertical center at 49%)
          const leftEyeScreenX = rect.left + rect.width * 0.38;
          const leftEyeScreenY = rect.top + rect.height * 0.49;

          const rightEyeScreenX = rect.left + rect.width * 0.62;
          const rightEyeScreenY = rect.top + rect.height * 0.49;

          // Left eye angle and displacement
          const ldx = mouseX - leftEyeScreenX;
          const ldy = mouseY - leftEyeScreenY;
          const ldist = Math.hypot(ldx, ldy);
          const lAngle = Math.atan2(ldy, ldx);
          const maxDeflection = 5.2; // in SVG units
          const lStrength = Math.min(1, ldist / 120);
          const lRadius = maxDeflection * lStrength;

          // Right eye angle and displacement
          const rdx = mouseX - rightEyeScreenX;
          const rdy = mouseY - rightEyeScreenY;
          const rdist = Math.hypot(rdx, rdy);
          const rAngle = Math.atan2(rdy, rdx);
          const rStrength = Math.min(1, rdist / 120);
          const rRadius = maxDeflection * rStrength;

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
      // Gently return to forward gaze when mouse exits viewport
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
  }, [followCursor]);

  // Periodic natural blinking animation
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextBlink = () => {
      // Periodic blink between 3.5s and 7.5s
      const delay = 3500 + Math.random() * 4000;
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

  // Interactive click triggers a cute rapid wink/blink
  const handleClick = () => {
    if (interactive) {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 120);
        }, 80);
      }, 120);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClasses} ${
        withBackground
          ? 'rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-blue-950/80 p-1.5 border border-blue-400/30 shadow-md'
          : ''
      } ${className} ${interactive ? 'hover:scale-105 transition-transform duration-200 cursor-pointer' : ''}`}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md pointer-events-none -z-10" />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`owlMascotBodyGrad_${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id={`owlMascotBellyGrad_${idPrefix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <filter id={`mascotShadow_${idPrefix}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.3" />
          </filter>

          {/* Sclera clip paths to prevent pupils from spilling beyond the eyes */}
          <clipPath id={`leftEyeClip_${idPrefix}`}>
            <circle cx="38" cy="49" r="13" />
          </clipPath>
          <clipPath id={`rightEyeClip_${idPrefix}`}>
            <circle cx="62" cy="49" r="13" />
          </clipPath>
        </defs>

        {/* Ear Tufts */}
        <polygon points="28,26 21,13 40,22" fill="#1E40AF" />
        <polygon points="72,26 79,13 60,22" fill="#1E40AF" />

        {/* Main Owl Body */}
        <ellipse cx="50" cy="58" rx="33" ry="32" fill={`url(#owlMascotBodyGrad_${idPrefix})`} stroke="#1E3A8A" strokeWidth="1.5" />

        {/* White/Sky Blue Belly */}
        <ellipse cx="50" cy="65" rx="19" ry="20" fill={`url(#owlMascotBellyGrad_${idPrefix})`} stroke="#BAE6FD" strokeWidth="1" />

        {/* Scholar Orange Tie on Belly */}
        <path d="M 48 64 L 52 64 L 51.5 77 L 50 82 L 48.5 77 Z" fill="#F59E0B" />
        <circle cx="50" cy="68" r="1.2" fill="#B45309" />

        {/* Blush Cheeks */}
        <ellipse cx="26" cy="56" rx="4.5" ry="3.2" fill="#F472B6" fillOpacity="0.75" />
        <ellipse cx="74" cy="56" rx="4.5" ry="3.2" fill="#F472B6" fillOpacity="0.75" />

        {/* Cute Raised Wings / Paws (Excited scholarly pose) */}
        {/* Left Wing */}
        <path
          d="M 18 64 C 18 57, 28 55, 33 60 C 34 65, 30 72, 22 71 C 18 70, 18 67, 18 64 Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="1.2"
        />
        <circle cx="27" cy="58" r="2" fill="#60A5FA" fillOpacity="0.6" />
        <circle cx="31" cy="61" r="1.8" fill="#60A5FA" fillOpacity="0.6" />

        {/* Right Wing */}
        <path
          d="M 82 64 C 82 57, 72 55, 67 60 C 66 65, 70 72, 78 71 C 82 70, 82 67, 82 64 Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="1.2"
        />
        <circle cx="73" cy="58" r="2" fill="#60A5FA" fillOpacity="0.6" />
        <circle cx="69" cy="61" r="1.8" fill="#60A5FA" fillOpacity="0.6" />

        {/* ------------------------------------------------------------- */}
        {/* ANIMATED EYES (Follows cursor + Blink animation) */}
        {/* ------------------------------------------------------------- */}
        <g
          style={{
            transformOrigin: '50px 49px',
            transform: isBlinking ? 'scaleY(0.06)' : 'scaleY(1)',
            transition: 'transform 0.09s ease-in-out',
          }}
        >
          {/* White Eye Scleras */}
          <circle cx="38" cy="49" r="14.5" fill="#FFFFFF" />
          <circle cx="62" cy="49" r="14.5" fill="#FFFFFF" />

          {/* Left Eye Pupil + Highlights */}
          <g clipPath={`url(#leftEyeClip_${idPrefix})`}>
            <g
              transform={`translate(${pupilPos.leftX.toFixed(2)}, ${pupilPos.leftY.toFixed(2)})`}
              style={{
                transition: 'transform 0.05s ease-out',
              }}
            >
              {/* Glossy black pupil */}
              <circle cx="38" cy="49" r="7.6" fill="#0F172A" />
              {/* Highlights (Large reflection top left, small reflection bottom right) */}
              <circle cx="36" cy="46.5" r="2.6" fill="#FFFFFF" />
              <circle cx="39.5" cy="51.5" r="1.3" fill="#FFFFFF" />
            </g>
          </g>

          {/* Right Eye Pupil + Highlights */}
          <g clipPath={`url(#rightEyeClip_${idPrefix})`}>
            <g
              transform={`translate(${pupilPos.rightX.toFixed(2)}, ${pupilPos.rightY.toFixed(2)})`}
              style={{
                transition: 'transform 0.05s ease-out',
              }}
            >
              {/* Glossy black pupil */}
              <circle cx="62" cy="49" r="7.6" fill="#0F172A" />
              {/* Highlights */}
              <circle cx="60" cy="46.5" r="2.6" fill="#FFFFFF" />
              <circle cx="63.5" cy="51.5" r="1.3" fill="#FFFFFF" />
            </g>
          </g>
        </g>

        {/* Closed Eye Arcs during blink for cute character expression */}
        {isBlinking && (
          <g stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round">
            <path d="M 28 49 Q 38 53 48 49" fill="none" />
            <path d="M 52 49 Q 62 53 72 49" fill="none" />
          </g>
        )}

        {/* Golden Spectacles Rims & Bridge (Drawn on top of eyes) */}
        <circle cx="38" cy="49" r="14" fill="none" stroke="#F59E0B" strokeWidth="2.6" />
        <circle cx="62" cy="49" r="14" fill="none" stroke="#F59E0B" strokeWidth="2.6" />
        {/* Spectacle Bridge */}
        <path d="M 48 48 Q 50 45 52 48" fill="none" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />

        {/* Cute Triangular Beak */}
        <polygon points="47,54 53,54 50,62" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />

        {/* Graduation Cap (Mortarboard) with Shadow */}
        <g filter={`url(#mascotShadow_${idPrefix})`}>
          {/* Skullcap Base */}
          <path d="M 37 25 C 37 19, 63 19, 63 25 Z" fill="#0F172A" />
          {/* Diamond Mortarboard Top */}
          <polygon points="50,11 81,22 50,31 19,22" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
          <polygon points="50,12 79,22 50,30 21,22" fill="#0F172A" />
          {/* Center Gold Button */}
          <circle cx="50" cy="21" r="2.8" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
          {/* Arched Orange Tassel Cord */}
          <path d="M 50 21 C 60 17, 72 20, 71 34" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
          {/* Tassel Fringe Pendant */}
          <circle cx="71" cy="35" r="1.8" fill="#D97706" />
          <path d="M 70 36 L 72 36 L 73 42 L 69 42 Z" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  );
};

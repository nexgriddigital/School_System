import React from 'react';
import { motion } from 'motion/react';

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
 * Animated branding icon with continuous gentle floating motion.
 */
export const SchoolMascotLogo: React.FC<SchoolMascotLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = false,
  withBackground = false,
  interactive = false,
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      animate={{
        y: [-2, 2.5, -2],
        rotate: [-1, 1.2, -1],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      }}
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
          <linearGradient id="owlMascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="owlMascotBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <filter id="mascotShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ear Tufts */}
        <polygon points="28,26 21,13 40,22" fill="#1E40AF" />
        <polygon points="72,26 79,13 60,22" fill="#1E40AF" />

        {/* Main Owl Body */}
        <ellipse cx="50" cy="58" rx="33" ry="32" fill="url(#owlMascotBodyGrad)" stroke="#1E3A8A" strokeWidth="1.5" />

        {/* White/Sky Blue Belly */}
        <ellipse cx="50" cy="65" rx="19" ry="20" fill="url(#owlMascotBellyGrad)" stroke="#BAE6FD" strokeWidth="1" />

        {/* Scholar Orange Tie on Belly */}
        <path d="M 48 64 L 52 64 L 51.5 77 L 50 82 L 48.5 77 Z" fill="#F59E0B" />
        <circle cx="50" cy="68" r="1.2" fill="#B45309" />

        {/* Blush Cheeks */}
        <ellipse cx="26" cy="56" rx="4.5" ry="3.2" fill="#F472B6" fillOpacity="0.75" />
        <ellipse cx="74" cy="56" rx="4.5" ry="3.2" fill="#F472B6" fillOpacity="0.75" />

        {/* Cute Raised Wings / Paws (Excited scholarly pose with subtle flap) */}
        {/* Left Wing */}
        <motion.g
          animate={{ rotate: [-2, 3, -2] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '22px 68px' }}
        >
          <path
            d="M 18 64 C 18 57, 28 55, 33 60 C 34 65, 30 72, 22 71 C 18 70, 18 67, 18 64 Z"
            fill="#2563EB"
            stroke="#1D4ED8"
            strokeWidth="1.2"
          />
          <circle cx="27" cy="58" r="2" fill="#60A5FA" fillOpacity="0.6" />
          <circle cx="31" cy="61" r="1.8" fill="#60A5FA" fillOpacity="0.6" />
        </motion.g>

        {/* Right Wing */}
        <motion.g
          animate={{ rotate: [2, -3, 2] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '78px 68px' }}
        >
          <path
            d="M 82 64 C 82 57, 72 55, 67 60 C 66 65, 70 72, 78 71 C 82 70, 82 67, 82 64 Z"
            fill="#2563EB"
            stroke="#1D4ED8"
            strokeWidth="1.2"
          />
          <circle cx="73" cy="58" r="2" fill="#60A5FA" fillOpacity="0.6" />
          <circle cx="69" cy="61" r="1.8" fill="#60A5FA" fillOpacity="0.6" />
        </motion.g>

        {/* Golden Spectacles Frame Background White Eyes */}
        <circle cx="38" cy="49" r="14.5" fill="#FFFFFF" />
        <circle cx="62" cy="49" r="14.5" fill="#FFFFFF" />

        {/* Large Expressive Eyes (Glossy black pupils with reflections) */}
        <circle cx="41" cy="49" r="7.5" fill="#0F172A" />
        <circle cx="65" cy="49" r="7.5" fill="#0F172A" />
        {/* Highlights (Large reflection top left, small bottom right) */}
        <circle cx="39" cy="46.5" r="2.6" fill="#FFFFFF" />
        <circle cx="42.5" cy="51.5" r="1.3" fill="#FFFFFF" />
        <circle cx="63" cy="46.5" r="2.6" fill="#FFFFFF" />
        <circle cx="66.5" cy="51.5" r="1.3" fill="#FFFFFF" />

        {/* Golden Spectacles Rims & Bridge */}
        <circle cx="38" cy="49" r="14" fill="none" stroke="#F59E0B" strokeWidth="2.6" />
        <circle cx="62" cy="49" r="14" fill="none" stroke="#F59E0B" strokeWidth="2.6" />
        {/* Spectacle Bridge */}
        <path d="M 48 48 Q 50 45 52 48" fill="none" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />

        {/* Cute Triangular Beak */}
        <polygon points="47,54 53,54 50,62" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />

        {/* Graduation Cap (Mortarboard) with Shadow */}
        <g filter="url(#mascotShadow)">
          {/* Skullcap Base */}
          <path d="M 37 25 C 37 19, 63 19, 63 25 Z" fill="#0F172A" />
          {/* Diamond Mortarboard Top */}
          <polygon points="50,11 81,22 50,31 19,22" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
          <polygon points="50,12 79,22 50,30 21,22" fill="#0F172A" />
          {/* Center Gold Button */}
          <circle cx="50" cy="21" r="2.8" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
          {/* Arched Orange Tassel Cord with gentle motion */}
          <motion.path
            d="M 50 21 C 60 17, 72 20, 71 34"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeLinecap="round"
            animate={{ rotate: [-2, 3, -2] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ transformOrigin: '50px 21px' }}
          />
          {/* Tassel Fringe Pendant */}
          <circle cx="71" cy="35" r="1.8" fill="#D97706" />
          <path d="M 70 36 L 72 36 L 73 42 L 69 42 Z" fill="#F59E0B" />
        </g>
      </svg>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedMascotProps {
  isPasswordFocused: boolean;
  showPassword: boolean;
  inputLength: number;
  isAuthenticating: boolean;
  isSuccess: boolean;
  hasError: boolean;
}

export const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  isPasswordFocused,
  showPassword,
  inputLength,
  isAuthenticating,
  isSuccess,
  hasError,
}) => {
  // Calculate eye look direction based on input length (max ~30 chars)
  const lookX = Math.min(Math.max((inputLength - 15) * 0.4, -6), 6);
  const lookY = isPasswordFocused ? 0 : 2;

  // Eyes covered state
  const isCoveringEyes = isPasswordFocused && !showPassword;
  const isPeeking = isPasswordFocused && showPassword;

  return (
    <div className="relative w-36 h-28 mx-auto -mb-2 select-none flex items-end justify-center pointer-events-none">
      <svg
        viewBox="0 0 160 120"
        className="w-full h-full overflow-visible drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient Glow behind mascot */}
        <circle cx="80" cy="65" r="45" fill="#3B82F6" fillOpacity="0.15" />

        {/* Mascot Ears / Horns / Scholar Cap Tassel Base */}
        <motion.polygon
          points="46,35 34,16 60,26"
          fill="#1E3A8A"
          animate={{ rotate: hasError ? [0, -6, 6, 0] : 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.polygon
          points="114,35 126,16 100,26"
          fill="#1E3A8A"
          animate={{ rotate: hasError ? [0, 6, -6, 0] : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Main Body / Face (Friendly Academic Guardian Owl) */}
        <motion.path
          d="M 38 75 C 38 40, 60 22, 80 22 C 100 22, 122 40, 122 75 C 122 102, 105 110, 80 110 C 55 110, 38 102, 38 75 Z"
          fill="#1E40AF"
          stroke="#1E3A8A"
          strokeWidth="2.5"
          animate={{
            scaleY: isAuthenticating ? [1, 1.04, 1] : 1,
            y: isSuccess ? [0, -8, 0] : 0,
          }}
          transition={{ repeat: isAuthenticating ? Infinity : 0, duration: 0.6 }}
        />

        {/* Chest Belly Plate (Gold / Cream) */}
        <path
          d="M 54 75 C 54 60, 65 52, 80 52 C 95 52, 106 60, 106 75 C 106 95, 95 106, 80 106 C 65 106, 54 95, 54 75 Z"
          fill="#DBEAFE"
        />

        {/* Scholar Tie / Badge */}
        <path d="M 76 68 L 84 68 L 82 86 L 80 90 L 78 86 Z" fill="#F59E0B" />
        <circle cx="80" cy="72" r="2.5" fill="#B45309" />

        {/* Eye Sockets (White backdrop) */}
        <ellipse cx="62" cy="50" rx="14" ry="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
        <ellipse cx="98" cy="50" rx="14" ry="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />

        {/* LEFT EYE PUPIL */}
        <motion.g
          animate={{
            x: isCoveringEyes ? 0 : isPeeking ? 2 : lookX,
            y: isCoveringEyes ? 0 : isPeeking ? -1 : lookY,
            scaleY: isCoveringEyes ? 0.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <circle cx="62" cy="50" r="7.5" fill="#0F172A" />
          {/* Pupil light reflections */}
          <circle cx="64" cy="48" r="2.5" fill="#FFFFFF" />
          <circle cx="60" cy="52" r="1.2" fill="#FFFFFF" />
        </motion.g>

        {/* RIGHT EYE PUPIL */}
        <motion.g
          animate={{
            x: isCoveringEyes ? 0 : isPeeking ? 4 : lookX,
            y: isCoveringEyes ? 0 : isPeeking ? -1 : lookY,
            scaleY: isCoveringEyes ? 0.1 : isPeeking ? 1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <circle cx="98" cy="50" r="7.5" fill="#0F172A" />
          {/* Pupil light reflections */}
          <circle cx="100" cy="48" r="2.5" fill="#FFFFFF" />
          <circle cx="96" cy="52" r="1.2" fill="#FFFFFF" />
        </motion.g>

        {/* Glasses / Golden Scholar Rim (Matching official mascot) */}
        <circle cx="62" cy="50" r="14.5" stroke="#F59E0B" strokeWidth="2.6" fill="none" />
        <circle cx="98" cy="50" r="14.5" stroke="#F59E0B" strokeWidth="2.6" fill="none" />
        <path d="M 76 50 Q 80 47 84 50" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="none" />

        {/* Cute Beak */}
        <motion.polygon
          points="76,57 84,57 80,66"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1"
          animate={{
            y: isSuccess ? [0, -2, 0] : 0,
          }}
        />

        {/* Blush Cheeks */}
        <ellipse cx="46" cy="62" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.5" />
        <ellipse cx="114" cy="62" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.5" />

        {/* LEFT HAND / WING */}
        <motion.g
          animate={
            isCoveringEyes
              ? { x: 22, y: -24, rotate: 22 }
              : isPeeking
              ? { x: 22, y: -24, rotate: 22 }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ transformOrigin: '32px 86px' }}
        >
          <path
            d="M 32 86 C 26 80, 24 68, 38 62 C 46 60, 52 74, 48 86 Z"
            fill="#1D4ED8"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />
          {/* Cute Feathers / Fingers */}
          <circle cx="44" cy="64" r="3.5" fill="#2563EB" />
          <circle cx="49" cy="69" r="3" fill="#2563EB" />
        </motion.g>

        {/* RIGHT HAND / WING */}
        <motion.g
          animate={
            isCoveringEyes
              ? { x: -22, y: -24, rotate: -22 }
              : isPeeking
              ? { x: -14, y: -8, rotate: -8 } // Lowered slightly so one eye peeks!
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ transformOrigin: '128px 86px' }}
        >
          <path
            d="M 128 86 C 134 80, 136 68, 122 62 C 114 60, 108 74, 112 86 Z"
            fill="#1D4ED8"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />
          {/* Cute Feathers / Fingers */}
          <circle cx="116" cy="64" r="3.5" fill="#2563EB" />
          <circle cx="111" cy="69" r="3" fill="#2563EB" />
        </motion.g>

        {/* Scholar Mortarboard Cap */}
        <motion.g
          animate={{
            rotate: hasError ? [-4, 4, -4, 4, 0] : isSuccess ? [0, -10, 5, 0] : 0,
            y: isAuthenticating ? [0, -3, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: '80px 20px' }}
        >
          {/* Cap Diamond */}
          <polygon points="80,4 122,18 80,27 38,18" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          {/* Cap Crown */}
          <path d="M 58 20 C 58 28, 102 28, 102 20 Z" fill="#1E293B" />
          {/* Golden Button */}
          <circle cx="80" cy="16" r="2.5" fill="#F59E0B" />
          {/* Tassel */}
          <path d="M 80 16 Q 106 20 108 34" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <circle cx="108" cy="35" r="2" fill="#D97706" />
        </motion.g>
      </svg>
    </div>
  );
};

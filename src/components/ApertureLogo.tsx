import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ApertureLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
}

export const ApertureLogo: React.FC<ApertureLogoProps> = ({
  size = 'md',
  animated = true,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-5xl sm:text-6xl',
  };

  return (
    <div
      className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Camera Aperture Icon */}
      <div className="relative flex items-center justify-center">
        {/* Glow halo on hover */}
        <div
          className={`absolute inset-0 rounded-full bg-[#FFB238] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
            size === 'lg' ? 'scale-150' : 'scale-125'
          }`}
        />

        <motion.svg
          viewBox="0 0 100 100"
          className={`${iconSizes[size]} text-[#FFB238] drop-shadow-[0_0_12px_rgba(255,178,56,0.4)] relative z-10`}
          animate={{
            rotate: isHovered ? 90 : 0,
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Outer Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="opacity-90"
          />

          {/* Inner Aperture Blades forming camera shutter */}
          <g className={animated ? 'animate-apertureOrigin' : ''}>
            {/* Blade 1 */}
            <path
              d="M 50 12 L 80 40 L 58 50 Z"
              fill="url(#amberGlow)"
              opacity="0.9"
            />
            {/* Blade 2 */}
            <path
              d="M 88 50 L 60 80 L 50 58 Z"
              fill="#FFB238"
              opacity="0.95"
            />
            {/* Blade 3 */}
            <path
              d="M 50 88 L 20 60 L 42 50 Z"
              fill="#2AC9B0"
              opacity="0.85"
            />
            {/* Blade 4 */}
            <path
              d="M 12 50 L 40 20 L 50 42 Z"
              fill="url(#tealGlow)"
              opacity="0.9"
            />
          </g>

          {/* Aperture Lens Center Aperture Light */}
          <motion.circle
            cx="50"
            cy="50"
            r="11"
            fill="#0A0B0F"
            stroke="currentColor"
            strokeWidth="3"
            animate={{
              r: isHovered ? 14 : 11,
            }}
            transition={{ duration: 0.3 }}
          />

          <circle cx="50" cy="50" r="4" fill="#FFB238" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC870" />
              <stop offset="100%" stopColor="#FFB238" />
            </linearGradient>
            <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2AC9B0" />
              <stop offset="100%" stopColor="#1DA18C" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Brand Name Text: "WATCH py" */}
      <div className={`font-display font-bold tracking-wider leading-none flex items-baseline ${textSizes[size]}`}>
        <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] group-hover:text-slate-100 transition-colors">
          WATCH
        </span>
        <span className="text-[#FFB238] ml-1 font-extrabold drop-shadow-[0_0_12px_rgba(255,178,56,0.5)] group-hover:text-[#FFC870] transition-colors">
          py
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2AC9B0] ml-1.5 mb-1 inline-block animate-pulse" />
      </div>
    </div>
  );
};

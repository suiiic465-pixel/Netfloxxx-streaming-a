import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApertureLogo } from './ApertureLogo';
import { Film, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface PageLoadSplashProps {
  onFinish: () => void;
}

export const PageLoadSplash: React.FC<PageLoadSplashProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const statusMessages = [
    'Calibrating Aperture Cinema Engine...',
    'Syncing 4K Dolby Atmos Audio Stream...',
    'Loading Firestore Catalog & Titles...',
    'Preparing Premium Watch PY Experience...'
  ];

  // Smooth progress bar counter from 0 to 100% over ~2.4 seconds
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentProgress);

      // Cycle status messages
      if (currentProgress > 75) {
        setStatusIndex(3);
      } else if (currentProgress > 50) {
        setStatusIndex(2);
      } else if (currentProgress > 25) {
        setStatusIndex(1);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            onFinish();
          }, 600); // match exit transition
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#07080B] flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden font-sans select-none"
        >
          {/* Ambient Glowing Lens Flares */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFB238]/10 rounded-full blur-[160px] animate-pulse" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2AC9B0]/10 rounded-full blur-[140px]" />
            
            {/* Cinematic Horizontal Anamorphic Flare Beam */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0, 0.8, 0.3], scaleX: [0, 1.5, 1] }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFB238]/60 to-transparent blur-xs -translate-y-1/2"
            />

            {/* Subtle Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>

          {/* Top Bar Status Badges */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex items-center justify-between text-slate-400 text-xs font-mono-meta z-10"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-[#FFB238] animate-bounce" />
              <span className="text-white font-bold tracking-wide">WATCH PY</span>
              <span className="text-slate-500">v3.0 ULTRA</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>4K HDR ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2AC9B0] animate-ping" />
                <span className="text-[#2AC9B0] font-bold">STREAM ONLINE</span>
              </div>
            </div>
          </motion.div>

          {/* Center Brand Hero & Aperture Shutter */}
          <div className="relative flex flex-col items-center justify-center text-center z-10 max-w-md w-full my-auto space-y-8">
            {/* Aperture Logo Container with Glowing Orbit Rings */}
            <div className="relative">
              {/* Pulsing Outer Orbit */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-8 rounded-full border border-dashed border-[#FFB238]/30 pointer-events-none"
              />
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-14 rounded-full border border-dotted border-[#2AC9B0]/20 pointer-events-none"
              />

              {/* Central Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 drop-shadow-[0_0_35px_rgba(255,178,56,0.3)]"
              >
                <ApertureLogo size="lg" animated={true} />
              </motion.div>
            </div>

            {/* Typography & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238] text-[10px] font-mono-meta font-bold uppercase tracking-wider">
                  Cinema Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#2AC9B0]/15 border border-[#2AC9B0]/30 text-[#2AC9B0] text-[10px] font-mono-meta font-bold uppercase tracking-wider">
                  Dolby Atmos
                </span>
              </div>

              <p className="text-xs sm:text-sm font-mono-meta text-slate-400 tracking-widest uppercase pt-1">
                Unlimited Movies & Series Experience
              </p>
            </motion.div>

            {/* Progress Bar & Percentage Meter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full space-y-3 pt-2"
            >
              {/* Outer Progress Track */}
              <div className="relative w-full h-2 rounded-full bg-white/10 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                {/* Animated Inner Fill */}
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FFB238] via-[#FF8C00] to-[#2AC9B0] shadow-[0_0_15px_rgba(255,178,56,0.8)] relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                >
                  {/* Leading Light Glint */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-xs rounded-full animate-pulse" />
                </motion.div>
              </div>

              {/* Status Text & Progress Counter */}
              <div className="flex items-center justify-between text-xs font-mono-meta text-slate-400 px-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-slate-300 font-medium"
                  >
                    <Film className="w-3.5 h-3.5 text-[#2AC9B0] animate-spin" />
                    <span>{statusMessages[statusIndex]}</span>
                  </motion.span>
                </AnimatePresence>

                <span className="font-bold text-[#FFB238] font-mono text-sm">
                  {progress}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Soundwave Equalizer & Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full flex items-center justify-between text-slate-500 text-[11px] font-mono-meta z-10 pt-4 border-t border-white/5"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-[#2AC9B0]" />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#2AC9B0] animate-pulse" />
                <span className="w-0.5 h-3 bg-[#FFB238] animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#2AC9B0] animate-pulse delay-150" />
                <span className="w-0.5 h-2.5 bg-[#FFB238] animate-pulse delay-100" />
              </div>
              <span className="hidden xs:inline">Spatial Audio Ready</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3 h-3 text-[#FFB238]" />
              <span>Premium Cinematic Web App</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


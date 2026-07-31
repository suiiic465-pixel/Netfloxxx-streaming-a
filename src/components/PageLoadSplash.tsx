import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApertureLogo } from './ApertureLogo';

interface PageLoadSplashProps {
  onFinish: () => void;
}

export const PageLoadSplash: React.FC<PageLoadSplashProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'shutter' | 'brand' | 'exit'>('shutter');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('brand'), 500);
    const t2 = setTimeout(() => setStage('exit'), 1700);
    const t3 = setTimeout(() => onFinish(), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#0A0B0F] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Radial Aperture Lens Flare Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,178,56,0.15)_0%,rgba(42,201,176,0.05)_40%,transparent_70%)] animate-pulse" />

          {/* Opening Camera Lens Aperture Animation */}
          <div className="relative flex flex-col items-center justify-center space-y-6">
            <motion.div
              initial={{ scale: 0.3, rotate: -180, opacity: 0 }}
              animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <ApertureLogo size="lg" animated={true} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: stage === 'brand' ? 1 : 0, y: stage === 'brand' ? 0 : 10 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-mono-meta tracking-widest text-[#2AC9B0] uppercase"
            >
              Initializing Cinematic Aperture...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

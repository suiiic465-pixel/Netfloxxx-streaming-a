import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, ArrowRight, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { ApertureLogo } from './ApertureLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

export const AVATAR_OPTIONS = {
  male: [
    {
      id: 'm1',
      name: 'Cyber Nomad',
      url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      tag: 'Neon Tech'
    },
    {
      id: 'm2',
      name: 'Stellar Commander',
      url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      tag: 'Deep Space'
    }
  ],
  female: [
    {
      id: 'f1',
      name: 'Neural Hacker',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      tag: 'Cyberpunk'
    },
    {
      id: 'f2',
      name: 'Horizon Pilot',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      tag: 'Futuristic'
    }
  ]
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleGenderSelect = (selectedGender: 'male' | 'female') => {
    setGender(selectedGender);
    // Default pick the first avatar option for chosen gender
    setSelectedAvatarUrl(AVATAR_OPTIONS[selectedGender][0].url);
  };

  const handleFinish = () => {
    const finalName = userName.trim() || 'WatchPY Streamer';
    const finalAvatar = selectedAvatarUrl || (gender ? AVATAR_OPTIONS[gender][0].url : AVATAR_OPTIONS.female[0].url);
    
    const newProfile: UserProfile = {
      id: `u-${Date.now()}`,
      name: finalName,
      avatar: finalAvatar,
      isKids: false
    };

    onComplete(newProfile);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl">
        {/* Animated Glow Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FFB238]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#2AC9B0]/15 rounded-full blur-[120px] animate-pulse" />
        </div>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl glass-panel border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden text-center"
        >
          {/* Header Progress Indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <ApertureLogo size="sm" />

            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-8 bg-[#FFB238]'
                      : s < step
                      ? 'w-4 bg-[#2AC9B0]'
                      : 'w-4 bg-white/10'
                  }`}
                />
              ))}
            </div>

            {onSkip && (
              <button
                onClick={onSkip}
                className="text-xs font-mono-meta text-slate-400 hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
          </div>

          {/* STEP 1: Name Input */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB238]/10 text-[#FFB238] border border-[#FFB238]/20 text-xs font-mono-meta font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1 of 3 • Personalize Experience
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
                  WELCOME TO WATCH PY
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Let's personalize your cinema dashboard. What should we call you?
                </p>
              </div>

              <div className="relative max-w-sm mx-auto mt-4">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userName.trim()) setStep(2);
                  }}
                  placeholder="Enter your name or alias..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl bg-black/60 border border-white/20 text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:border-[#FFB238] focus:ring-2 focus:ring-[#FFB238]/30 transition-all text-center"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!userName.trim()}
                  className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-[#FFB238] to-[#2AC9B0] text-[#0A0B0F] font-bold text-sm shadow-[0_0_25px_rgba(255,178,56,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Gender Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2AC9B0]/10 text-[#2AC9B0] border border-[#2AC9B0]/20 text-xs font-mono-meta font-bold">
                <User className="w-3.5 h-3.5" />
                Step 2 of 3 • Avatar Profile
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
                  SELECT YOUR PREFERENCE
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                  Select your profile category to generate custom illustrated avatar options.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGenderSelect('male')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    gender === 'male'
                      ? 'bg-[#FFB238]/20 border-[#FFB238] shadow-[0_0_20px_rgba(255,178,56,0.3)]'
                      : 'bg-black/40 border-white/10 hover:border-white/30 text-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 text-[#FFB238] flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    ♂
                  </div>
                  <h3 className="font-bold text-sm text-white">Male</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono-meta">Agent & Nomad</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGenderSelect('female')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    gender === 'female'
                      ? 'bg-[#2AC9B0]/20 border-[#2AC9B0] shadow-[0_0_20px_rgba(42,201,176,0.3)]'
                      : 'bg-black/40 border-white/10 hover:border-white/30 text-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 text-[#2AC9B0] flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    ♀
                  </div>
                  <h3 className="font-bold text-sm text-white">Female</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono-meta">Hacker & Pilot</p>
                </motion.button>
              </div>

              <div className="flex items-center gap-3 max-w-sm mx-auto pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!gender}
                  className="flex-1 py-3.5 rounded-2xl bg-[#FFB238] text-[#0A0B0F] font-bold text-sm shadow-[0_0_20px_rgba(255,178,56,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Choose Avatar Option */}
          {step === 3 && gender && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB238]/10 text-[#FFB238] border border-[#FFB238]/20 text-xs font-mono-meta font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Step 3 of 3 • Pick Avatar Style
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
                  CHOOSE YOUR AVATAR
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                  Pick your illustrated character avatar for Watch PY.
                </p>
              </div>

              {/* 2 Avatar options per gender */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                {AVATAR_OPTIONS[gender].map((opt) => {
                  const isSelected = selectedAvatarUrl === opt.url;
                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatarUrl(opt.url)}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FFB238]/20 border-[#FFB238] shadow-[0_0_25px_rgba(255,178,56,0.4)] ring-2 ring-[#FFB238]'
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                        <img
                          src={opt.url}
                          alt={opt.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FFB238]/30 flex items-center justify-center">
                            <Check className="w-8 h-8 text-[#0A0B0F] font-bold" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-white">{opt.name}</h4>
                      <span className="text-[10px] font-mono-meta text-[#2AC9B0] block mt-0.5">
                        {opt.tag}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 max-w-sm mx-auto pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFB238] to-[#2AC9B0] text-[#0A0B0F] font-extrabold text-sm shadow-[0_0_30px_rgba(255,178,56,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Start Watching</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

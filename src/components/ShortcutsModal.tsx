import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Sparkles, Navigation, Search, Film, Tv, Bookmark, User, Play, Shield, Command } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Playback & Actions' | 'Modals & Overlays';
  icon: React.ReactNode;
}

export const SHORTCUT_RULES: ShortcutItem[] = [
  {
    keys: ['H'],
    description: 'Jump to Home Tab',
    category: 'Navigation',
    icon: <Navigation className="w-4 h-4 text-[#FFB238]" />
  },
  {
    keys: ['M'],
    description: 'Jump to My Saved List',
    category: 'Navigation',
    icon: <Bookmark className="w-4 h-4 text-[#2AC9B0]" />
  },
  {
    keys: ['F'],
    description: 'Filter Movies',
    category: 'Navigation',
    icon: <Film className="w-4 h-4 text-purple-400" />
  },
  {
    keys: ['T'],
    description: 'Filter TV Shows',
    category: 'Navigation',
    icon: <Tv className="w-4 h-4 text-emerald-400" />
  },
  {
    keys: ['S', '/'],
    description: 'Open Live Search Overlay',
    category: 'Navigation',
    icon: <Search className="w-4 h-4 text-amber-400" />
  },
  {
    keys: ['P'],
    description: 'Play Hero Featured Stream',
    category: 'Playback & Actions',
    icon: <Play className="w-4 h-4 text-[#2AC9B0]" />
  },
  {
    keys: ['A'],
    description: 'Open Cinematic Avatar Studio',
    category: 'Modals & Overlays',
    icon: <User className="w-4 h-4 text-[#FFB238]" />
  },
  {
    keys: ['?'],
    description: 'Toggle Keyboard Shortcuts Guide',
    category: 'Modals & Overlays',
    icon: <Keyboard className="w-4 h-4 text-sky-400" />
  },
  {
    keys: ['Esc'],
    description: 'Close active modal or player',
    category: 'Modals & Overlays',
    icon: <X className="w-4 h-4 text-rose-400" />
  }
];

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = ['Navigation', 'Playback & Actions', 'Modals & Overlays'] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto font-sans">
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#2AC9B0]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#FFB238]/10 rounded-full blur-[140px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl my-8 glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5 z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-[#2AC9B0]/15 border border-[#2AC9B0]/30 text-[#2AC9B0]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Keyboard Navigation Shortcuts</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238] text-[10px] font-mono-meta">
                  Power Users
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Navigate Watch PY instantly using simple key combinations anywhere on the app.
              </p>
            </div>
          </div>

          {/* Shortcut Cards Grouped by Category */}
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {categories.map((cat) => {
              const catShortcuts = SHORTCUT_RULES.filter((s) => s.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-[11px] font-mono-meta font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{cat}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {catShortcuts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                            {item.icon}
                          </div>
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {item.description}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k) => (
                            <kbd
                              key={k}
                              className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 text-[#2AC9B0] text-xs font-mono-meta font-bold shadow-inner min-w-[28px] text-center"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-slate-400 font-mono-meta">
            <span className="flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-[#FFB238]" />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">?</kbd> anytime to toggle this panel</span>
            </span>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

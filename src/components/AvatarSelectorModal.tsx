import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Sparkles,
  RefreshCw,
  Camera,
  ShieldCheck,
  User,
  Film,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  Award
} from 'lucide-react';
import { ApertureLogo } from './ApertureLogo';
import { updateUserAvatarInFirestore } from '../lib/firebaseService';

export interface CinematicAvatar {
  id: string;
  name: string;
  category: 'Cyberpunk' | 'Space & Sci-Fi' | 'Neo-Noir' | 'Fantasy & Epic' | 'Cinema & Directors' | 'Anime & Heroes';
  url: string;
  badge?: string;
}

export const CINEMATIC_AVATARS: CinematicAvatar[] = [
  // Cyberpunk Category
  {
    id: 'avatar-cyber-1',
    name: 'Jax Neural Hacker',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    badge: 'Cyberpulse Hero'
  },
  {
    id: 'avatar-cyber-2',
    name: 'Neo Visor Sentinel',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    badge: 'Neo-Tokyo'
  },
  {
    id: 'avatar-cyber-3',
    name: 'Synthetic Operative',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    badge: 'Augmented'
  },
  {
    id: 'avatar-cyber-4',
    name: 'Glitch Hacker Girl',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    badge: 'Neon Glow'
  },

  // Space & Sci-Fi
  {
    id: 'avatar-space-1',
    name: 'Commander Maya',
    category: 'Space & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    badge: 'Stellar Horizon'
  },
  {
    id: 'avatar-space-2',
    name: 'Cosmology Explorer',
    category: 'Space & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80',
    badge: 'Deep Orbit'
  },
  {
    id: 'avatar-space-3',
    name: 'Orbital Pilot',
    category: 'Space & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badge: 'Zero-G'
  },
  {
    id: 'avatar-space-4',
    name: 'Galaxy Sentinel',
    category: 'Space & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    badge: 'Interstellar'
  },

  // Neo-Noir
  {
    id: 'avatar-noir-1',
    name: 'Detective Valencia',
    category: 'Neo-Noir',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    badge: 'Shadows Noir'
  },
  {
    id: 'avatar-noir-2',
    name: 'Midnight Syndicate',
    category: 'Neo-Noir',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    badge: 'High Stakes'
  },
  {
    id: 'avatar-noir-3',
    name: 'Neon Velvet Agent',
    category: 'Neo-Noir',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    badge: 'Undercover'
  },

  // Fantasy & Epic
  {
    id: 'avatar-fantasy-1',
    name: 'Quantum Alchemist',
    category: 'Fantasy & Epic',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    badge: 'Mystic Sci-Fi'
  },
  {
    id: 'avatar-fantasy-2',
    name: 'Golden Dragon Master',
    category: 'Fantasy & Epic',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',
    badge: 'Legendary'
  },

  // Cinema & Directors
  {
    id: 'avatar-cinema-1',
    name: 'Aperture Director',
    category: 'Cinema & Directors',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    badge: '4K Auteur'
  },
  {
    id: 'avatar-cinema-2',
    name: 'Apex Producer',
    category: 'Cinema & Directors',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    badge: 'Studio Chief'
  },

  // Anime & Heroes
  {
    id: 'avatar-anime-1',
    name: 'Chronos Ronin',
    category: 'Anime & Heroes',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    badge: 'Watch Kids'
  },
  {
    id: 'avatar-anime-2',
    name: 'Cyber Guardian',
    category: 'Anime & Heroes',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    badge: 'Anime Star'
  }
];

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  currentName: string;
  userUid?: string | null;
  onAvatarSaved: (newAvatarUrl: string, newDisplayName: string) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  currentName,
  userUid,
  onAvatarSaved
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);
  const [displayName, setDisplayName] = useState<string>(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreviewAvatar(currentAvatar);
      setDisplayName(currentName);
      setIsSavedSuccess(false);
      setShowCustomInput(false);
    }
  }, [isOpen, currentAvatar, currentName]);

  if (!isOpen) return null;

  const categories = ['All', 'Cyberpunk', 'Space & Sci-Fi', 'Neo-Noir', 'Fantasy & Epic', 'Cinema & Directors', 'Anime & Heroes'];

  const filteredAvatars = selectedCategory === 'All'
    ? CINEMATIC_AVATARS
    : CINEMATIC_AVATARS.filter((a) => a.category === selectedCategory);

  const handleSaveProfile = async () => {
    const finalAvatar = customAvatarInput.trim() || previewAvatar;
    const finalName = displayName.trim() || 'Watch PY Streamer';

    setIsSaving(true);
    try {
      if (userUid) {
        await updateUserAvatarInFirestore(userUid, finalAvatar, finalName);
      }
      setIsSavedSuccess(true);
      onAvatarSaved(finalAvatar, finalName);

      setTimeout(() => {
        setIsSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Avatar save error:', err);
      // Fallback local save
      onAvatarSaved(finalAvatar, finalName);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto font-sans">
        {/* Glow ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FFB238]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#2AC9B0]/10 rounded-full blur-[140px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl my-8 glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5 z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Cinematic Avatar Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-[#2AC9B0]/15 border border-[#2AC9B0]/30 text-[#2AC9B0] text-[10px] font-mono-meta">
                  Firestore Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose a high-definition cinematic avatar to personalize your Watch PY profile across devices.
              </p>
            </div>
          </div>

          {/* Active Profile Preview Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={customAvatarInput.trim() || previewAvatar}
                  alt="Profile Preview"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-[#FFB238] shadow-[0_0_20px_rgba(255,178,56,0.3)]"
                />
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#2AC9B0] text-black shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-meta text-slate-400 uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FFB238] text-sm font-bold text-white outline-none transition-colors w-48 sm:w-64"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs font-mono-meta text-[#FFB238] hover:underline flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showCustomInput ? 'Preset Gallery' : 'Use Image URL'}</span>
            </button>
          </div>

          {/* Custom Avatar URL Field */}
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
            >
              <label className="block text-[11px] font-mono-meta text-slate-300">
                Custom Avatar Image URL (Unsplash or Direct Image Link)
              </label>
              <input
                type="url"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#FFB238] text-xs text-white outline-none"
              />
            </motion.div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FFB238] text-black font-bold shadow-md shadow-[#FFB238]/20'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cinematic Avatar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredAvatars.map((item) => {
              const isSelected = previewAvatar === item.url && !customAvatarInput;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPreviewAvatar(item.url);
                    setCustomAvatarInput('');
                  }}
                  className={`group relative p-2 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-[#FFB238]/15 border-[#FFB238] shadow-[0_0_20px_rgba(255,178,56,0.25)]'
                      : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-900">
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#FFB238]/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#FFB238] text-black flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <span className="text-[10px] font-mono-meta text-slate-400 block truncate">
                    {item.badge || item.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs font-mono-meta text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Saves directly to Firestore</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#FFB238] hover:bg-[#ffa312] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FFB238]/20 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : isSavedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Save Avatar & Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

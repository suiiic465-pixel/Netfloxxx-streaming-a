import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Film, Tv, Sparkles, Filter, Play, Plus, Check } from 'lucide-react';
import { MediaItem } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allMedia: MediaItem[];
  onPlayMedia: (mediaId: string) => void;
  onOpenInfoModal: (mediaId: string) => void;
  myListIds: string[];
  onToggleMyList: (mediaId: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  allMedia,
  onPlayMedia,
  onOpenInfoModal,
  myListIds,
  onToggleMyList,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K or Cmd+K or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Movies', 'Series', 'Sci-Fi', 'Action', 'Thriller', 'Anime', 'Documentary'];

  const filteredMedia = allMedia.filter((media) => {
    const matchesQuery =
      query.trim() === '' ||
      media.title.toLowerCase().includes(query.toLowerCase()) ||
      media.description.toLowerCase().includes(query.toLowerCase()) ||
      media.genres.some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
      media.cast.some((c) => c.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Movies' && media.type === 'movie') ||
      (selectedCategory === 'Series' && media.type === 'series') ||
      media.genres.includes(selectedCategory);

    return matchesQuery && matchesCategory;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        <div className="min-h-full w-full flex flex-col items-center pt-8 sm:pt-16 pb-12">
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-white/10 space-y-6"
        >
          {/* Top Search Input Row */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-6 h-6 text-[#FFB238]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, actors, genres..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-13 pr-12 py-4 text-white placeholder-slate-400 text-base sm:text-lg focus:outline-none focus:border-[#FFB238] focus:ring-2 focus:ring-[#FFB238]/30 transition-all font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-12 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="absolute right-3 p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-mono-meta text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#FFB238]" />
              Filter:
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono-meta transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-[#FFB238] text-[#0A0B0F] font-bold shadow-[0_0_12px_rgba(255,178,56,0.4)]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Results Summary */}
          <div className="flex items-center justify-between text-xs font-mono-meta text-slate-400 border-b border-white/10 pb-3">
            <span>
              Found <strong className="text-white">{filteredMedia.length}</strong> title{filteredMedia.length !== 1 ? 's' : ''}
            </span>
            <span className="hidden sm:inline-block">Press ESC or Cmd+K to close</span>
          </div>

          {/* Results Grid */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {filteredMedia.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-slate-400 text-sm">No titles matched "{query}".</p>
                <p className="text-xs text-slate-500">Try searching for "Cyberpulse", "Sci-Fi", or "Space".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedia.map((item) => {
                  const isSaved = myListIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onOpenInfoModal(item.id);
                        onClose();
                      }}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-all flex gap-3.5 items-center hover:border-[#FFB238]/40 shadow-md"
                    >
                      <img
                        src={item.posterUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-16 h-22 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#FFB238] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-mono-meta text-slate-400 flex items-center gap-2">
                          <span className="text-[#2AC9B0]">{item.rating}</span>
                          <span>{item.year}</span>
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-1">{item.genres.join(', ')}</p>

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayMedia(item.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FFB238] text-[#0A0B0F] text-[10px] font-bold flex items-center gap-1 hover:bg-[#FFC870]"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Play
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMyList(item.id);
                            }}
                            className={`p-1 rounded-lg border text-[10px] ${
                              isSaved ? 'bg-[#2AC9B0]/20 text-[#2AC9B0] border-[#2AC9B0]/40' : 'bg-white/10 text-white border-white/20'
                            }`}
                          >
                            {isSaved ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  </AnimatePresence>
  );
};

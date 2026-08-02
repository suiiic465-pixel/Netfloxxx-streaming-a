import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Check, Info, ThumbsUp, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onPlayMedia: (mediaId: string) => void;
  onOpenInfoModal: (mediaId: string) => void;
  isSavedInList: boolean;
  onToggleMyList: (mediaId: string) => void;
  showProgress?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlayMedia,
  onOpenInfoModal,
  isSavedInList,
  onToggleMyList,
  showProgress = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-44 sm:w-56 lg:w-64 group cursor-pointer select-none py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Card Wrapper with smooth scale, depth lift, and subtle glow shadow transition */}
      <motion.div
        initial={false}
        animate={{
          scale: isHovered ? 1.06 : 1,
          y: isHovered ? -8 : 0,
          boxShadow: isHovered
            ? '0 20px 35px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 178, 56, 0.28), 0 0 2px rgba(255, 178, 56, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.35), 0 0 0px rgba(0, 0, 0, 0)',
          borderColor: isHovered ? 'rgba(255, 178, 56, 0.45)' : 'rgba(255, 255, 255, 0.1)',
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 24,
          mass: 0.8,
        }}
        className="relative bg-[#12141C] rounded-2xl overflow-hidden border transition-colors"
      >
        {/* Poster Image Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
          <motion.img
            src={item.backdropUrl || item.posterUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover"
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
            {item.isTop10 && item.top10Rank ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-meta font-extrabold bg-[#FFB238] text-[#0A0B0F] shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                #{item.top10Rank}
              </span>
            ) : item.isNewRelease ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-meta font-bold bg-[#2AC9B0] text-[#0A0B0F] shadow-md">
                NEW
              </span>
            ) : (
              <span />
            )}

            <span className="px-1.5 py-0.5 text-[9px] font-mono-meta font-bold bg-black/60 backdrop-blur-md border border-white/20 rounded text-slate-200">
              {item.resolution}
            </span>
          </div>

          {/* Gradient Overlay for card titles */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-transparent opacity-80" />

          {/* Mini Play Icon centered on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => onPlayMedia(item.id)}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-12 h-12 rounded-full bg-[#FFB238] text-[#0A0B0F] flex items-center justify-center shadow-[0_0_25px_rgba(255,178,56,0.7)]"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Watching Progress Bar */}
          {showProgress && item.progressPercentage !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-10">
              <div
                className="h-full bg-gradient-to-r from-[#FFB238] to-[#2AC9B0]"
                style={{ width: `${item.progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Card Details Body */}
        <div className="p-3.5 space-y-2">
          {/* Title & Type */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-white truncate group-hover:text-[#FFB238] transition-colors">
              {item.title}
            </h3>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[11px] font-mono-meta text-slate-400">
            <span className="text-[#2AC9B0] font-semibold">{item.rating}</span>
            <span>{item.year}</span>
            <span className="border border-white/10 px-1 rounded text-[9px] font-bold">
              {item.ageRating}
            </span>
          </div>

          {/* Remaining time if Continue Watching */}
          {showProgress && item.continueRemaining && (
            <p className="text-[10px] font-mono-meta text-[#FFB238]">
              {item.continueRemaining}
            </p>
          )}

          {/* Hover Action Bar */}
          <div className="pt-1 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayMedia(item.id);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-[#FFB238] hover:text-[#0A0B0F] text-white transition-colors"
                title="Play Now"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMyList(item.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSavedInList
                    ? 'bg-[#2AC9B0]/20 text-[#2AC9B0] border border-[#2AC9B0]/40'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isSavedInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isSavedInList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-[#FFB238]/20 text-[#FFB238]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title={isLiked ? 'Liked' : 'Like'}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenInfoModal(item.id);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

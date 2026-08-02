import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { MediaItem } from '../types';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onPlayMedia: (mediaId: string) => void;
  onOpenInfoModal: (mediaId: string) => void;
  myListIds: string[];
  onToggleMyList: (mediaId: string) => void;
  showProgress?: boolean;
  downloadedIds?: string[];
  downloadingProgressMap?: Record<string, number>;
  onToggleDownload?: (mediaId: string) => void;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  items,
  onPlayMedia,
  onOpenInfoModal,
  myListIds,
  onToggleMyList,
  showProgress = false,
  downloadedIds = [],
  downloadingProgressMap = {},
  onToggleDownload,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-6 relative group"
    >
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>{title}</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono-meta font-bold bg-white/10 text-[#FFB238] rounded-full border border-white/10">
              {items.length}
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-[#FFB238] hover:text-[#0A0B0F] border border-white/10 text-white transition-colors focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-[#FFB238] hover:text-[#0A0B0F] border border-white/10 text-white transition-colors focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Row Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onPlayMedia={onPlayMedia}
            onOpenInfoModal={onOpenInfoModal}
            isSavedInList={myListIds.includes(item.id)}
            onToggleMyList={onToggleMyList}
            showProgress={showProgress}
            isDownloaded={downloadedIds.includes(item.id)}
            downloadProgress={downloadingProgressMap[item.id]}
            onToggleDownload={onToggleDownload}
          />
        ))}
      </div>
    </motion.section>
  );
};

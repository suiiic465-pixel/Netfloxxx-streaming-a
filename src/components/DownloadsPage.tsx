import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownToLine, HardDrive, Trash2, Play, Film, Tv, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface DownloadsPageProps {
  downloadedIds: string[];
  allMedia: MediaItem[];
  onPlayMedia: (mediaId: string) => void;
  onOpenInfoModal: (mediaId: string) => void;
  myListIds: string[];
  onToggleMyList: (mediaId: string) => void;
  onRemoveDownload: (mediaId: string) => void;
  onClearAllDownloads: () => void;
  onBrowseCatalog: () => void;
  downloadingProgressMap?: Record<string, number>;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  downloadedIds,
  allMedia,
  onPlayMedia,
  onOpenInfoModal,
  myListIds,
  onToggleMyList,
  onRemoveDownload,
  onClearAllDownloads,
  onBrowseCatalog,
  downloadingProgressMap = {},
}) => {
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter downloaded media items
  const downloadedItems = allMedia.filter((m) => downloadedIds.includes(m.id));

  // Cosmetic Storage Calculations
  // Estimate ~2.2 GB for movies, ~4.5 GB for series
  const calculateMediaSize = (item: MediaItem): number => {
    return item.type === 'movie' ? 2.3 : 4.6;
  };

  const totalUsedGB = downloadedItems.reduce((acc, item) => acc + calculateMediaSize(item), 0);
  const totalStorageCapacityGB = 25.0; // Simulated storage allocation
  const storagePercentage = Math.min(100, Math.round((totalUsedGB / totalStorageCapacityGB) * 100));

  const filteredItems = downloadedItems.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-[80vh]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono-meta text-[#FFB238] uppercase tracking-widest font-bold mb-2">
            <ArrowDownToLine className="w-4 h-4" />
            <span>Offline Playback Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight flex items-center gap-3">
            Your Downloads
            <span className="text-sm font-mono-meta font-bold px-3 py-1 rounded-full bg-[#FFB238]/20 text-[#FFB238] border border-[#FFB238]/30">
              {downloadedItems.length} {downloadedItems.length === 1 ? 'Title' : 'Titles'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Watch your downloaded titles anywhere without internet connectivity. Fast, high-bitrate offline streaming.
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <div className="flex items-center gap-3">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear All Downloads</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-1.5 rounded-xl">
                <span className="text-xs text-rose-300 font-medium px-2">Remove all {downloadedItems.length} downloads?</span>
                <button
                  onClick={() => {
                    onClearAllDownloads();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cosmetic Storage Indicator Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#12141F] via-[#161926] to-[#12141F] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Offline Storage Allocation
                <span className="text-[10px] font-mono-meta px-2 py-0.5 rounded bg-white/10 text-slate-300 font-normal">
                  High Performance Cache
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono-meta mt-0.5">
                {downloadedItems.length === 0
                  ? 'No local storage currently used'
                  : `${totalUsedGB.toFixed(1)} GB used of ${totalStorageCapacityGB.toFixed(1)} GB (${(totalStorageCapacityGB - totalUsedGB).toFixed(1)} GB available)`}
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-lg font-extrabold font-mono-meta text-[#FFB238]">
              {storagePercentage}%
            </span>
            <span className="text-xs text-slate-400 block font-mono-meta">
              Used Capacity
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${storagePercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#FFB238] via-[#FF8A00] to-[#2AC9B0] rounded-full shadow-[0_0_12px_#FFB238]"
          />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      {downloadedItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#12141F] p-1.5 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-[#FFB238] text-[#0A0B0F] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              All ({downloadedItems.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'movie'
                  ? 'bg-[#FFB238] text-[#0A0B0F] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies ({downloadedItems.filter((m) => m.type === 'movie').length})
            </button>
            <button
              onClick={() => setFilterType('series')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'series'
                  ? 'bg-[#FFB238] text-[#0A0B0F] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Series ({downloadedItems.filter((m) => m.type === 'series').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12141F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB238]/60 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Grid of Downloaded Titles */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const sizeGB = calculateMediaSize(item);
            return (
              <div key={item.id} className="relative group">
                <MediaCard
                  item={item}
                  onPlayMedia={onPlayMedia}
                  onOpenInfoModal={onOpenInfoModal}
                  isSavedInList={myListIds.includes(item.id)}
                  onToggleMyList={onToggleMyList}
                  isDownloaded={true}
                  downloadProgress={downloadingProgressMap[item.id]}
                  onToggleDownload={onRemoveDownload}
                />

                {/* Additional Download Card Control Footer */}
                <div className="mt-1 flex items-center justify-between p-2 rounded-xl bg-[#12141F] border border-white/10 text-xs font-mono-meta">
                  <div className="flex items-center gap-1 text-[#2AC9B0]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-semibold text-[11px]">{sizeGB} GB</span>
                  </div>

                  <button
                    onClick={() => onRemoveDownload(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-[10px] font-sans"
                    title="Remove Download"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : downloadedItems.length > 0 ? (
        /* Filter Empty Result */
        <div className="text-center py-16 bg-[#12141F]/60 rounded-3xl border border-white/10 space-y-3">
          <p className="text-slate-400 text-sm">No downloads match your current search or filter.</p>
          <button
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#FFB238] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Main Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-6 bg-[#12141F]/80 rounded-3xl border border-white/10 space-y-6 max-w-xl mx-auto my-12"
        >
          <div className="w-20 h-20 rounded-full bg-[#FFB238]/10 border border-[#FFB238]/30 flex items-center justify-center mx-auto text-[#FFB238] shadow-[0_0_30px_rgba(255,178,56,0.15)]">
            <ArrowDownToLine className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-display">No Downloaded Titles Yet</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Never be without your favorite entertainment. Download movies and series to your account and watch them offline on any device.
            </p>
          </div>

          <button
            onClick={onBrowseCatalog}
            className="px-6 py-3.5 rounded-2xl bg-[#FFB238] text-[#0A0B0F] font-bold text-sm shadow-xl hover:bg-[#FFC870] transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Browse Catalog to Download</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Check, Volume2, VolumeX, Pause, Info, Sparkles, Film, ArrowDownToLine, CheckCircle2, Loader2 } from 'lucide-react';
import { HeroSlide, MediaItem } from '../types';

interface HeroCarouselProps {
  slides: HeroSlide[];
  onPlayMedia: (mediaId: string) => void;
  onOpenInfoModal: (mediaId: string) => void;
  myListIds: string[];
  onToggleMyList: (mediaId: string) => void;
  allMedia: MediaItem[];
  downloadedIds?: string[];
  downloadingProgressMap?: Record<string, number>;
  onToggleDownload?: (mediaId: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  onPlayMedia,
  onOpenInfoModal,
  myListIds,
  onToggleMyList,
  allMedia,
  downloadedIds = [],
  downloadingProgressMap = {},
  onToggleDownload,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Inactivity & Trailer Preview State
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slides[currentIndex];
  const isSavedInList = myListIds.includes(currentSlide.mediaId);

  // Fallback trailer video url if slide doesn't define one
  const trailerUrl =
    currentSlide.trailerVideoUrl ||
    allMedia.find((m) => m.id === currentSlide.mediaId)?.trailerVideoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  // Reset inactivity countdown (3 seconds)
  const resetInactivityTimer = () => {
    setShowTrailerPreview(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setShowTrailerPreview(true);
    }, 3000);
  };

  // Trigger timer whenever slide index changes
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [currentIndex]);

  // Handle user mouse movement over carousel
  const handleUserActivity = () => {
    // If trailer hasn't started playing yet, delay/reset timer
    if (!showTrailerPreview) {
      resetInactivityTimer();
    }
  };

  // Auto slide interval (6s for backdrop image, extended to 12s when trailer is active)
  useEffect(() => {
    if (!isPlaying) return;
    const duration = showTrailerPreview ? 12000 : 6000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length, showTrailerPreview]);

  return (
    <section
      onMouseMove={handleUserActivity}
      className="relative w-full min-h-[90vh] md:min-h-screen flex items-end justify-start overflow-hidden pt-24 pb-16 lg:pb-24"
    >
      {/* Background Image & Video Crossfade Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Backdrop Image */}
            <img
              src={currentSlide.backdropUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center filter brightness-[0.85] transition-opacity duration-1000 ${
                showTrailerPreview ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Auto Muted Trailer Preview Video */}
            {showTrailerPreview && trailerUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <video
                  src={trailerUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="w-full h-full object-cover object-center filter brightness-[0.80]"
                />
              </motion.div>
            )}

            {/* Vignette Gradients for cinematic readability */}
            <div className="absolute inset-0 hero-vignette pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Content Overlay Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id + '-content'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Badge, Subtitle & Trailer Indicator */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono-meta font-bold bg-gradient-to-r from-[#FFB238] to-[#FFC870] text-[#0A0B0F] shadow-[0_0_15px_rgba(255,178,56,0.4)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentSlide.subtitle}
                </span>

                {showTrailerPreview ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2.5 py-0.5 rounded-full bg-[#2AC9B0]/20 border border-[#2AC9B0]/50 text-[#2AC9B0] text-xs font-mono-meta font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(42,201,176,0.3)]"
                  >
                    <Film className="w-3.5 h-3.5 text-[#2AC9B0]" />
                    <span>Trailer Previewing</span>
                  </motion.span>
                ) : (
                  <span className="text-xs font-mono-meta text-[#2AC9B0] bg-[#2AC9B0]/10 border border-[#2AC9B0]/30 px-2.5 py-0.5 rounded-full">
                    {currentSlide.audioFormat}
                  </span>
                )}
              </div>

              {/* Title in Condensed Display Typography */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.9] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                {currentSlide.title}
              </h1>

              {/* Monospace Metadata Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono-meta text-slate-300">
                <span className="text-[#FFB238] font-semibold">{currentSlide.rating}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>{currentSlide.year}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>{currentSlide.duration}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-bold text-white">
                  {currentSlide.ageRating}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-500 hidden sm:inline-block" />
                <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                  {currentSlide.genres.map((genre, idx) => (
                    <span key={genre} className="hover:text-white transition-colors">
                      {genre}
                      {idx < currentSlide.genres.length - 1 ? ' •' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tagline & Short Description */}
              <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {currentSlide.description}
              </p>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPlayMedia(currentSlide.mediaId)}
                  className="px-6 py-3.5 rounded-2xl bg-[#FFB238] text-[#0A0B0F] font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_24px_rgba(255,178,56,0.5)] hover:bg-[#FFC870] transition-colors focus:outline-none"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Full Stream</span>
                </motion.button>

                {/* + My List Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleMyList(currentSlide.mediaId)}
                  className={`px-5 py-3.5 rounded-2xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all ${
                    isSavedInList
                      ? 'bg-[#2AC9B0]/20 text-[#2AC9B0] border border-[#2AC9B0]/50 shadow-[0_0_16px_rgba(42,201,176,0.2)]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md'
                  }`}
                >
                  {isSavedInList ? (
                    <>
                      <Check className="w-5 h-5 text-[#2AC9B0]" />
                      <span>In My List</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>+ My List</span>
                    </>
                  )}
                </motion.button>

                {/* Download for Offline Button */}
                {onToggleDownload && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleDownload(currentSlide.mediaId)}
                    className={`px-5 py-3.5 rounded-2xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all relative overflow-hidden ${
                      downloadingProgressMap[currentSlide.mediaId] !== undefined
                        ? 'bg-[#FFB238]/30 text-[#FFB238] border border-[#FFB238]/60 shadow-[0_0_20px_rgba(255,178,56,0.3)]'
                        : downloadedIds.includes(currentSlide.mediaId)
                        ? 'bg-[#FFB238]/20 text-[#FFB238] border border-[#FFB238]/40 shadow-[0_0_16px_rgba(255,178,56,0.2)]'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md'
                    }`}
                  >
                    {downloadingProgressMap[currentSlide.mediaId] !== undefined ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#FFB238]" />
                        <span className="font-mono-meta font-bold">
                          Downloading {downloadingProgressMap[currentSlide.mediaId]}%
                        </span>
                      </>
                    ) : downloadedIds.includes(currentSlide.mediaId) ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#FFB238]" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="w-5 h-5" />
                        <span>Download</span>
                      </>
                    )}
                  </motion.button>
                )}

                {/* Info Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenInfoModal(currentSlide.mediaId)}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-colors"
                  title="More Details"
                >
                  <Info className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Bottom Controls: Progress Dots & Auto-Play Toggle */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Progress Indicators */}
          <div className="flex items-center gap-3">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowTrailerPreview(false);
                  }}
                  className={`group relative py-2 focus:outline-none`}
                  title={`Go to slide ${idx + 1}: ${slide.title}`}
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                      isActive
                        ? 'w-12 bg-gradient-to-r from-[#FFB238] to-[#2AC9B0] shadow-[0_0_10px_#FFB238]'
                        : 'w-4 bg-white/20 group-hover:bg-white/40'
                    }`}
                  >
                    {isActive && isPlaying && (
                      <motion.div
                        className="h-full bg-white/40"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: showTrailerPreview ? 12 : 6, ease: 'linear' }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls: Pause/Play & Mute */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-black/60 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              title={isMuted ? 'Unmute Trailer Audio' : 'Mute Trailer Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-mono-meta hidden sm:inline text-slate-400">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#2AC9B0]" />
                  <span className="text-[10px] font-mono-meta hidden sm:inline text-[#2AC9B0] font-bold">Unmuted</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


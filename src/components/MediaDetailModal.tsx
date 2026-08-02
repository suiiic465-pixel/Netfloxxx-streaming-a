import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, Check, Volume2, VolumeX, RotateCcw, Maximize, Sparkles, Film, Tv, Clock, Star, ThumbsUp, ArrowDownToLine, CheckCircle2, Loader2 } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaDetailModalProps {
  mediaItem: MediaItem | null;
  onClose: () => void;
  onPlayMedia: (mediaId: string) => void;
  myListIds: string[];
  onToggleMyList: (mediaId: string) => void;
  allMedia: MediaItem[];
  downloadedIds?: string[];
  downloadingProgress?: number;
  onToggleDownload?: (mediaId: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  mediaItem,
  onClose,
  onPlayMedia,
  myListIds,
  onToggleMyList,
  allMedia,
  downloadedIds = [],
  downloadingProgress,
  onToggleDownload,
}) => {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Video autoplay constrained:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [mediaItem]);

  if (!mediaItem) return null;

  const isSavedInList = myListIds.includes(mediaItem.id);
  const recommendedMedia = allMedia
    .filter((m) => m.id !== mediaItem.id && m.genres.some((g) => mediaItem.genres.includes(g)))
    .slice(0, 4);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Unmute play error:', err);
        });
      }
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Restart video error:', err);
            setIsPlaying(false);
          });
      }
    } catch (e) {
      console.warn('Restart exception:', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar p-2 sm:p-4 lg:p-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <div className="min-h-full w-full flex flex-col items-center py-6 sm:py-10">
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-4xl bg-[#10121A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto"
          >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#FFB238] hover:text-[#0A0B0F] transition-colors border border-white/10 shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Player Header / Banner */}
          <div className="relative aspect-video w-full bg-black overflow-hidden group">
            <video
              ref={videoRef}
              src={mediaItem.trailerVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'}
              poster={mediaItem.backdropUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#10121A] via-transparent to-black/30 pointer-events-none" />

            {/* Video Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVideoPlay}
                  className="p-3 rounded-xl bg-[#FFB238] text-[#0A0B0F] font-bold shadow-lg hover:bg-[#FFC870] transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => onToggleMyList(mediaItem.id)}
                  className={`p-3 rounded-xl border backdrop-blur-md transition-colors flex items-center gap-2 ${
                    isSavedInList
                      ? 'bg-[#2AC9B0]/20 text-[#2AC9B0] border-[#2AC9B0]/40'
                      : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {isSavedInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span className="text-xs hidden sm:inline">{isSavedInList ? 'In My List' : 'My List'}</span>
                </button>

                {/* Download for Offline Button */}
                {onToggleDownload && (
                  <button
                    onClick={() => onToggleDownload(mediaItem.id)}
                    className={`p-3 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 relative overflow-hidden ${
                      downloadingProgress !== undefined
                        ? 'bg-[#FFB238]/30 text-[#FFB238] border-[#FFB238]/60 shadow-[0_0_15px_rgba(255,178,56,0.3)]'
                        : downloadedIds.includes(mediaItem.id)
                        ? 'bg-[#FFB238]/20 text-[#FFB238] border-[#FFB238]/40 font-semibold'
                        : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {downloadingProgress !== undefined ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FFB238]" />
                        <span className="text-xs font-mono-meta font-bold">
                          Downloading {downloadingProgress}%
                        </span>
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-[#FFB238] transition-all duration-200"
                          style={{ width: `${downloadingProgress}%` }}
                        />
                      </>
                    ) : downloadedIds.includes(mediaItem.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#FFB238]" />
                        <span className="text-xs font-semibold">Downloaded</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="w-4 h-4 text-slate-300" />
                        <span className="text-xs hidden sm:inline">Download</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-xl border backdrop-blur-md transition-colors ${
                    isLiked ? 'bg-[#FFB238]/20 text-[#FFB238] border-[#FFB238]/40' : 'bg-black/60 border-white/20 text-white'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={restartVideo}
                  className="p-2.5 rounded-xl bg-black/60 text-white border border-white/20 hover:bg-white/20 transition-colors"
                  title="Restart Trailer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl bg-black/60 text-white border border-white/20 hover:bg-white/20 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body Info Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono-meta text-[#FFB238]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider font-bold">Watch py Exclusive</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-wide">
                {mediaItem.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono-meta text-slate-300">
                <span className="text-[#2AC9B0] font-bold">{mediaItem.rating}</span>
                <span>{mediaItem.year}</span>
                <span>{mediaItem.duration}</span>
                <span className="px-2 py-0.5 border border-white/20 rounded font-bold text-white">
                  {mediaItem.ageRating}
                </span>
                <span className="px-2 py-0.5 bg-[#FFB238]/15 text-[#FFB238] border border-[#FFB238]/30 rounded font-bold">
                  {mediaItem.resolution}
                </span>
              </div>
            </div>

            {/* Description & Cast Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/10">
              <div className="md:col-span-2 space-y-3">
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  {mediaItem.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {mediaItem.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono-meta text-slate-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Director & Cast Column */}
              <div className="space-y-3 text-xs text-slate-300 font-sans border-l border-white/10 pl-0 md:pl-6">
                {mediaItem.director && (
                  <div>
                    <span className="text-slate-500 font-mono-meta block mb-0.5">Director</span>
                    <span className="text-white font-medium">{mediaItem.director}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-mono-meta block mb-0.5">Cast</span>
                  <span className="text-slate-200 leading-relaxed">{mediaItem.cast.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Episode Picker for Series */}
            {mediaItem.type === 'series' && mediaItem.seasons && mediaItem.seasons.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[#FFB238]" />
                    <span>Episodes</span>
                  </h3>

                  {/* Season selector tabs */}
                  <div className="flex items-center gap-2">
                    {mediaItem.seasons.map((season, idx) => (
                      <button
                        key={season.seasonNumber}
                        onClick={() => setSelectedSeasonIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono-meta transition-colors ${
                          selectedSeasonIndex === idx
                            ? 'bg-[#FFB238] text-[#0A0B0F] font-bold'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {season.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode List */}
                <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
                  {mediaItem.seasons[selectedSeasonIndex]?.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlayMedia(mediaItem.id)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 group border border-white/5"
                    >
                      <div className="relative w-full sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        <img
                          src={ep.thumbnail}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-[#FFB238] fill-current" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white group-hover:text-[#FFB238] transition-colors">
                            {ep.number}. {ep.title}
                          </h4>
                          <span className="text-xs font-mono-meta text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {ep.duration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {ep.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Titles Grid */}
            {recommendedMedia.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#2AC9B0]" />
                  <span>More Like This</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendedMedia.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        onPlayMedia(rec.id);
                      }}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 transition-all hover:-translate-y-1"
                    >
                      <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                        <img
                          src={rec.backdropUrl}
                          alt={rec.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-[#FFB238] fill-current" />
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-[#FFB238] transition-colors">
                          {rec.title}
                        </p>
                        <p className="text-[10px] font-mono-meta text-[#2AC9B0]">{rec.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  </AnimatePresence>
  );
};

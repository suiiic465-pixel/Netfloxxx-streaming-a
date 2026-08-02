import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  X,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { MediaItem } from '../types';

interface VideoPlayerModalProps {
  mediaItem: MediaItem;
  onClose: () => void;
  onUpdateProgress?: (mediaId: string, progressPercentage: number, remainingText: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  mediaItem,
  onClose,
  onUpdateProgress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [qualityToast, setQualityToast] = useState<string | null>(null);

  // Controls UI visibility
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Settings Menu Open
  const [showSettings, setShowSettings] = useState(false);

  // Quality Handler
  const handleQualitySelect = (qKey: string, desc: string) => {
    setQuality(qKey);
    setQualityToast(`Streaming quality set to ${desc}`);
    setTimeout(() => setQualityToast(null), 2600);
  };
  const [activeSettingsTab, setActiveSettingsTab] = useState<'main' | 'speed' | 'quality'>('main');

  // Animated burst overlays for Youtube-style double-click rewind/forward
  const [burstAnim, setBurstAnim] = useState<{ type: 'rewind' | 'forward'; id: number } | null>(null);

  // Hover time preview on progress bar
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosRatio, setHoverPosRatio] = useState<number>(0);

  const videoSourceUrl =
    mediaItem.trailerVideoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  // Load saved progress position from localStorage
  useEffect(() => {
    try {
      const savedTime = localStorage.getItem(`watchpy_progress_${mediaItem.id}`);
      if (savedTime && videoRef.current) {
        const timeVal = parseFloat(savedTime);
        if (!isNaN(timeVal) && timeVal > 0) {
          videoRef.current.currentTime = timeVal;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [mediaItem.id]);

  // Handle auto-hiding controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3200);
  };

  useEffect(() => {
    handleMouseMove();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying]);

  // Sync video time & progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);

    if (videoRef.current.buffered.length > 0) {
      try {
        setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      } catch (e) {
        // ignore buffer range errors
      }
    }

    // Save progress to localStorage & notify parent
    const progressPct = Math.round((cur / dur) * 100);
    const remSeconds = Math.max(0, Math.floor(dur - cur));
    const minsLeft = Math.ceil(remSeconds / 60);
    const remainingText = `${minsLeft}m left`;

    try {
      localStorage.setItem(`watchpy_progress_${mediaItem.id}`, cur.toString());
    } catch (e) {}

    if (onUpdateProgress) {
      onUpdateProgress(mediaItem.id, progressPct, remainingText);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Play error:', err));
      }
    }
  };

  // Seek Function
  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    videoRef.current.currentTime = target;
    setCurrentTime(target);

    // Trigger visual burst
    setBurstAnim({
      type: seconds < 0 ? 'rewind' : 'forward',
      id: Date.now()
    });
    setTimeout(() => setBurstAnim(null), 600);
  };

  // Volume & Mute
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Speed Change
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Double Click / Tap third logic
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.3) {
      seekRelative(-10);
    } else if (clickX > width * 0.7) {
      seekRelative(10);
    } else {
      togglePlay();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (!document.fullscreenElement) onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, isMuted]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        onMouseMove={handleMouseMove}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
      >
        {/* HTML5 Video Base */}
        <video
          ref={videoRef}
          src={videoSourceUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={handleContainerClick}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Ambient Subtle Animated Glow Progress Indicator (Always visible at screen bottom during playback) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10 pointer-events-none overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFB238] via-[#FFC870] to-[#2AC9B0] relative transition-[width] duration-150 ease-linear shadow-[0_-2px_14px_rgba(255,178,56,0.85)]"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          >
            {isPlaying && (
              <motion.div
                animate={{ x: ['-100%', '250%'] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/3 opacity-70"
              />
            )}
          </div>
        </div>

        {/* Animated YouTube-Style -10s / +10s Burst Overlays */}
        <AnimatePresence>
          {burstAnim && (
            <motion.div
              key={burstAnim.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute top-1/2 -translate-y-1/2 p-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-[#FFB238] flex flex-col items-center justify-center gap-1 shadow-[0_0_50px_rgba(255,178,56,0.6)] ${
                burstAnim.type === 'rewind' ? 'left-1/6' : 'right-1/6'
              }`}
            >
              {burstAnim.type === 'rewind' ? (
                <>
                  <RotateCcw className="w-10 h-10 animate-spin" />
                  <span className="font-mono-meta font-extrabold text-sm text-white">-10 sec</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-10 h-10 animate-spin" />
                  <span className="font-mono-meta font-extrabold text-sm text-white">+10 sec</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality Toast Banner */}
        <AnimatePresence>
          {qualityToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl glass-panel border border-[#2AC9B0]/40 bg-black/80 text-[#2AC9B0] text-xs font-mono-meta font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(42,201,176,0.3)] pointer-events-none"
            >
              <Sparkles className="w-4 h-4 text-[#2AC9B0] animate-pulse" />
              <span>{qualityToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header Overlay Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="p-3 rounded-full bg-white/10 hover:bg-[#FFB238] hover:text-[#0A0B0F] text-white transition-colors"
                  title="Close Cinema Player (Esc)"
                >
                  <X className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>{mediaItem.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono-meta bg-[#FFB238]/20 text-[#FFB238] border border-[#FFB238]/30 rounded-full font-semibold">
                      {quality}
                    </span>
                  </h2>
                  {mediaItem.tagline && (
                    <p className="text-xs text-slate-400 font-mono-meta line-clamp-1">{mediaItem.tagline}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono-meta">
                  <Zap className="w-3.5 h-3.5 text-[#2AC9B0]" />
                  <span>Dolby Atmos 5.1</span>
                </div>

                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setActiveSettingsTab('main');
                  }}
                  className={`p-3 rounded-full transition-colors ${
                    showSettings ? 'bg-[#FFB238] text-[#0A0B0F]' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Player Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Popup Menu */}
        <AnimatePresence>
          {showControls && showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-20 right-6 w-72 glass-panel rounded-2xl shadow-2xl p-4 z-30 border border-white/15"
            >
              {activeSettingsTab === 'main' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono-meta font-bold text-[#FFB238] uppercase tracking-wider mb-2">
                    Player Settings
                  </h3>
                  <button
                    onClick={() => setActiveSettingsTab('speed')}
                    className="w-full p-2.5 rounded-xl hover:bg-white/5 text-xs text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      Playback Speed
                    </span>
                    <span className="text-[#FFB238] font-mono-meta font-bold flex items-center gap-1">
                      {playbackSpeed}x <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSettingsTab('quality')}
                    className="w-full p-2.5 rounded-xl hover:bg-white/5 text-xs text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-400" />
                      Stream Quality
                    </span>
                    <span className="text-[#2AC9B0] font-mono-meta font-bold flex items-center gap-1">
                      {quality} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              )}

              {activeSettingsTab === 'speed' && (
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveSettingsTab('main')}
                    className="text-[11px] text-slate-400 hover:text-white mb-2 flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <p className="text-xs font-bold text-white mb-2">Playback Speed</p>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        changeSpeed(s);
                        setShowSettings(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs font-mono-meta flex items-center justify-between ${
                        playbackSpeed === s
                          ? 'bg-[#FFB238]/20 text-[#FFB238] font-bold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{s === 1 ? 'Normal (1x)' : `${s}x`}</span>
                      {playbackSpeed === s && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}

              {activeSettingsTab === 'quality' && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => setActiveSettingsTab('main')}
                    className="text-[11px] text-slate-400 hover:text-white mb-2 flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">Stream Quality Selector</p>
                    <span className="text-[10px] font-mono-meta text-[#2AC9B0] bg-[#2AC9B0]/10 px-2 py-0.5 rounded-full">
                      Adaptive Bitrate
                    </span>
                  </div>

                  {[
                    { key: 'Auto', label: 'Auto (Adaptive)', desc: 'Auto-adjusts based on internet speed', badge: 'Recommended' },
                    { key: '1080p', label: '1080p Full HD', desc: 'Crisp HD streaming • 15 Mbps', badge: 'High Speed' },
                    { key: '4K', label: '4K Ultra HD', desc: 'Maximum clarity • 25+ Mbps', badge: 'Ultra Bandwidth' },
                    { key: '720p', label: '720p HD', desc: 'Balanced HD streaming • 5 Mbps', badge: 'Data Saver' }
                  ].map((item) => {
                    const isSelected = quality === item.key || quality.startsWith(item.key);
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          handleQualitySelect(item.key, item.label);
                          setShowSettings(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#2AC9B0]/20 border border-[#2AC9B0]/50 text-[#2AC9B0] font-bold shadow-[0_0_15px_rgba(42,201,176,0.2)]'
                            : 'text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{item.label}</span>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-[#2AC9B0]" />
                          ) : (
                            <span className="text-[9px] font-mono-meta px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono-meta mt-0.5">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Control Bar Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent space-y-3 z-20"
            >
              {/* Scrubbable Progress Bar with Buffered track and hover time tooltip */}
              <div
                className="relative h-2.5 w-full bg-white/20 rounded-full cursor-pointer group"
                onClick={(e) => {
                  if (!videoRef.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  const newTime = pos * duration;
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setHoverPosRatio(pos);
                  setHoverTime(pos * duration);
                }}
                onMouseLeave={() => setHoverTime(null)}
              >
                {/* Buffered Track */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full"
                  style={{ width: `${(bufferedEnd / (duration || 1)) * 100}%` }}
                />

                {/* Watched Progress Track */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FFB238] to-[#2AC9B0] rounded-full shadow-[0_0_12px_#FFB238]"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />

                {/* Scrubber Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#FFB238] shadow-lg group-hover:scale-125 transition-transform"
                  style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                />

                {/* Hover Time & Thumbnail Preview Tooltip */}
                {hoverTime !== null && (
                  <div
                    className="absolute bottom-6 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-[11px] font-mono-meta font-bold text-[#FFB238] shadow-xl pointer-events-none"
                    style={{ left: `${hoverPosRatio * 100}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white pt-1">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-[#FFB238] text-[#0A0B0F] shadow-[0_0_20px_rgba(255,178,56,0.6)] hover:scale-110 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  {/* Rewind / Fast Forward Buttons */}
                  <button
                    onClick={() => seekRelative(-10)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Rewind 10s (Left Arrow)"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => seekRelative(10)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Forward 10s (Right Arrow)"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-slate-300 hover:text-white rounded-full transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-24 accent-[#FFB238] cursor-pointer"
                    />
                  </div>

                  {/* Timestamp Display */}
                  <div className="text-xs font-mono-meta text-slate-300">
                    <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-3">
                  <span className="hidden lg:inline-block text-[11px] font-mono-meta text-slate-400">
                    Keyboard: Space (Play/Pause) • ← → (Seek) • F (Full)
                  </span>

                  {/* Quick Quality Selector Button */}
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setActiveSettingsTab('quality');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#2AC9B0]/20 hover:border-[#2AC9B0]/50 border border-white/15 text-xs font-mono-meta font-bold text-slate-200 transition-colors"
                    title="Adjust Streaming Quality (Auto / 1080p / 4K)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2AC9B0]" />
                    <span>{quality === 'Auto' ? 'AUTO' : quality}</span>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Toggle Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

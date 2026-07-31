import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { ContentRow } from './components/ContentRow';
import { MediaDetailModal } from './components/MediaDetailModal';
import { SearchOverlay } from './components/SearchOverlay';
import { PageLoadSplash } from './components/PageLoadSplash';
import { OnboardingModal } from './components/OnboardingModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SkeletonRow } from './components/SkeletonRow';
import { Footer } from './components/Footer';
import { HERO_SLIDES, ALL_MEDIA, USER_PROFILES, INITIAL_NOTIFICATIONS } from './data/mockData';
import { MediaItem, UserProfile, AppNotification } from './types';
import { Bookmark, Sparkles, Film, Tv, Play, Trash2, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selected media for Info Detail Modal
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Selected media for Full Custom Cinema Video Player
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);

  // Dynamic Media state to preserve play progress
  const [mediaList, setMediaList] = useState<MediaItem[]>(ALL_MEDIA);

  // Onboarding state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('watchpy_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return USER_PROFILES[0];
  });

  // Tab switching loading skeleton simulator
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Check on mount if first time user
  useEffect(() => {
    try {
      const saved = localStorage.getItem('watchpy_user_profile');
      if (!saved) {
        // Open onboarding on first visit
        setIsOnboardingOpen(true);
      }
    } catch (e) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Persistent My List State
  const [myListIds, setMyListIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watchpy_mylist');
      return saved ? JSON.parse(saved) : ['py-cyberpunk-2099', 'py-quantum-alchemy', 'py-apex-formula'];
    } catch {
      return ['py-cyberpunk-2099', 'py-quantum-alchemy', 'py-apex-formula'];
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('watchpy_mylist', JSON.stringify(myListIds));
    } catch (e) {
      console.error(e);
    }
  }, [myListIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleMyList = (mediaId: string) => {
    const item = mediaList.find((m) => m.id === mediaId);
    if (!item) return;

    if (myListIds.includes(mediaId)) {
      setMyListIds((prev) => prev.filter((id) => id !== mediaId));
      showToast(`Removed "${item.title}" from My List`);
    } else {
      setMyListIds((prev) => [...prev, mediaId]);
      showToast(`Added "${item.title}" to My List`);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handlePlayMedia = (mediaId: string) => {
    setSelectedMediaId(null);
    setPlayingMediaId(mediaId);
  };

  const handleOpenInfoModal = (mediaId: string) => {
    setSelectedMediaId(mediaId);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setCurrentProfile(profile);
    try {
      localStorage.setItem('watchpy_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setIsOnboardingOpen(false);
    showToast(`Welcome to Watch PY, ${profile.name}!`);
  };

  // Update Media Progress from Video Player
  const handleUpdateVideoProgress = (mediaId: string, progressPct: number, remainingText: string) => {
    setMediaList((prev) =>
      prev.map((item) =>
        item.id === mediaId
          ? {
              ...item,
              progressPercentage: progressPct,
              continueRemaining: remainingText
            }
          : item
      )
    );
  };

  // Handle Tab Navigation with Skeleton Transition
  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(tabId);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 350);
  };

  // Filtered Media Views
  const continueWatchingItems = mediaList.filter((m) => m.progressPercentage !== undefined && m.progressPercentage > 0);
  const trendingItems = mediaList.filter((m) => m.isTrending);
  const newReleaseItems = mediaList.filter((m) => m.isNewRelease);
  const sciFiItems = mediaList.filter((m) => m.genres.includes('Sci-Fi') || m.genres.includes('Cyberpunk'));
  const actionItems = mediaList.filter((m) => m.genres.includes('Action') || m.genres.includes('Thriller'));
  const myMediaItems = mediaList.filter((m) => myListIds.includes(m.id));

  const selectedMediaItem = mediaList.find((m) => m.id === selectedMediaId) || null;
  const playingMediaItem = mediaList.find((m) => m.id === playingMediaId) || null;

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#F4F4F6] relative font-sans overflow-x-hidden selection:bg-[#FFB238] selection:text-[#0A0B0F]">
      {/* Page Load Splash Animation */}
      {!isSplashFinished && <PageLoadSplash onFinish={() => setIsSplashFinished(true)} />}

      {/* First Visit Onboarding Profile Setup */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={() => setIsOnboardingOpen(false)}
      />

      {/* Full-Screen Cinema Video Player */}
      {playingMediaItem && (
        <VideoPlayerModal
          mediaItem={playingMediaItem}
          onClose={() => setPlayingMediaId(null)}
          onUpdateProgress={handleUpdateVideoProgress}
        />
      )}

      {/* Toast Feedback Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#FFB238] text-[#0A0B0F] font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(255,178,56,0.6)] flex items-center gap-2.5 border border-[#FFC870]"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectMediaFromNotification={(id) => setSelectedMediaId(id)}
        currentProfile={currentProfile}
        profiles={USER_PROFILES}
        onSelectProfile={setCurrentProfile}
        myListCount={myListIds.length}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="relative z-10">
        {/* Welcome Profile Greeting Pill Banner */}
        <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/10 shadow-lg my-2">
            <div className="flex items-center gap-3">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFB238]"
              />
              <div>
                <p className="text-xs font-mono-meta text-slate-400">Welcome back,</p>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{currentProfile.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono-meta bg-[#FFB238]/15 text-[#FFB238] rounded-full border border-[#FFB238]/30">
                    4K Stream Pass Active
                  </span>
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono-meta text-slate-300 hover:text-white transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#2AC9B0]" />
              <span>Customize Avatar</span>
            </button>
          </div>
        </div>

        {/* Tab Loading Skeletons */}
        {isTabLoading ? (
          <div className="py-12 space-y-8">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <>
                {/* Full-Screen Hero Section */}
                <HeroCarousel
                  slides={HERO_SLIDES}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                  allMedia={mediaList}
                />

                {/* Content Rows */}
                <div className="space-y-4 -mt-12 sm:-mt-16 lg:-mt-20 relative z-20">
                  {continueWatchingItems.length > 0 && (
                    <ContentRow
                      title="Continue Watching"
                      subtitle="Pick up right where you left off"
                      items={continueWatchingItems}
                      onPlayMedia={handlePlayMedia}
                      onOpenInfoModal={handleOpenInfoModal}
                      myListIds={myListIds}
                      onToggleMyList={handleToggleMyList}
                      showProgress={true}
                    />
                  )}

                  <ContentRow
                    title="Trending Now"
                    subtitle="Top watched originals this week"
                    items={trendingItems}
                    onPlayMedia={handlePlayMedia}
                    onOpenInfoModal={handleOpenInfoModal}
                    myListIds={myListIds}
                    onToggleMyList={handleToggleMyList}
                  />

                  <ContentRow
                    title="New Releases"
                    subtitle="Freshly added in 4K Ultra HD"
                    items={newReleaseItems}
                    onPlayMedia={handlePlayMedia}
                    onOpenInfoModal={handleOpenInfoModal}
                    myListIds={myListIds}
                    onToggleMyList={handleToggleMyList}
                  />

                  <ContentRow
                    title="Because You Watched Cyberpulse"
                    subtitle="High-concept cyberpunk & sci-fi recommendations"
                    items={sciFiItems}
                    onPlayMedia={handlePlayMedia}
                    onOpenInfoModal={handleOpenInfoModal}
                    myListIds={myListIds}
                    onToggleMyList={handleToggleMyList}
                  />
                </div>
              </>
            )}

            {/* Movies Tab View */}
            {activeTab === 'movies' && (
              <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <Film className="w-8 h-8 text-[#FFB238]" />
                  <div>
                    <h1 className="text-3xl font-display text-white font-bold tracking-wide">Movies</h1>
                    <p className="text-xs text-slate-400 font-mono-meta">Cinematic feature films in 4K HDR & Spatial Audio</p>
                  </div>
                </div>

                <ContentRow
                  title="Top Rated Movies"
                  items={mediaList.filter((m) => m.type === 'movie')}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />

                <ContentRow
                  title="High-Octane Action & Thrillers"
                  items={actionItems.filter((m) => m.type === 'movie')}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />
              </div>
            )}

            {/* Series Tab View */}
            {activeTab === 'series' && (
              <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <Tv className="w-8 h-8 text-[#2AC9B0]" />
                  <div>
                    <h1 className="text-3xl font-display text-white font-bold tracking-wide">Series</h1>
                    <p className="text-xs text-slate-400 font-mono-meta">Binge-worthy Watch py original television series</p>
                  </div>
                </div>

                <ContentRow
                  title="Binge-Worthy Series"
                  items={mediaList.filter((m) => m.type === 'series')}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />

                <ContentRow
                  title="Sci-Fi & Cyberpunk Sagas"
                  items={sciFiItems.filter((m) => m.type === 'series')}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />
              </div>
            )}

            {/* New & Popular Tab View */}
            {activeTab === 'popular' && (
              <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <Sparkles className="w-8 h-8 text-[#FFB238]" />
                  <div>
                    <h1 className="text-3xl font-display text-white font-bold tracking-wide">New & Popular</h1>
                    <p className="text-xs text-slate-400 font-mono-meta">The most talked-about releases on Watch py right now</p>
                  </div>
                </div>

                <ContentRow
                  title="Top 10 Today"
                  items={mediaList.filter((m) => m.isTop10)}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />

                <ContentRow
                  title="New Releases"
                  items={newReleaseItems}
                  onPlayMedia={handlePlayMedia}
                  onOpenInfoModal={handleOpenInfoModal}
                  myListIds={myListIds}
                  onToggleMyList={handleToggleMyList}
                />
              </div>
            )}

            {/* My List Tab View */}
            {activeTab === 'mylist' && (
              <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-8 h-8 text-[#FFB238]" />
                    <div>
                      <h1 className="text-3xl font-display text-white font-bold tracking-wide">My List</h1>
                      <p className="text-xs text-slate-400 font-mono-meta">
                        {myMediaItems.length} saved title{myMediaItems.length !== 1 ? 's' : ''} in your collection
                      </p>
                    </div>
                  </div>

                  {myMediaItems.length > 0 && (
                    <button
                      onClick={() => setMyListIds([])}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-mono-meta border border-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear List
                    </button>
                  )}
                </div>

                {myMediaItems.length === 0 ? (
                  <div className="py-20 text-center glass-panel rounded-3xl max-w-lg mx-auto p-8 space-y-4">
                    <Bookmark className="w-12 h-12 text-[#FFB238] mx-auto opacity-60" />
                    <h3 className="text-xl font-bold text-white">Your List is empty</h3>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                      Explore Watch py titles and click <strong>"+ My List"</strong> to save movies and series here for instant watching anytime.
                    </p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-6 py-3 rounded-2xl bg-[#FFB238] text-[#0A0B0F] font-bold text-xs shadow-lg hover:bg-[#FFC870] transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {myMediaItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenInfoModal(item.id)}
                        className="group cursor-pointer bg-[#12141C] rounded-2xl overflow-hidden border border-white/10 transition-all hover:-translate-y-1.5 hover:border-[#FFB238]/50 shadow-xl"
                      >
                        <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayMedia(item.id);
                              }}
                              className="p-2 rounded-xl bg-[#FFB238] text-[#0A0B0F] font-bold shadow-lg hover:scale-105 transition-transform"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMyList(item.id);
                              }}
                              className="p-2 rounded-xl bg-black/60 text-rose-400 border border-white/20 hover:bg-rose-500/20 transition-colors"
                              title="Remove from My List"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 space-y-1">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#FFB238] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] font-mono-meta text-slate-400 flex items-center justify-between">
                            <span className="text-[#2AC9B0]">{item.rating}</span>
                            <span>{item.year}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Detail Modal */}
      {selectedMediaItem && (
        <MediaDetailModal
          mediaItem={selectedMediaItem}
          onClose={() => setSelectedMediaId(null)}
          onPlayMedia={handlePlayMedia}
          myListIds={myListIds}
          onToggleMyList={handleToggleMyList}
          allMedia={mediaList}
        />
      )}

      {/* Real-Time Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allMedia={mediaList}
        onPlayMedia={handlePlayMedia}
        onOpenInfoModal={handleOpenInfoModal}
        myListIds={myListIds}
        onToggleMyList={handleToggleMyList}
      />
    </div>
  );
}

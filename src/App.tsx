import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { ContentRow } from './components/ContentRow';
import { MediaDetailModal } from './components/MediaDetailModal';
import { SearchOverlay } from './components/SearchOverlay';
import { PageLoadSplash } from './components/PageLoadSplash';
import { AuthModal } from './components/AuthModal';
import { AvatarSelectorModal } from './components/AvatarSelectorModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SkeletonRow } from './components/SkeletonRow';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { subscribeToTitles, subscribeToAuthState, logoutAdminUser, subscribeToUserProfileDoc, checkIsAdminUser } from './lib/firebaseService';
import { HERO_SLIDES, ALL_MEDIA, USER_PROFILES, INITIAL_NOTIFICATIONS } from './data/mockData';
import { MediaItem, UserProfile, AppNotification } from './types';
import { Bookmark, Sparkles, Film, Tv, Play, Trash2, Shield, User, LockKeyhole } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Auth & Modal State
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authInterceptMessage, setAuthInterceptMessage] = useState<string | null>(null);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      setAuthUser(user);
      if (user) {
        const isUserAdmin = await checkIsAdminUser(user);
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Listen for unlisted private admin route (/admin or #admin) and redirect non-admin users
  useEffect(() => {
    const checkAdminRoute = () => {
      const isNavigatingToAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      if (isNavigatingToAdmin) {
        if (authUser && !isAdmin) {
          window.history.replaceState({}, '', '/');
          setActiveTab('home');
          setIsAdminOpen(false);
          showToast('Access Denied: Redirected to Home');
        } else {
          setIsAdminOpen(true);
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [authUser, isAdmin]);

  // Guard against non-admin users accessing admin panel
  useEffect(() => {
    const isNavigatingToAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
    if ((isAdminOpen || isNavigatingToAdmin) && authUser && !isAdmin) {
      window.history.replaceState({}, '', '/');
      setActiveTab('home');
      setIsAdminOpen(false);
    }
  }, [authUser, isAdmin, isAdminOpen]);

  // Global Keyboard Navigation Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElem = document.activeElement;
      const isTyping =
        activeElem &&
        (activeElem.tagName === 'INPUT' ||
          activeElem.tagName === 'TEXTAREA' ||
          (activeElem as HTMLElement).isContentEditable);

      // Escape always closes overlays
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsShortcutsOpen(false);
        setSelectedMediaId(null);
        setPlayingMediaId(null);
        setIsAdminOpen(false);
        setIsAvatarStudioOpen(false);
        setIsAuthOpen(false);
        return;
      }

      if (isTyping) return;

      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'h') {
        e.preventDefault();
        setActiveTab('home');
        showToast('Navigated to Home (H)');
      } else if (key === 'm') {
        e.preventDefault();
        setActiveTab('mylist');
        showToast('Navigated to My List (M)');
      } else if (key === 'f') {
        e.preventDefault();
        setActiveTab('movies');
        showToast('Navigated to Movies (F)');
      } else if (key === 't') {
        e.preventDefault();
        setActiveTab('tv');
        showToast('Navigated to TV Shows (T)');
      } else if (key === 's' || key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (key === 'a') {
        e.preventDefault();
        setIsAvatarStudioOpen(true);
      } else if (key === 'p') {
        e.preventDefault();
        if (HERO_SLIDES.length > 0) {
          handlePlayMedia(HERO_SLIDES[0].mediaId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authUser]);

  // Listen to Firestore User Profile updates (Avatar & Display Name)
  useEffect(() => {
    if (!authUser?.uid) return;
    const unsubProfile = subscribeToUserProfileDoc(authUser.uid, (data) => {
      if (data) {
        if (data.avatar || data.displayName) {
          setCurrentProfile((prev) => ({
            ...prev,
            avatar: data.avatar || prev.avatar,
            name: data.displayName || prev.name,
          }));
        }
      }
    });
    return () => unsubProfile();
  }, [authUser]);

  // Selected media for Info Detail Modal
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Selected media for Full Custom Cinema Video Player
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);

  // Dynamic Media state to preserve play progress and integrate real-time Firestore titles
  const [mediaList, setMediaList] = useState<MediaItem[]>(ALL_MEDIA);

  const [currentProfile, setCurrentProfile] = useState<UserProfile>(USER_PROFILES[0]);

  // Tab switching loading skeleton simulator
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Subscribe to real-time Firestore 'titles' collection
  useEffect(() => {
    const unsubscribe = subscribeToTitles((firestoreTitles) => {
      if (firestoreTitles && firestoreTitles.length > 0) {
        // Prepend Firestore titles to catalog so newly uploaded videos immediately appear
        const firestoreIds = new Set(firestoreTitles.map((t) => t.id));
        const defaultMediaFiltered = ALL_MEDIA.filter((m) => !firestoreIds.has(m.id));
        setMediaList([...firestoreTitles, ...defaultMediaFiltered]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Route listener for /admin or #admin URL access
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setIsAdminOpen(true);
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
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

  const handleOpenAuth = (mode: 'login' | 'signup', msg?: string) => {
    setAuthInterceptMessage(msg || null);
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handlePlayMedia = (mediaId: string) => {
    if (!authUser) {
      handleOpenAuth('signup', 'Create an account to stream movies and series on Watch PY.');
      return;
    }
    setSelectedMediaId(null);
    setPlayingMediaId(mediaId);
  };

  const handleOpenInfoModal = (mediaId: string) => {
    if (!authUser) {
      handleOpenAuth('signup', 'Create a free account to preview Watch PY titles.');
      return;
    }
    setSelectedMediaId(mediaId);
  };

  const handleSignOut = async () => {
    await logoutAdminUser();
    setAuthUser(null);
    showToast('Signed out successfully.');
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

      {/* Auth Modal (Sign Up / Login) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthInterceptMessage(null);
        }}
        initialMode={authMode}
        interceptMessage={authInterceptMessage}
        onAuthSuccess={(email, userObj) => {
          if (userObj) {
            setAuthUser(userObj);
            checkIsAdminUser(userObj).then((isUserAdmin) => setIsAdmin(isUserAdmin));
          } else {
            const fallbackUser = { uid: `user-${Date.now()}`, email };
            setAuthUser(fallbackUser);
            checkIsAdminUser(fallbackUser).then((isUserAdmin) => setIsAdmin(isUserAdmin));
          }
          showToast(`Signed in as ${email}`);
        }}
      />

      {/* Cinematic Avatar Studio Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
        currentAvatar={currentProfile.avatar}
        currentName={currentProfile.name}
        userUid={authUser?.uid}
        onAvatarSaved={(newAvatar, newName) => {
          setCurrentProfile((prev) => ({ ...prev, avatar: newAvatar, name: newName }));
          showToast('Cinematic avatar saved to Firestore profile!');
        }}
      />

      {/* Keyboard Navigation Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
            window.history.replaceState({}, '', '/');
          }
        }}
        allTitles={mediaList}
        onPlayMedia={handlePlayMedia}
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
        onOpenAvatarStudio={() => setIsAvatarStudioOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isAdmin={isAdmin}
        isLoggedIn={!!authUser}
        userEmail={authUser?.email}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Areas */}
      <main className="relative z-10">
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

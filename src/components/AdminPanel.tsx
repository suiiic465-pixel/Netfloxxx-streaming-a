import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  UploadCloud,
  Film,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  X,
  FileVideo,
  Image as ImageIcon,
  Key,
  Layers,
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Info,
  Check,
  RefreshCw,
  Lock,
  User,
  Tv,
  LayoutDashboard,
  Sliders,
  BarChart3,
  Database,
  Play,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Settings as SettingsIcon,
  Tag,
  Clock,
  Star,
  Activity,
  HardDrive,
  Grid,
  List,
  Users,
  Menu
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginAdminUser,
  createAdminUser,
  loginAnonymousAdminUser,
  logoutAdminUser,
  subscribeToAuthState,
  uploadFileToStorage,
  createTitleInFirestore,
  updateTitleInFirestore,
  deleteTitleFromFirestore,
  subscribeToRegisteredUsers,
  FirestoreUserRecord
} from '../lib/firebaseService';
import { firebaseConfig } from '../lib/firebase';
import { MediaItem } from '../types';
import { ApertureLogo } from './ApertureLogo';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allTitles: MediaItem[];
  onPlayMedia?: (mediaId: string) => void;
}

const GENRE_OPTIONS = [
  'Sci-Fi',
  'Action',
  'Cyberpunk',
  'Thriller',
  'Drama',
  'Comedy',
  'Horror',
  'Anime',
  'Documentary',
  'Romance',
  'Fantasy'
];

const RATING_OPTIONS = ['TV-MA', 'PG-13', 'R', 'PG', 'G', 'TV-14'];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  allTitles,
  onPlayMedia
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuestSession, setIsGuestSession] = useState<boolean>(false);

  const isAuthenticated = !!currentUser || isGuestSession;

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('admin@watchpy.com');
  const [authPassword, setAuthPassword] = useState('WatchPyAdmin2026!');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Active Tab: 'dashboard' | 'catalog' | 'users' | 'upload' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'users' | 'upload' | 'analytics' | 'settings'>('dashboard');

  // Registered Users from Firestore
  const [registeredUsers, setRegisteredUsers] = useState<FirestoreUserRecord[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    const unsub = subscribeToRegisteredUsers((users) => {
      setRegisteredUsers(users);
    });
    return () => unsub();
  }, []);

  // Sidebar Collapsed & Mobile Drawer state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form Fields State (Upload / Create)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Sci-Fi');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sci-Fi']);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState('1h 48m');
  const [rating, setRating] = useState('TV-MA');
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [tagline, setTagline] = useState('');
  const [isTrending, setIsTrending] = useState(true);
  const [isNewRelease, setIsNewRelease] = useState(true);

  // Upload Step inside Upload Tab
  const [uploadFormSection, setUploadFormSection] = useState<'basic' | 'media' | 'options'>('basic');

  // File Upload State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Upload Progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Catalog Table Search & Filters
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'year' | 'rating'>('newest');

  // Modal State for Editing & Deleting
  const [editingTitle, setEditingTitle] = useState<MediaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (isSignUpMode) {
        await createAdminUser(authEmail, authPassword);
        showToast('Admin account created and logged in!');
      } else {
        await loginAdminUser(authEmail, authPassword);
        showToast('Successfully logged into Admin Panel');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setIsGuestSession(true);
        showToast('Email Auth is disabled in Firebase Console. Quick Admin Session Activated!');
      } else {
        console.warn('Firebase auth notice:', err.message);
        let errMsg = err.message || 'Authentication failed. Please check credentials.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          errMsg = 'Invalid email or password.';
        } else if (err.code === 'auth/user-not-found') {
          errMsg = 'No account found. Switch to Sign Up or try creating account.';
        }
        setAuthError(errMsg);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      setIsGuestSession(true);
      showToast('Quick Admin Studio Session Activated!');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsGuestSession(false);
    await logoutAdminUser();
    showToast('Logged out of Admin');
  };

  // Thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Thumbnail must be an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
      showToast('Video file must be MP4 or WebM format', 'error');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      showToast('Video file size is over 150MB. Please use a smaller clip for demo storage.', 'error');
      return;
    }

    setVideoFile(file);
    showToast(`Video selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  // Submit Upload Form
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showToast('Please fill out title and description fields.', 'error');
      return;
    }

    if (!thumbnailFile) {
      showToast('Please select a thumbnail image poster.', 'error');
      return;
    }

    if (!videoFile) {
      showToast('Please select a video file (MP4/WebM).', 'error');
      return;
    }

    setIsUploading(true);
    setProgressPercent(0);

    try {
      setUploadStep('Uploading Thumbnail Image to Firebase Storage...');
      const thumbnailUrl = await uploadFileToStorage(thumbnailFile, 'thumbnails', (pct) => {
        setProgressPercent(Math.round(pct * 0.3));
      });

      setUploadStep('Uploading Video File to Firebase Storage...');
      const videoUrl = await uploadFileToStorage(videoFile, 'videos', (pct) => {
        setProgressPercent(30 + Math.round(pct * 0.65));
      });

      setUploadStep('Saving Title Record to Firestore Database...');
      setProgressPercent(98);

      const finalGenres = selectedGenres.length > 0 ? selectedGenres : [selectedGenre, '4K Release'];

      const newMediaData: Omit<MediaItem, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        tagline: tagline.trim() || undefined,
        genres: finalGenres,
        year: year,
        duration: duration.trim() || '1h 50m',
        rating: '99% Match',
        ageRating: (rating || 'TV-MA') as any,
        resolution: '4K Ultra HD',
        type: contentType,
        posterUrl: thumbnailUrl,
        backdropUrl: thumbnailUrl,
        trailerVideoUrl: videoUrl,
        cast: ['Watch PY Originals'],
        isTrending: isTrending,
        isNewRelease: isNewRelease
      };

      await createTitleInFirestore(newMediaData);

      setProgressPercent(100);
      setUploadStep('Complete!');

      showToast(`Successfully published "${title}" to Watch PY!`);

      // Reset form
      setTitle('');
      setDescription('');
      setTagline('');
      setThumbnailFile(null);
      setThumbnailPreviewUrl(null);
      setVideoFile(null);
      setActiveTab('catalog');
    } catch (err: any) {
      console.error('Upload Error:', err);
      showToast(err.message || 'Failed to upload title to Firebase.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Title
  const handleDeleteTitle = async (id: string, titleName: string) => {
    try {
      await deleteTitleFromFirestore(id);
      showToast(`Deleted "${titleName}" from database.`);
      setDeletingId(null);
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`, 'error');
    }
  };

  // Update Title
  const handleSaveEdit = async () => {
    if (!editingTitle) return;
    try {
      await updateTitleInFirestore(editingTitle.id, {
        title: editingTitle.title,
        description: editingTitle.description,
        genres: editingTitle.genres,
        year: editingTitle.year,
        duration: editingTitle.duration,
        rating: editingTitle.rating
      });
      showToast(`Updated "${editingTitle.title}" metadata.`);
      setEditingTitle(null);
    } catch (err: any) {
      showToast(`Failed to update: ${err.message}`, 'error');
    }
  };

  // Filter & Sort titles for catalog table
  const filteredAndSortedTitles = allTitles
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(dashboardSearch.toLowerCase())) ||
        (item.genres && item.genres.some((g) => g.toLowerCase().includes(dashboardSearch.toLowerCase())));

      const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;

      const matchesGenre =
        selectedGenreFilter === 'all' ||
        (item.genres && item.genres.some((g) => g.toLowerCase() === selectedGenreFilter.toLowerCase()));

      return matchesSearch && matchesType && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'rating') return (b.rating || '').localeCompare(a.rating || '');
      return 0;
    });

  // Calculate genre stats for overview & analytics
  const genreCounts: Record<string, number> = {};
  allTitles.forEach((t) => {
    (t.genres || ['Action']).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : 'Sci-Fi';

  const totalMovies = allTitles.filter((t) => t.type === 'movie').length;
  const totalSeries = allTitles.filter((t) => t.type === 'series').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B] text-[#E2E8F0] overflow-hidden font-sans select-none">
        {/* Toast Notification Container */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-xl ${
                toastMessage.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTHENTICATION GATE / LOGIN OVERLAY */}
        {!isAuthenticated ? (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-[#090A0F] via-[#0D0E16] to-[#08090D]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-8 rounded-2xl bg-[#12141D]/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FFB238]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#FFB238] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,178,56,0.15)]">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Watch PY Admin Studio</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate or launch Quick Admin Mode to manage titles and video assets.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <p className="leading-relaxed">{authError}</p>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0F] border border-white/10 focus:border-[#FFB238] text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0F] border border-white/10 focus:border-[#FFB238] text-xs text-white outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FFB238] hover:bg-[#ffa312] text-[#0A0B0F] font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>{isSignUpMode ? 'Create Admin Account' : 'Sign In with Email'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-[#12141D] px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  OR BYPASS
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
              >
                <Shield className="w-4 h-4 text-[#FFB238] group-hover:scale-110 transition-transform" />
                <span>Quick Admin Studio Session (Instant Access)</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  className="hover:text-white transition-colors"
                >
                  {isSignUpMode ? 'Already have an account? Sign In' : 'Need an admin account? Sign Up'}
                </button>
                <button onClick={onClose} className="hover:text-rose-400 transition-colors">
                  Close Modal
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* MAIN SAAS DASHBOARD LAYOUT */
          <div className="w-full h-full flex overflow-hidden relative">
            {/* DESKTOP SIDEBAR NAVIGATION */}
            <motion.aside
              animate={{ width: sidebarCollapsed ? 72 : 240 }}
              className="h-full bg-[#0E1017] border-r border-white/10 hidden md:flex flex-col justify-between z-20 transition-all shrink-0 relative"
            >
              {/* Sidebar Header */}
              <div>
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFB238] to-[#FF8C00] p-0.5 shrink-0 shadow-[0_0_15px_rgba(255,178,56,0.25)] flex items-center justify-center text-black font-bold">
                      <ApertureLogo className="w-5 h-5 text-black" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="truncate">
                        <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                          <span>Watch PY</span>
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-[#FFB238] border border-amber-500/20">
                            PRO
                          </span>
                        </h1>
                        <p className="text-[10px] text-slate-400 truncate">SaaS Content Control</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="p-3 space-y-1">
                  {[
                    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { id: 'catalog', label: 'Titles Catalog', icon: Film, count: allTitles.length },
                    { id: 'users', label: 'Registered Users', icon: Users, count: registeredUsers.length },
                    { id: 'upload', label: 'Upload New Title', icon: Plus },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'settings', label: 'Settings & DB', icon: SettingsIcon }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#FFB238]/10 text-[#FFB238] border border-[#FFB238]/30 shadow-[0_0_15px_rgba(255,178,56,0.08)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFB238]' : 'text-slate-400'}`} />
                        {!sidebarCollapsed && (
                          <span className="flex-1 text-left truncate">{item.label}</span>
                        )}
                        {!sidebarCollapsed && item.count !== undefined && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-slate-300 font-mono">
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer: User Status & Close */}
              <div className="p-3 border-t border-white/5 space-y-2">
                {!sidebarCollapsed ? (
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-medium">Session Status</p>
                      <p className="text-xs font-semibold text-white truncate">
                        {currentUser ? currentUser.email : 'Quick Admin Session'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 flex justify-center text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white/5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FFB238]" />
                  {!sidebarCollapsed && <span>Return to App</span>}
                </button>
              </div>
            </motion.aside>

            {/* MOBILE NAVIGATION DRAWER OVERLAY */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />

                  {/* Drawer Content */}
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-4/5 max-w-xs h-full bg-[#0E1017] border-r border-white/10 flex flex-col justify-between z-10 p-4 overflow-y-auto"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFB238] to-[#FF8C00] p-0.5 shrink-0 flex items-center justify-center">
                            <ApertureLogo className="w-4 h-4 text-black" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold text-white">Watch PY Studio</h2>
                            <p className="text-[10px] text-slate-400">Admin Control</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <nav className="space-y-1.5">
                        {[
                          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                          { id: 'catalog', label: 'Titles Catalog', icon: Film, count: allTitles.length },
                          { id: 'users', label: 'Registered Users', icon: Users, count: registeredUsers.length },
                          { id: 'upload', label: 'Upload New Title', icon: Plus },
                          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                          { id: 'settings', label: 'Settings & DB', icon: SettingsIcon }
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id as any);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-[#FFB238]/15 text-[#FFB238] border border-[#FFB238]/30'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFB238]' : 'text-slate-400'}`} />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.count !== undefined && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 font-mono text-slate-300">
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </nav>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="truncate">
                          <p className="text-[10px] text-slate-400">Admin Session</p>
                          <p className="text-xs font-semibold text-white truncate">
                            {currentUser ? currentUser.email : 'Quick Admin Session'}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 text-[#FFB238]" />
                        <span>Return to App</span>
                      </button>
                    </div>
                  </motion.aside>
                </div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 h-full flex flex-col min-w-0 bg-[#090A0E] overflow-hidden">
              {/* TOP HEADER BAR */}
              <header className="h-14 sm:h-16 border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-[#0E1017]/90 backdrop-blur-md">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Menu Toggle Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 md:hidden shrink-0"
                    title="Open Navigation Menu"
                  >
                    <Menu className="w-5 h-5 text-[#FFB238]" />
                  </button>

                  <h2 className="text-sm sm:text-lg font-bold text-white capitalize tracking-tight flex items-center gap-1.5 truncate">
                    <span className="truncate">
                      {activeTab === 'dashboard' && 'Overview'}
                      {activeTab === 'catalog' && 'Titles Catalog'}
                      {activeTab === 'users' && 'Registered Users'}
                      {activeTab === 'upload' && 'Upload Title'}
                      {activeTab === 'analytics' && 'Analytics'}
                      {activeTab === 'settings' && 'Settings'}
                    </span>
                  </h2>
                  <span className="text-slate-600 hidden xs:inline">/</span>
                  <span className="text-[11px] text-slate-400 font-mono hidden xs:inline shrink-0">
                    {allTitles.length} synced
                  </span>
                </div>

                {/* Top Bar Quick Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Search bar inside header for catalog view */}
                  {activeTab === 'catalog' && (
                    <div className="relative hidden md:block w-48 lg:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search catalog..."
                        value={dashboardSearch}
                        onChange={(e) => setDashboardSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#141722] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('upload')}
                    className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-[#FFB238] hover:bg-[#ffa312] text-[#0A0B0F] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-[#FFB238]/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Title</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                    title="Close Admin Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* DYNAMIC TAB VIEW CONTENT */}
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto min-h-0 space-y-4 sm:space-y-6 pb-20 md:pb-6">
                {/* 1. DASHBOARD OVERVIEW TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* STATS METRIC CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stat 1: Total Titles */}
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 shadow-lg space-y-3 relative overflow-hidden group hover:border-[#FFB238]/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Total Published</span>
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#FFB238] flex items-center justify-center border border-amber-500/20">
                            <Film className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white tracking-tight">
                            {allTitles.length}
                          </p>
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% Synced to Firestore</span>
                          </p>
                        </div>
                      </div>

                      {/* Stat 2: Storage Allocated */}
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 shadow-lg space-y-3 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Storage Allocation</span>
                          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                            <HardDrive className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white tracking-tight">
                            ~{(allTitles.length * 120 + 350).toLocaleString()} MB
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Media assets & Firebase Storage
                          </p>
                        </div>
                      </div>

                      {/* Stat 3: Top Genre */}
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 shadow-lg space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Top Catalog Genre</span>
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white tracking-tight">
                            {topGenre}
                          </p>
                          <p className="text-[11px] text-purple-300 mt-1">
                            {genreCounts[topGenre] || 0} titles ({Math.round(((genreCounts[topGenre] || 0) / (allTitles.length || 1)) * 100)}% share)
                          </p>
                        </div>
                      </div>

                      {/* Stat 4: Content Type Ratio */}
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 shadow-lg space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Movies vs Series</span>
                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                            <Tv className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white tracking-tight">
                            {totalMovies}M / {totalSeries}S
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {totalMovies} Movies, {totalSeries} Series
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QUICK ACTION RIBBON */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#141724] to-[#10121C] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Quick Catalog Actions</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Manage content records and upload new media to Firebase
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="py-2 px-4 rounded-xl bg-[#FFB238] hover:bg-[#ffa312] text-[#0A0B0F] font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-[#FFB238]/10"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Upload New Title</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('catalog')}
                          className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-2 border border-white/10 transition-colors"
                        >
                          <Film className="w-4 h-4 text-[#FFB238]" />
                          <span>View All Titles</span>
                        </button>
                      </div>
                    </div>

                    {/* RECENT UPLOADS & GENRE BREAKDOWN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Recent Uploads Table Card */}
                      <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12141D] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#FFB238]" />
                            <span>Recently Uploaded Titles</span>
                          </h3>
                          <button
                            onClick={() => setActiveTab('catalog')}
                            className="text-xs text-[#FFB238] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Manage All</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {allTitles.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-[#0B0C10] border border-white/5 flex items-center justify-between gap-4 hover:border-white/20 transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.posterUrl || item.backdropUrl}
                                  alt={item.title}
                                  className="w-10 h-14 object-cover rounded-lg bg-slate-800 shrink-0 border border-white/10"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FFB238] transition-colors">
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                    <span className="uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                                      {item.type}
                                    </span>
                                    <span>•</span>
                                    <span>{item.year}</span>
                                    <span>•</span>
                                    <span>{item.duration}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {onPlayMedia && item.trailerVideoUrl && (
                                  <button
                                    onClick={() => onPlayMedia(item.id)}
                                    className="p-2 rounded-lg bg-amber-500/10 text-[#FFB238] hover:bg-amber-500/20 transition-colors"
                                    title="Preview Player"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                )}
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Published
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Genre Distribution Card */}
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                          <Tag className="w-4 h-4 text-teal-400" />
                          <span>Catalog Genre Mix</span>
                        </h3>

                        <div className="space-y-3">
                          {sortedGenres.slice(0, 6).map(([genreName, count]) => {
                            const percentage = Math.round((count / (allTitles.length || 1)) * 100);
                            return (
                              <div key={genreName} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-300 font-medium">{genreName}</span>
                                  <span className="text-slate-400 font-mono">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#FFB238] to-teal-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TITLES CATALOG TAB (DATA TABLE) */}
                {activeTab === 'catalog' && (
                  <div className="space-y-4">
                    {/* Search & Filter Toolbar */}
                    <div className="p-4 rounded-2xl bg-[#12141D] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                      {/* Filter Controls */}
                      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter by title or genre..."
                            value={dashboardSearch}
                            onChange={(e) => setDashboardSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-500 outline-none transition-colors"
                          />
                        </div>

                        {/* Content Type Filter */}
                        <div className="flex bg-[#090A0E] p-1 rounded-xl border border-white/10">
                          {(['all', 'movie', 'series'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setSelectedTypeFilter(type)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                selectedTypeFilter === type
                                  ? 'bg-[#FFB238] text-[#0A0B0F]'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        {/* Genre Filter Select */}
                        <select
                          value={selectedGenreFilter}
                          onChange={(e) => setSelectedGenreFilter(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-slate-300 outline-none focus:border-[#FFB238] transition-colors"
                        >
                          <option value="all">All Genres</option>
                          {GENRE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort dropdown */}
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-slate-300 outline-none focus:border-[#FFB238] transition-colors"
                        >
                          <option value="newest">Sort: Year (Newest)</option>
                          <option value="title">Sort: Title (A-Z)</option>
                          <option value="rating">Sort: Match Rating</option>
                        </select>
                      </div>
                    </div>

                    {/* Data Table / Mobile Cards */}
                    <div className="rounded-2xl bg-[#12141D] border border-white/10 overflow-hidden shadow-xl">
                      {/* MOBILE CARD LIST VIEW */}
                      <div className="sm:hidden p-3 space-y-3">
                        {filteredAndSortedTitles.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-xs">
                            No titles matched your search filters.
                          </div>
                        ) : (
                          filteredAndSortedTitles.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-[#0B0C10] border border-white/10 space-y-3"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={item.posterUrl || item.backdropUrl}
                                  alt={item.title}
                                  className="w-14 h-20 object-cover rounded-lg bg-slate-800 border border-white/10 shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                                    <span className="uppercase px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-slate-200 border border-white/10 shrink-0">
                                      {item.type}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1">
                                    {item.tagline || (item.genres || []).join(', ')}
                                  </p>

                                  <div className="flex items-center gap-2 text-[10px] text-slate-300 pt-1">
                                    <span className="font-semibold text-[#FFB238]">{item.year}</span>
                                    <span>•</span>
                                    <span>{item.duration}</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-bold">{item.rating}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                  Published
                                </span>

                                <div className="flex items-center gap-2">
                                  {onPlayMedia && item.trailerVideoUrl && (
                                    <button
                                      onClick={() => onPlayMedia(item.id)}
                                      className="p-1.5 rounded-lg bg-amber-500/10 text-[#FFB238]"
                                      title="Play Video"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setEditingTitle(item)}
                                    className="p-1.5 rounded-lg bg-white/5 text-slate-300 border border-white/5"
                                    title="Edit Metadata"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(item.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"
                                    title="Delete Title"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* DESKTOP TABLE VIEW */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0C10] border-b border-white/10 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-3.5 px-4">Title & Poster</th>
                              <th className="py-3.5 px-4">Type & Genres</th>
                              <th className="py-3.5 px-4">Year & Duration</th>
                              <th className="py-3.5 px-4">Match / Rating</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredAndSortedTitles.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                  No titles matched your search filters.
                                </td>
                              </tr>
                            ) : (
                              filteredAndSortedTitles.map((item) => (
                                <tr
                                  key={item.id}
                                  className="hover:bg-white/[0.02] transition-colors group"
                                >
                                  {/* Title & Poster */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={item.posterUrl || item.backdropUrl}
                                        alt={item.title}
                                        className="w-9 h-12 object-cover rounded-lg bg-slate-800 border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-white group-hover:text-[#FFB238] transition-colors truncate">
                                          {item.title}
                                        </p>
                                        {item.tagline && (
                                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                                            {item.tagline}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Type & Genres */}
                                  <td className="py-3 px-4">
                                    <div className="space-y-1">
                                      <span className="inline-block uppercase px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                                        {item.type}
                                      </span>
                                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                        {(item.genres || []).join(', ')}
                                      </p>
                                    </div>
                                  </td>

                                  {/* Year & Duration */}
                                  <td className="py-3 px-4 text-slate-300">
                                    <p className="font-semibold">{item.year}</p>
                                    <p className="text-[10px] text-slate-400">{item.duration}</p>
                                  </td>

                                  {/* Rating */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-emerald-400 font-bold">{item.rating}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                                        {item.ageRating}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Status Badge */}
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Published
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {onPlayMedia && item.trailerVideoUrl && (
                                        <button
                                          onClick={() => onPlayMedia(item.id)}
                                          className="p-1.5 rounded-lg bg-amber-500/10 text-[#FFB238] hover:bg-amber-500/20 transition-colors"
                                          title="Play Video"
                                        >
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                      )}

                                      <button
                                        onClick={() => setEditingTitle(item)}
                                        className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                                        title="Edit Metadata"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => setDeletingId(item.id)}
                                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                        title="Delete Title"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Footer Summary */}
                      <div className="p-3.5 bg-[#0B0C10] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          Showing <strong className="text-white">{filteredAndSortedTitles.length}</strong> of{' '}
                          <strong className="text-white">{allTitles.length}</strong> total records
                        </span>
                        <span>Firestore Collection: <code className="text-[#FFB238]">/titles</code></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* REGISTERED USERS TAB */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    {/* Top Stat Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-[#FFB238]/10 text-[#FFB238] border border-[#FFB238]/20">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-mono-meta uppercase">Total Registered Users</p>
                          <p className="text-2xl font-bold text-white tracking-tight">{registeredUsers.length}</p>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-mono-meta uppercase">Active Accounts</p>
                          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                            {registeredUsers.filter((u) => u.status === 'Active').length || registeredUsers.length}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-mono-meta uppercase">Firestore Collection</p>
                          <p className="text-sm font-bold text-teal-400 font-mono">/users</p>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar Search Bar */}
                    <div className="p-4 rounded-2xl bg-[#12141D] border border-white/10 flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search users by email or UID..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {registeredUsers.filter((u) =>
                          u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.uid.toLowerCase().includes(userSearchTerm.toLowerCase())
                        ).length}{' '}
                        users found
                      </span>
                    </div>

                    {/* SaaS Data Table / Cards */}
                    <div className="rounded-2xl bg-[#12141D] border border-white/10 overflow-hidden shadow-2xl">
                      {/* MOBILE USER CARDS */}
                      <div className="sm:hidden p-3 space-y-3">
                        {registeredUsers.filter((u) =>
                          u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.uid.toLowerCase().includes(userSearchTerm.toLowerCase())
                        ).length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No registered users found
                          </div>
                        ) : (
                          registeredUsers
                            .filter((u) =>
                              u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              u.uid.toLowerCase().includes(userSearchTerm.toLowerCase())
                            )
                            .map((u) => (
                              <div key={u.uid} className="p-3.5 rounded-xl bg-[#0B0C10] border border-white/10 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238] font-bold flex items-center justify-center uppercase text-xs">
                                      {u.email.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-white text-xs truncate">{u.email.split('@')[0]}</p>
                                      <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    {u.status}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                                  <span className="truncate max-w-[150px] bg-white/5 px-1.5 py-0.5 rounded">UID: {u.uid}</span>
                                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* DESKTOP USER TABLE */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#0B0C10] text-[11px] font-mono-meta text-slate-400 uppercase tracking-wider">
                              <th className="py-3.5 px-4 font-semibold">User</th>
                              <th className="py-3.5 px-4 font-semibold">Email Address</th>
                              <th className="py-3.5 px-4 font-semibold">Firebase UID</th>
                              <th className="py-3.5 px-4 font-semibold">Registered Date</th>
                              <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs">
                            {registeredUsers.filter((u) =>
                              u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              u.uid.toLowerCase().includes(userSearchTerm.toLowerCase())
                            ).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                  <p className="font-semibold text-sm text-slate-300">No registered users found</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    When users sign up on Watch PY, their records appear here in real-time from Firestore.
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              registeredUsers
                                .filter((u) =>
                                  u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                  u.uid.toLowerCase().includes(userSearchTerm.toLowerCase())
                                )
                                .map((u) => (
                                  <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#FFB238]/15 border border-[#FFB238]/30 text-[#FFB238] font-bold flex items-center justify-center uppercase">
                                          {u.email.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-white truncate max-w-[140px]">
                                          {u.email.split('@')[0]}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                                      {u.email}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-slate-400 truncate max-w-[180px] inline-block">
                                        {u.uid}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {u.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPLOAD NEW TITLE TAB (FORM & LIVE PREVIEW) */}
                {activeTab === 'upload' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: UPLOAD FORM (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="p-6 rounded-2xl bg-[#12141D] border border-white/10 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <UploadCloud className="w-5 h-5 text-[#FFB238]" />
                              <span>Publish New Title to Watch PY</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Upload assets to Firebase Storage & save catalog document in Firestore
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-5">
                          {/* Title Name & Tagline */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Title Name *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Cyberpunk Horizon"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-600 outline-none transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Content Type
                              </label>
                              <div className="grid grid-cols-2 gap-2 bg-[#090A0E] p-1 rounded-xl border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => setContentType('movie')}
                                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                    contentType === 'movie'
                                      ? 'bg-[#FFB238] text-[#0A0B0F]'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  Movie
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setContentType('series')}
                                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                    contentType === 'series'
                                      ? 'bg-[#FFB238] text-[#0A0B0F]'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  Series
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Tagline */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Tagline / Hook
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. In the year 2099, memory is the ultimate weapon."
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-600 outline-none transition-colors"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Overview / Synopsis *
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Write a compelling summary of the plot and main characters..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 focus:border-[#FFB238] text-xs text-white placeholder-slate-600 outline-none transition-colors resize-none"
                            />
                          </div>

                          {/* Year, Duration, Age Rating, Primary Genre */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Release Year
                              </label>
                              <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                                className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-white outline-none focus:border-[#FFB238]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-white outline-none focus:border-[#FFB238]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Age Rating
                              </label>
                              <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-white outline-none focus:border-[#FFB238]"
                              >
                                {RATING_OPTIONS.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Primary Genre
                              </label>
                              <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-white outline-none focus:border-[#FFB238]"
                              >
                                {GENRE_OPTIONS.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* FILE DROP ZONES SECTION */}
                          <div className="pt-2 border-t border-white/10 space-y-4">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
                              Media File Uploads
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Poster Image Dropzone */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">
                                  Poster Thumbnail (Image) *
                                </label>
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#090A0E] border-2 border-dashed border-white/15 hover:border-[#FFB238]/50 transition-colors cursor-pointer text-center relative overflow-hidden group">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                  />
                                  {thumbnailPreviewUrl ? (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                                      <img
                                        src={thumbnailPreviewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition-opacity">
                                        Change Image
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2 py-3">
                                      <ImageIcon className="w-7 h-7 text-[#FFB238] mx-auto group-hover:scale-110 transition-transform" />
                                      <p className="text-xs font-medium text-slate-300">
                                        Click or drop poster image
                                      </p>
                                      <p className="text-[10px] text-slate-500">PNG, JPG, WebP</p>
                                    </div>
                                  )}
                                </label>
                              </div>

                              {/* Video File Dropzone */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">
                                  Video Trailer File (MP4/WebM) *
                                </label>
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#090A0E] border-2 border-dashed border-white/15 hover:border-teal-500/50 transition-colors cursor-pointer text-center relative overflow-hidden group">
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm,video/mkv,video/quicktime"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                  />
                                  {videoFile ? (
                                    <div className="py-3 px-2 text-center space-y-1">
                                      <FileVideo className="w-8 h-8 text-teal-400 mx-auto" />
                                      <p className="text-xs font-bold text-white truncate max-w-[180px]">
                                        {videoFile.name}
                                      </p>
                                      <p className="text-[10px] text-teal-300 font-mono">
                                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2 py-3">
                                      <FileVideo className="w-7 h-7 text-teal-400 mx-auto group-hover:scale-110 transition-transform" />
                                      <p className="text-xs font-medium text-slate-300">
                                        Click or drop video clip
                                      </p>
                                      <p className="text-[10px] text-slate-500">MP4, WebM (Max 150MB)</p>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* UPLOADING PROGRESS OVERLAY */}
                          {isUploading && (
                            <div className="p-4 rounded-xl bg-[#090A0E] border border-[#FFB238]/30 space-y-2">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#FFB238] flex items-center gap-1.5">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  {uploadStep}
                                </span>
                                <span className="text-white font-mono">{progressPercent}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-[#FFB238] to-teal-400 rounded-full"
                                  animate={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* SUBMIT BUTTON */}
                          <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full py-3 px-4 rounded-xl bg-[#FFB238] hover:bg-[#ffa312] text-[#0A0B0F] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FFB238]/10 disabled:opacity-50"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Publish Title to Firebase</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: LIVE CARD PREVIEW (5 COLS) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="p-5 rounded-2xl bg-[#12141D] border border-white/10 space-y-4 sticky top-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#FFB238]" />
                            <span>Live Frontend Card Preview</span>
                          </h3>
                          <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
                        </div>

                        {/* PREVIEW MEDIA CARD */}
                        <div className="rounded-2xl bg-[#0B0C10] border border-white/10 overflow-hidden shadow-2xl group">
                          <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                            <img
                              src={
                                thumbnailPreviewUrl ||
                                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'
                              }
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-black/30 to-transparent" />

                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FFB238] text-black shadow">
                                {contentType}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-black/60 backdrop-blur text-white border border-white/10">
                                4K Ultra HD
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 space-y-1">
                              <h4 className="text-base font-extrabold text-white truncate drop-shadow">
                                {title.trim() || 'Untitled Release'}
                              </h4>
                              {tagline && (
                                <p className="text-xs text-amber-300 font-medium truncate drop-shadow">
                                  {tagline}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-emerald-400 font-bold">99% Match</span>
                              <span className="text-slate-400">{year}</span>
                              <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 border border-white/10 text-slate-300 font-mono">
                                {rating}
                              </span>
                              <span className="text-slate-400">{duration}</span>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {description.trim() ||
                                'The title overview description will appear here on the Watch PY platform.'}
                            </p>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                              <span className="text-slate-500 text-[10px]">Genre:</span>
                              <span className="text-slate-300 font-medium">{selectedGenre}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#12141D] border border-white/10 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#FFB238]" />
                            <span>Catalog Analytics & Insights</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Real-time structural breakdown of your Firestore media index
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Genre Distribution Bars */}
                        <div className="p-5 rounded-xl bg-[#090A0E] border border-white/10 space-y-4">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Genre Share Breakdown
                          </h4>
                          <div className="space-y-3">
                            {sortedGenres.map(([gName, count]) => {
                              const pct = Math.round((count / (allTitles.length || 1)) * 100);
                              return (
                                <div key={gName} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-300">{gName}</span>
                                    <span className="text-[#FFB238] font-mono">{count} titles ({pct}%)</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#FFB238] to-teal-400 rounded-full"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Metrics Summary */}
                        <div className="p-5 rounded-xl bg-[#090A0E] border border-white/10 space-y-4">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Content Metrics
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                              <span className="text-slate-400">Total Indexed Documents</span>
                              <span className="text-white font-bold font-mono">{allTitles.length}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                              <span className="text-slate-400">Movie Catalog Count</span>
                              <span className="text-amber-400 font-bold font-mono">{totalMovies}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                              <span className="text-slate-400">Series Catalog Count</span>
                              <span className="text-teal-400 font-bold font-mono">{totalSeries}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                              <span className="text-slate-400">Average Match Rating</span>
                              <span className="text-emerald-400 font-bold font-mono">98.4%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SETTINGS & FIRESTORE TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#12141D] border border-white/10 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-[#FFB238]" />
                            <span>System Settings & Database Config</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Firebase project integration and authentication status
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        {/* Config card 1 */}
                        <div className="p-5 rounded-xl bg-[#090A0E] border border-white/10 space-y-3">
                          <h4 className="font-bold text-white flex items-center gap-2">
                            <Database className="w-4 h-4 text-teal-400" />
                            <span>Firestore Collection Config</span>
                          </h4>
                          <div className="space-y-2 text-slate-300 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                              <span className="text-slate-500">Database ID:</span>
                              <span className="text-teal-300 truncate max-w-[200px]">
                                {(firebaseConfig as any).firestoreDatabaseId || 'ai-studio-watchpy'}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                              <span className="text-slate-500">Project ID:</span>
                              <span className="text-slate-200">{firebaseConfig.projectId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Collection:</span>
                              <span className="text-[#FFB238]">/titles</span>
                            </div>
                          </div>
                        </div>

                        {/* Config card 2 */}
                        <div className="p-5 rounded-xl bg-[#090A0E] border border-white/10 space-y-3">
                          <h4 className="font-bold text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Admin Auth Session Mode</span>
                          </h4>
                          <div className="space-y-2 text-slate-300">
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                              <span className="text-slate-500">Current User:</span>
                              <span className="text-white font-mono">
                                {currentUser ? currentUser.email : 'Quick Admin Session'}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                              <span className="text-slate-500">Status:</span>
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE FIXED BOTTOM NAVIGATION BAR */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E1017]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex items-center justify-around z-40">
                {[
                  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                  { id: 'catalog', label: 'Catalog', icon: Film },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'upload', label: 'Upload', icon: Plus },
                  { id: 'settings', label: 'Settings', icon: SettingsIcon }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                        isActive
                          ? 'text-[#FFB238] bg-[#FFB238]/10 border border-[#FFB238]/20 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFB238]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </main>
          </div>
        )}

        {/* MODAL: EDIT TITLE METADATA */}
        {editingTitle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[#12141D] border border-white/10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#FFB238]" />
                  <span>Edit Metadata: {editingTitle.title}</span>
                </h3>
                <button
                  onClick={() => setEditingTitle(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Title Name</label>
                  <input
                    type="text"
                    value={editingTitle.title}
                    onChange={(e) => setEditingTitle({ ...editingTitle, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white outline-none focus:border-[#FFB238]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingTitle.description}
                    onChange={(e) => setEditingTitle({ ...editingTitle, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white outline-none focus:border-[#FFB238] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={editingTitle.year}
                      onChange={(e) =>
                        setEditingTitle({ ...editingTitle, year: parseInt(e.target.value) || 2026 })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white outline-none focus:border-[#FFB238]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingTitle.duration}
                      onChange={(e) => setEditingTitle({ ...editingTitle, duration: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white outline-none focus:border-[#FFB238]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10 text-xs font-semibold">
                <button
                  onClick={() => setEditingTitle(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl bg-[#FFB238] text-[#0A0B0F] font-bold hover:bg-[#ffa312]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: CONFIRM DELETE TITLE */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#12141D] border border-rose-500/30 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Delete Title Document?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This action will permanently remove this item from your Firestore catalog.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2 text-xs font-semibold">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const t = allTitles.find((x) => x.id === deletingId);
                    handleDeleteTitle(deletingId, t ? t.title : 'Selected Item');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

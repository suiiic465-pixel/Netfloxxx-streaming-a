import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Menu, X, Check, Film, Tv, Sparkles, Bookmark, User, Settings, LogOut, ChevronDown, Shield, Keyboard } from 'lucide-react';
import { ApertureLogo } from './ApertureLogo';
import { UserProfile, AppNotification } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onSelectMediaFromNotification: (mediaId: string) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  myListCount: number;
  onOpenOnboarding?: () => void;
  onOpenAvatarStudio?: () => void;
  onOpenShortcuts?: () => void;
  onOpenAdmin?: () => void;
  isLoggedIn?: boolean;
  userEmail?: string | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  notifications,
  onMarkNotificationRead,
  onSelectMediaFromNotification,
  currentProfile,
  profiles,
  onSelectProfile,
  myListCount,
  onOpenOnboarding,
  onOpenAvatarStudio,
  onOpenShortcuts,
  onOpenAdmin,
  isLoggedIn = false,
  userEmail,
  onOpenAuth,
  onSignOut,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'popular', label: 'New & Popular', icon: Sparkles },
    { id: 'mylist', label: 'My List', icon: Bookmark, badge: myListCount > 0 ? myListCount : undefined },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-nav py-3.5 shadow-2xl shadow-black/80'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-8 lg:gap-10">
          <ApertureLogo
            size="md"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#FFB238] font-semibold bg-white/5 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono-meta font-bold bg-[#FFB238] text-[#0A0B0F] rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#FFB238] to-[#2AC9B0] rounded-full shadow-[0_0_8px_#FFB238]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin Studio Trigger Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-full bg-[#FFB238]/15 hover:bg-[#FFB238]/25 border border-[#FFB238]/40 text-[#FFB238] font-mono-meta text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(255,178,56,0.2)] focus:outline-none"
              title="Open Watch PY Admin Studio"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Studio</span>
            </button>
          )}

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative group focus:outline-none focus:ring-2 focus:ring-[#FFB238]/50"
            title="Search Movies & Series (S or Ctrl + K)"
            aria-label="Search"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform text-[#FFB238]" />
            <span className="hidden xl:inline-block text-xs text-slate-400 font-mono-meta ml-1.5 pl-1.5 border-l border-white/10">
              ⌘K
            </span>
          </button>

          {/* Keyboard Shortcuts Guide Trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative group focus:outline-none focus:ring-2 focus:ring-[#2AC9B0]/50"
              title="Keyboard Shortcuts Guide (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5 text-[#2AC9B0] group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#FFB238]/50"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 hover:text-[#FFB238] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FFB238] rounded-full ring-2 ring-[#0A0B0F] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#FFB238]" />
                      <h3 className="font-semibold text-sm text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-mono-meta font-bold bg-[#FFB238]/20 text-[#FFB238] border border-[#FFB238]/30 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => notifications.forEach((n) => onMarkNotificationRead(n.id))}
                        className="text-xs text-slate-400 hover:text-[#FFB238] transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            if (n.mediaId) {
                              onSelectMediaFromNotification(n.mediaId);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${
                            !n.read ? 'bg-[#FFB238]/5 border-l-2 border-[#FFB238]' : ''
                          }`}
                        >
                          {n.thumbnail ? (
                            <img
                              src={n.thumbnail}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-12 h-16 object-cover rounded-lg flex-shrink-0 shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#FFB238]/10 text-[#FFB238] flex items-center justify-center flex-shrink-0">
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                              <span className="text-[10px] text-slate-400 font-mono-meta">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons or Profile Menu Dropdown */}
          {!isLoggedIn && onOpenAuth ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 rounded-full bg-[#FFB238] hover:bg-[#ffa312] text-[#0A0B0F] font-bold text-xs shadow-[0_0_15px_rgba(255,178,56,0.25)] transition-all transform hover:scale-[1.02]"
              >
                Sign Up
              </button>
            </div>
          ) : (
            /* Profile Menu Dropdown */
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFB238]/50"
              >
                <div className="relative">
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFB238]/60 shadow-lg"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2AC9B0] rounded-full ring-2 ring-[#0A0B0F]" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Switcher Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl shadow-2xl p-2 z-50 border border-white/10"
                  >
                    <div className="p-3 border-b border-white/10 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-semibold text-sm text-white truncate">{userEmail || currentProfile.name}</p>
                    </div>

                    <p className="px-3 py-1 text-[11px] font-mono-meta text-[#FFB238] uppercase tracking-wider font-semibold">
                      Switch Profile
                    </p>

                    <div className="space-y-1 mb-2">
                      {profiles.map((p) => {
                        const isSelected = p.id === currentProfile.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectProfile(p);
                              setShowProfileMenu(false);
                            }}
                            className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                              isSelected
                                ? 'bg-[#FFB238]/15 text-[#FFB238] font-semibold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <span>{p.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#FFB238]" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1">
                      {onOpenAvatarStudio && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAvatarStudio();
                          }}
                          className="w-full px-3 py-2 text-xs text-[#2AC9B0] font-bold hover:bg-[#2AC9B0]/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-[#2AC9B0]" />
                          Cinematic Avatar Studio
                        </button>
                      )}
                      {onOpenShortcuts && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenShortcuts();
                          }}
                          className="w-full px-3 py-2 text-xs text-[#2AC9B0] font-bold hover:bg-[#2AC9B0]/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Keyboard className="w-4 h-4 text-[#2AC9B0]" />
                          Keyboard Shortcuts Guide
                        </button>
                      )}
                      {onOpenAdmin && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-3 py-2 text-xs text-[#FFB238] font-bold hover:bg-[#FFB238]/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#FFB238]" />
                          Admin Panel Studio
                        </button>
                      )}
                      {onOpenOnboarding && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenOnboarding();
                          }}
                          className="w-full px-3 py-2 text-xs text-slate-300 font-bold hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Edit Profile & Avatar
                        </button>
                      )}
                      <button
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Stream Preferences
                      </button>
                      {onSignOut && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSignOut();
                          }}
                          className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-[#FFB238]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-nav border-t border-white/10 px-6 py-6 space-y-3 overflow-hidden"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#FFB238]/15 text-[#FFB238] font-bold border border-[#FFB238]/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFB238]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-mono-meta font-bold bg-[#FFB238] text-[#0A0B0F] rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

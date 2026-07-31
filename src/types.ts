export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  progressPercentage?: number;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  year: number;
  duration: string; // e.g. "2h 14m" or "3 Seasons"
  rating: string; // e.g. "98% Match"
  ageRating: 'G' | 'PG' | 'PG-13' | 'TV-MA' | 'R' | '16+';
  resolution: '4K Ultra HD' | 'HDR10+' | 'Dolby Vision' | 'HD';
  genres: string[];
  description: string;
  tagline?: string;
  backdropUrl: string;
  posterUrl: string;
  trailerVideoUrl?: string; // sample MP4 or video source
  director?: string;
  cast: string[];
  isTrending?: boolean;
  isNewRelease?: boolean;
  isTop10?: boolean;
  top10Rank?: number;
  progressPercentage?: number; // for Continue Watching
  continueRemaining?: string; // e.g. "28m left"
  seasons?: Season[];
}

export interface HeroSlide {
  id: string;
  mediaId: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  backdropUrl: string;
  posterUrl: string;
  genres: string[];
  year: number;
  duration: string;
  rating: string;
  ageRating: 'G' | 'PG' | 'PG-13' | 'TV-MA' | 'R' | '16+';
  audioFormat: string; // e.g. "Dolby Atmos 5.1"
  trailerVideoUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  mediaId?: string;
  thumbnail?: string;
}

export type BackgroundMotionStyle =
  | 'cinematic-particles'
  | 'aurora-glow'
  | 'anamorphic-flares'
  | 'cosmic-constellation'
  | 'pure-minimal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface AccessOption {
  id: string;
  label: string; // e.g. "4K Ultra-HD", "1080p Full HD", "720p HD", "480p SD"
  url: string;   // authorized stream / direct playback URL
  buttonText: string; // e.g. "Direct Server 1", "Watch Fast Stream"
  order: number;
  enabled: boolean;
  fileSize?: string; // e.g. "3.8 GB", "1.9 GB", "850 MB"
  qualityBadge?: string; // e.g. "4K HDR", "1080p", "720p"
  downloadUrl?: string; // direct download link
  downloadButtonText?: string; // e.g. "Instant Download"
}

export interface HowToAccessStep {
  stepNumber: number;
  title: string;
  description: string;
  iconName?: string;
}

export interface TutorialVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  genres: string[]; // array of genre names or slugs
  tags: string[];   // array of tag strings
  releaseDate: string; // e.g. "2026", "2025-11-14"
  duration?: string;   // e.g. "2h 18m", "Season 1 (8 Episodes)"
  rating?: string;     // e.g. "IMDb 8.9", "PG-13", "TV-MA"
  language?: string;   // e.g. "English (Dual Audio)", "Hindi + English", "Original Audio"
  director?: string;
  cast?: string[];
  featured: boolean;
  status: 'published' | 'draft';
  trailerUrl?: string;
  views: number;
  dbSource?: string;   // tracking which database stored this item in multi-db setup

  // Tutorial fields
  tutorialTitle?: string;
  tutorialUrl?: string;
  tutorialThumbnail?: string;
  tutorialVideos?: TutorialVideo[];

  // How to access instructions
  howToAccessTitle?: string;
  howToAccessInstructions?: string;
  howToAccessSteps?: HowToAccessStep[];

  // Access options (Multiple qualities & download links)
  accessOptions: AccessOption[];

  createdAt: string;
  updatedAt: string;
}

export interface CustomNavLink {
  id: string;
  label: string;
  title?: string;
  url: string;
  order: number;
  targetBlank?: boolean;
  newTab?: boolean;
  enabled: boolean;
}

export type PopupType = 'announcement' | 'promotion' | 'update' | 'warning' | 'custom';
export type PopupPosition = 'center' | 'top' | 'bottom';
export type PopupFrequency = 'every_visit' | 'once_per_session' | 'once_per_browser';
export type PopupShowOn = 'all' | 'home_only' | 'specific_pages';

export interface Popup {
  id: string;
  title: string;
  message: string;
  content?: string;
  btn1Text?: string;
  btn1Url?: string;
  btn1Enabled: boolean;
  buttonText?: string;
  buttonUrl?: string;
  btn2Text?: string;
  btn2Url?: string;
  btn2Enabled?: boolean;
  bgImageUrl?: string;
  imageUrl?: string;
  type: PopupType | string;
  position?: PopupPosition;
  frequency?: PopupFrequency;
  delaySeconds?: number;
  displayDelaySeconds?: number;
  showOn?: PopupShowOn;
  pagePaths?: string;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
  isActive?: boolean;
  priority?: number;
  showCloseBtn?: boolean;
  showOverlay?: boolean;
  closeOnOverlay?: boolean;
  cooldownEnabled?: boolean;
  cooldownHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  // Brand & Identity
  siteName: string;
  siteTagline?: string;
  logoText: string;
  logoPrefixText?: string;
  logoHighlightText?: string;
  logoSuffixText?: string;
  logoSubtext?: string;
  logoUrl?: string;
  faviconUrl?: string;
  siteDescription: string;

  // Background Motion Effect (Admin Selected)
  backgroundStyle: BackgroundMotionStyle;

  // Telegram Integration (Pure Telegram, No Email)
  telegramUrl: string;             // Main channel link (e.g. https://t.me/skxmovies_channel)
  telegramChannel: string;         // Channel handle (e.g. @skxmovies_official)
  telegramGroup?: string;          // Community discussion group (e.g. https://t.me/skxmovies_group)
  telegramBotUsername?: string;    // Support / Request Bot (e.g. @skxmovies_bot)
  telegramJoinBtnText?: string;    // e.g. "Join Telegram Channel"
  telegramSupportNotice?: string;  // e.g. "Join our Telegram community for instant download mirrors, release alerts, and requests."

  // Global Popup Master Switch
  enablePopups?: boolean;
  popupsEnabled?: boolean;

  // SEO & Metadata
  seoTitle: string;
  metaTitle?: string;
  seoDescription: string;
  metaDescription?: string;
  seoKeywords?: string;
  metaKeywords?: string;
  seoAuthor?: string;
  ogImageUrl?: string;

  // Header & Navigation
  navHomeLabel?: string;
  navCategoriesLabel?: string;
  navGenresLabel?: string;
  navAboutLabel?: string;
  navSupportLabel?: string;
  navSearchPlaceholder?: string;
  navSearchBtnText?: string;
  customNavLinks?: CustomNavLink[];
  headerNoticeText?: string;

  // Announcement Banner
  announcementText?: string;
  announcementActive?: boolean;
  announcementEnabled?: boolean;
  announcementLink?: string;
  announcementLinkText?: string;

  // Homepage Content & Titles
  heroBadgeText?: string;
  heroWatchBtnText?: string;
  heroTrailerBtnText?: string;
  heroHowToAccessBtnText?: string;
  homeCategoriesTitle?: string;
  homeCategoriesSubtitle?: string;
  homeCategoriesViewAllText?: string;
  homeLatestTitle?: string;
  homeLatestSubtitle?: string;
  homeLatestExploreBtnText?: string;
  homeTrendingTitle?: string;
  homeTrendingSubtitle?: string;
  homeGenresTitle?: string;
  homeGenresSubtitle?: string;
  homeGenresViewAllText?: string;

  // Homepage Custom Banner (Telegram community focus)
  homeBannerActive?: boolean;
  homeBannerTitle?: string;
  homeBannerText?: string;
  homeBannerBtnText?: string;
  homeBannerBtnUrl?: string;

  // Content Details & Playback
  accessSectionBadge?: string;
  accessSectionTitle?: string;
  accessSectionSubtitle?: string;
  accessDefaultBtnText?: string;
  accessNoticeText?: string;
  howToAccessDefaultTitle?: string;
  howToAccessDefaultInstructions?: string;
  tutorialDefaultTitle?: string;
  backToLibraryText?: string;
  shareBtnText?: string;

  // Search & Filter Labels
  searchPageTitle?: string;
  searchPageSubtitle?: string;
  searchPlaceholder?: string;
  searchFilterLabel?: string;
  searchAllCategoriesText?: string;
  searchAllGenresText?: string;
  searchSortLatestText?: string;
  searchSortViewsText?: string;
  searchSortAlphabeticalText?: string;
  searchResetBtnText?: string;
  searchEmptyTitle?: string;
  searchEmptyDescription?: string;

  // Footer
  footerBio?: string;
  footerText: string;
  footerRightsNotice?: string;
  footerSubText?: string;

  // Custom Pages Content
  aboutTitle?: string;
  aboutHeroHeading?: string;
  aboutHeroText?: string;
  aboutPageContent?: string;
  supportPageTitle?: string;
  supportPageSubtitle?: string;
  supportPageNotice?: string;
  dmcaPageTitle?: string;
  dmcaPageSubtitle?: string;
  dmcaNoticeText?: string;
  privacyPageContent?: string;
  termsPageContent?: string;

  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  createdAt: string;
}

export interface MultiDbStatus {
  connectedDatabases: number;
  activeDatabaseIndex: number;
  activeDatabaseName: string;
  allDatabases: {
    index: number;
    name: string;
    isWriteActive: boolean;
    status: 'connected' | 'unreachable' | 'simulated';
  }[];
}

export interface AdminStats {
  totalContent: number;
  published: number;
  drafts: number;
  totalCategories: number;
  totalGenres: number;
  totalTags: number;
  totalViews: number;
  activePopups?: number;
  dbStatus: MultiDbStatus;
  recentContent: ContentItem[];
}

export interface SearchFilterParams {
  q?: string;
  query?: string;
  search?: string;
  category?: string;
  categoryId?: string;
  categorySlug?: string;
  genre?: string;
  genreId?: string;
  genreSlug?: string;
  tag?: string;
  year?: string;
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'title' | 'releaseDate' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

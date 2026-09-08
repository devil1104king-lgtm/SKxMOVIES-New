import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { api } from '../lib/api';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'SKxMOVIES',
  siteTagline: 'Pure Cinematic Streaming & High-Speed Media Portal',
  logoText: 'SKxMOVIES',
  logoPrefixText: 'SK',
  logoHighlightText: 'x',
  logoSuffixText: 'MOVIES',
  logoSubtext: 'CINEMA HUB',
  siteDescription: 'Stream and explore high-definition movies and series. Pure black dark aesthetic with zero ad spam.',
  backgroundStyle: 'cinematic-particles',

  telegramUrl: 'https://t.me/skxmovies_official',
  telegramChannel: '@skxmovies_official',
  telegramGroup: 'https://t.me/skxmovies_community',
  telegramBotUsername: '@skxmovies_bot',
  telegramJoinBtnText: 'Join Telegram Channel',
  telegramSupportNotice: 'Join our official Telegram community for instant direct links, audio sync updates, download mirrors, and fast movie requests.',

  enablePopups: true,
  popupsEnabled: true,

  seoTitle: 'SKxMOVIES - Premium High-Def Movies & Web Series',
  metaTitle: 'SKxMOVIES - Watch & Download Cinema in 4K, 1080p',
  seoDescription: 'Stream and download full-length movies, web series, and indie gems with multi-quality fast servers and instant Telegram alerts.',

  navHomeLabel: 'Home',
  navCategoriesLabel: 'Categories',
  navGenresLabel: 'Genres',
  navAboutLabel: 'About',
  navSupportLabel: 'Telegram Support',
  navSearchPlaceholder: 'Search titles, genres, 4K...',
  navSearchBtnText: 'Search',
  headerNoticeText: '🔥 New 4K HDR streams added daily • Join Telegram for fastest updates',

  announcementActive: true,
  announcementEnabled: true,
  announcementText: '🚀 Official Telegram Channel is live! Join now for instant streaming mirrors and requested releases.',
  announcementLink: 'https://t.me/skxmovies_official',
  announcementLinkText: 'Join Channel',

  heroBadgeText: 'FEATURED CINEMA PREMIERE',
  heroWatchBtnText: 'Stream Now',
  heroTrailerBtnText: 'Watch Trailer',
  heroHowToAccessBtnText: 'How to Access',

  homeCategoriesTitle: 'Explore Categories',
  homeCategoriesSubtitle: 'Handcrafted collections across every dimension of cinema',
  homeCategoriesViewAllText: 'View All Categories',

  homeLatestTitle: 'Latest Additions',
  homeLatestSubtitle: 'Recently added cinematic releases and high-bitrate mirrors',
  homeLatestExploreBtnText: 'Explore All',

  homeTrendingTitle: 'Trending Today',
  homeTrendingSubtitle: 'The most watched and requested titles by our community',

  homeGenresTitle: 'Browse by Genre',
  homeGenresSubtitle: 'Find your exact vibe from cyberpunk neon to deep sci-fi thrillers',
  homeGenresViewAllText: 'Browse All Genres',

  homeBannerActive: true,
  homeBannerTitle: 'Never Miss a Premiere — Join Our Telegram',
  homeBannerText: 'Get instant notifications the second a new 4K or 1080p release drops. Request custom titles directly through our Telegram bot.',
  homeBannerBtnText: 'Join @skxmovies_official',
  homeBannerBtnUrl: 'https://t.me/skxmovies_official',

  accessSectionBadge: 'AUTHORIZED PLAYBACK & DOWNLOAD',
  accessSectionTitle: 'Stream & Download Servers',
  accessSectionSubtitle: 'Select your preferred visual fidelity and high-speed delivery mirror',
  accessDefaultBtnText: 'Direct Watch Stream',
  accessNoticeText: 'Notice: If a streaming mirror buffers, switch to an alternative server or use the direct download option.',

  howToAccessDefaultTitle: 'How to Watch & Download',
  howToAccessDefaultInstructions: 'Follow these quick steps to watch or download in ultra-high definition without ad interruptions.',

  tutorialDefaultTitle: 'Video Walkthrough & Tips',
  backToLibraryText: 'Back to Library',
  shareBtnText: 'Share Movie',

  searchPageTitle: 'Search Cinema Vault',
  searchPageSubtitle: 'Filter through our multi-database library by title, genre, year, and visual quality',
  searchPlaceholder: 'Search by title, actor, director or keyword...',
  searchFilterLabel: 'Filters',
  searchAllCategoriesText: 'All Categories',
  searchAllGenresText: 'All Genres',
  searchSortLatestText: 'Recently Added',
  searchSortViewsText: 'Most Popular',
  searchSortAlphabeticalText: 'Alphabetical (A-Z)',
  searchResetBtnText: 'Reset Filters',
  searchEmptyTitle: 'No Titles Found',
  searchEmptyDescription: 'Try adjusting your search query or removing some filters to find what you are looking for.',

  footerBio: 'SKxMOVIES is an ultra-fast, ad-free cinema indexing portal providing high-definition streaming links and direct download mirrors.',
  footerText: '© 2026 SKxMOVIES. All rights reserved. Pure cinema experience.',
  footerRightsNotice: 'All media links and video streams indexed on this portal are hosted on external third-party servers. We do not host copyrighted files on our infrastructure.',
  footerSubText: 'Official Community on Telegram',

  aboutTitle: 'About SKxMOVIES',
  aboutHeroHeading: 'Redefining Cinema Access with Speed & Purity',
  aboutHeroText: 'SKxMOVIES was engineered to eliminate bloated ads, clunky email support, and slow loading times. We deliver instantaneous streaming links, pristine 4K video feeds, and direct Telegram community support.',
  aboutPageContent: 'SKxMOVIES is an enthusiast-run cinema archive designed from the ground up for movie lovers who value clean aesthetics, instant access, and high visual fidelity.',

  supportPageTitle: 'Community & Telegram Support',
  supportPageSubtitle: 'Direct, instant assistance and title requests via Telegram. No slow email forms.',
  supportPageNotice: 'Need a specific title re-uploaded? Found a broken stream link? Contact our moderators directly through our Telegram Channel or Support Bot for instant resolution.',

  dmcaPageTitle: 'DMCA & Content Disclaimer',
  dmcaPageSubtitle: 'Copyright policy, third-party hosting notice, and takedown procedures',
  dmcaNoticeText: 'SKxMOVIES operates as an automated index and directory of media content freely available on the public internet.',

  privacyPageContent: 'Your privacy is paramount. SKxMOVIES does not require user registration for viewing content, does not log personal information, and does not sell browsing data to advertising brokers.',
  termsPageContent: 'By using SKxMOVIES, you acknowledge that all video embeds and links are provided for informational and indexing purposes.',

  updatedAt: new Date().toISOString()
};

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SiteSettings>) => Promise<SiteSettings>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refreshSettings: async () => {},
  updateSettings: async () => DEFAULT_SETTINGS
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && data.siteName) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Failed to fetch settings, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await api.updateSettings(updates);
    setSettings(res);
    return res;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings: loadSettings,
        updateSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

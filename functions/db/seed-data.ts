import { Category, Genre, Tag, ContentItem, Popup, SiteSettings } from '../../src/types';

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'SKxMOVIES',
  siteTagline: 'Pure Cinematic Streaming & High-Speed Media Portal',
  logoText: 'SKxMOVIES',
  logoPrefixText: 'SK',
  logoHighlightText: 'x',
  logoSuffixText: 'MOVIES',
  logoSubtext: 'CINEMA HUB',
  siteDescription: 'Stream and explore high-definition movies, serialized web epics, and cinematic festival shorts. Pure black dark aesthetic with zero pop-up ad spam.',
  backgroundStyle: 'cinematic-particles', // default cinematic style

  // Telegram Integration
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
  seoKeywords: 'movies, streaming, 4k ultra hd, web series, direct watch, skxmovies, telegram movies',
  seoAuthor: 'SKxMOVIES Team',
  ogImageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',

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

  footerBio: 'SKxMOVIES is an ultra-fast, ad-free cinema indexing portal providing high-definition streaming links and direct download mirrors. Powered by CockroachDB and Cloudflare Edge.',
  footerText: '© 2026 SKxMOVIES. All rights reserved. Pure cinema experience.',
  footerRightsNotice: 'All media links and video streams indexed on this portal are hosted on external third-party servers. We do not host copyrighted files on our infrastructure.',
  footerSubText: 'Official Community on Telegram',

  aboutTitle: 'About SKxMOVIES',
  aboutHeroHeading: 'Redefining Cinema Access with Speed & Purity',
  aboutHeroText: 'SKxMOVIES was engineered to eliminate bloated ads, clunky email support, and slow loading times. We deliver instantaneous streaming links, pristine 4K video feeds, and direct Telegram community support.',
  aboutPageContent: 'SKxMOVIES is an enthusiast-run cinema archive designed from the ground up for movie lovers who value clean aesthetics, instant access, and high visual fidelity. Built with modern edge serverless architecture and multi-cluster database partitioning, SKxMOVIES provides lightning-fast page loads and zero buffering.',

  supportPageTitle: 'Community & Telegram Support',
  supportPageSubtitle: 'Direct, instant assistance and title requests via Telegram. No slow email forms.',
  supportPageNotice: 'Need a specific title re-uploaded? Found a broken stream link? Contact our moderators directly through our Telegram Channel or Support Bot for instant resolution.',

  dmcaPageTitle: 'DMCA & Content Disclaimer',
  dmcaPageSubtitle: 'Copyright policy, third-party hosting notice, and takedown procedures',
  dmcaNoticeText: 'SKxMOVIES operates as an automated index and directory of media content freely available on the public internet. We do not upload or store any video files, media streams, or digital assets on our server infrastructure. All trademarks and media belong to their respective owners.',

  privacyPageContent: 'Your privacy is paramount. SKxMOVIES does not require user registration for viewing content, does not log personal information, and does not sell browsing data to advertising brokers.',
  termsPageContent: 'By using SKxMOVIES, you acknowledge that all video embeds and links are provided for informational and indexing purposes. Users are responsible for complying with local regulations regarding digital media.',

  updatedAt: new Date().toISOString()
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-movies',
    name: 'Feature Movies',
    slug: 'movies',
    description: 'Full-length cinematic blockbuster epics, indie masterpieces, and international festival films.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-series',
    name: 'Web Series',
    slug: 'web-series',
    description: 'Binge-worthy original serialized episodic sagas, sci-fi series, and dramatic multi-part chronicles.',
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-short-films',
    name: 'Short Films',
    slug: 'short-films',
    description: 'Award-winning festival shorts, thought-provoking micro-dramas, and high-concept sci-fi stories.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-animation',
    name: 'Animation & Anime',
    slug: 'animation',
    description: 'Breathtaking 3D CGI spectacles, cyberpunk anime series, and visual masterpieces.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-documentary',
    name: 'Documentaries',
    slug: 'documentaries',
    description: 'Insightful deep dives into deep space cosmology, technology revolutions, and human frontiers.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_GENRES: Genre[] = [
  { id: 'gen-scifi', name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic, speculative, space and cyberpunk narratives', createdAt: new Date().toISOString() },
  { id: 'gen-action', name: 'Action', slug: 'action', description: 'High-octane choreography and thrilling set-pieces', createdAt: new Date().toISOString() },
  { id: 'gen-thriller', name: 'Thriller', slug: 'thriller', description: 'Tense, psychological, and suspenseful narratives', createdAt: new Date().toISOString() },
  { id: 'gen-cyberpunk', name: 'Cyberpunk', slug: 'cyberpunk', description: 'High tech, neon noir, and low life in mega-cities', createdAt: new Date().toISOString() },
  { id: 'gen-fantasy', name: 'Dark Fantasy', slug: 'dark-fantasy', description: 'Mythic realms, ancient lore, and grim heroes', createdAt: new Date().toISOString() },
  { id: 'gen-drama', name: 'Drama', slug: 'drama', description: 'Character-driven emotional depth and conflict', createdAt: new Date().toISOString() },
  { id: 'gen-mystery', name: 'Mystery', slug: 'mystery', description: 'Cryptic enigmas and investigative journeys', createdAt: new Date().toISOString() }
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-4k', name: '4K Ultra HD', slug: '4k-ultra-hd', createdAt: new Date().toISOString() },
  { id: 'tag-hdr', name: 'HDR10+', slug: 'hdr10', createdAt: new Date().toISOString() },
  { id: 'tag-dolby', name: 'Dolby Atmos', slug: 'dolby-atmos', createdAt: new Date().toISOString() },
  { id: 'tag-original', name: 'SKx Original', slug: 'skx-original', createdAt: new Date().toISOString() },
  { id: 'tag-trending', name: 'Trending', slug: 'trending', createdAt: new Date().toISOString() },
  { id: 'tag-dual', name: 'Dual Audio', slug: 'dual-audio', createdAt: new Date().toISOString() }
];

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'mov-cyberpunk-2099',
    title: 'Neon Odyssey: 2099',
    slug: 'neon-odyssey-2099',
    description: 'In a rain-slicked mega-metropolis governed by rogue neural synthetic networks, a retired memory hunter is pulled back into the underworld to retrieve an unauthorized human consciousness before the city grid executes a total digital purge.',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'cat-movies',
    categoryName: 'Feature Movies',
    categorySlug: 'movies',
    genres: ['Sci-Fi', 'Cyberpunk', 'Action'],
    tags: ['4K Ultra HD', 'HDR10+', 'Dolby Atmos', 'Trending'],
    releaseDate: '2026',
    duration: '2h 24m',
    rating: 'IMDb 8.9',
    language: 'English (Dual Audio + Subs)',
    featured: true,
    status: 'published',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 14820,
    dbSource: 'DATABASE_URL',
    howToAccessTitle: 'Instant Streaming & Download Guide',
    howToAccessInstructions: 'Choose between high-bitrate direct browser playback or fast single-click download via our encrypted Telegram mirror links.',
    howToAccessSteps: [
      { stepNumber: 1, title: 'Choose Server Quality', description: 'Select 4K Ultra HD for home theater displays or 1080p for mobile streaming.' },
      { stepNumber: 2, title: 'Launch Fast Player', description: 'Click Watch Stream to open the responsive HTML5 video stream.' },
      { stepNumber: 3, title: 'Save for Offline', description: 'Use the Download button to grab high-speed mirrors with pause-resume capability.' }
    ],
    accessOptions: [
      {
        id: 'opt-4k',
        label: '4K Ultra-HD (2160p HDR)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        buttonText: 'Stream 4K Server 1 (Ultra Fast)',
        order: 1,
        enabled: true,
        fileSize: '4.2 GB',
        qualityBadge: '4K HDR',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        downloadButtonText: 'Download 4K HDR (4.2 GB)'
      },
      {
        id: 'opt-1080p',
        label: '1080p Full HD (Original Audio)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        buttonText: 'Stream 1080p Server 2',
        order: 2,
        enabled: true,
        fileSize: '1.8 GB',
        qualityBadge: '1080p FHD',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        downloadButtonText: 'Download 1080p (1.8 GB)'
      },
      {
        id: 'opt-720p',
        label: '720p HD (Mobile Optimized)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        buttonText: 'Stream 720p Mobile Server',
        order: 3,
        enabled: true,
        fileSize: '780 MB',
        qualityBadge: '720p HD',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        downloadButtonText: 'Download 720p (780 MB)'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mov-stellar-horizon',
    title: 'Stellar Horizon: Genesis',
    slug: 'stellar-horizon-genesis',
    description: 'When an interstellar anomaly opens at the perimeter of the Kuiper Belt, an international deep-voyage expedition sets out on a multi-generational mission to decipher an ancient quantum beacon.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'cat-movies',
    categoryName: 'Feature Movies',
    categorySlug: 'movies',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    tags: ['4K Ultra HD', 'Dolby Atmos', 'Trending'],
    releaseDate: '2025',
    duration: '2h 38m',
    rating: 'IMDb 8.7',
    language: 'English (Original Audio)',
    featured: true,
    status: 'published',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 12450,
    dbSource: 'DATABASE_URL',
    howToAccessTitle: 'Playback Instructions',
    howToAccessInstructions: 'Watch online directly through your browser or download using the links below.',
    accessOptions: [
      {
        id: 'sh-4k',
        label: '4K Ultra-HD (Master Audio)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        buttonText: 'Stream 4K Master',
        order: 1,
        enabled: true,
        fileSize: '5.1 GB',
        qualityBadge: '4K UHD',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        downloadButtonText: 'Download 4K Master (5.1 GB)'
      },
      {
        id: 'sh-1080p',
        label: '1080p FHD (Dual Audio)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        buttonText: 'Stream 1080p Mirror',
        order: 2,
        enabled: true,
        fileSize: '2.1 GB',
        qualityBadge: '1080p',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        downloadButtonText: 'Download 1080p (2.1 GB)'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ser-quantum-protocol',
    title: 'The Quantum Protocol',
    slug: 'the-quantum-protocol',
    description: 'A subterranean research bunker disappears from international satellite tracking. A team of tactical investigators discovers that the physicists breached temporal synchronization.',
    posterUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'cat-series',
    categoryName: 'Web Series',
    categorySlug: 'web-series',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    tags: ['4K Ultra HD', 'HDR10+', 'SKx Original'],
    releaseDate: '2026',
    duration: 'Season 1 (8 Episodes)',
    rating: 'IMDb 9.1',
    language: 'English (Dual Audio)',
    featured: true,
    status: 'published',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 9870,
    dbSource: 'DATABASE_URL',
    accessOptions: [
      {
        id: 'qp-1080p',
        label: 'Full Season 1 Batch (1080p FHD)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        buttonText: 'Watch Episode 1',
        order: 1,
        enabled: true,
        fileSize: '6.4 GB (Zip)',
        qualityBadge: '1080p Batch',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        downloadButtonText: 'Download Complete Season (6.4 GB)'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mov-shadow-blade',
    title: 'Shadow Blade: Ronin 2088',
    slug: 'shadow-blade-ronin-2088',
    description: 'A cybernetically enhanced ronin traverses the war-torn sectors of Neo-Kanto to avenge his fallen clan against an autonomous drone syndicate.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'cat-movies',
    categoryName: 'Feature Movies',
    categorySlug: 'movies',
    genres: ['Action', 'Cyberpunk'],
    tags: ['4K Ultra HD', 'Trending'],
    releaseDate: '2025',
    duration: '1h 56m',
    rating: 'IMDb 8.4',
    language: 'Japanese + English Subs',
    featured: false,
    status: 'published',
    views: 8430,
    dbSource: 'DATABASE_URL',
    accessOptions: [
      {
        id: 'sb-1080p',
        label: '1080p Full HD',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        buttonText: 'Stream 1080p',
        order: 1,
        enabled: true,
        fileSize: '1.9 GB',
        qualityBadge: '1080p',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        downloadButtonText: 'Download 1080p (1.9 GB)'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mov-solar-flare',
    title: 'Solar Flare: Deep Freeze',
    slug: 'solar-flare-deep-freeze',
    description: 'When an unexpected coronal mass ejection disables the global electrical grid during peak winter, a family in the Rocky Mountains must survive freezing isolation.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'cat-movies',
    categoryName: 'Feature Movies',
    categorySlug: 'movies',
    genres: ['Thriller', 'Drama'],
    tags: ['1080p', 'Dual Audio'],
    releaseDate: '2025',
    duration: '1h 48m',
    rating: 'IMDb 8.1',
    language: 'English (Original)',
    featured: false,
    status: 'published',
    views: 6510,
    dbSource: 'DATABASE_URL',
    accessOptions: [
      {
        id: 'sf-1080p',
        label: '1080p FHD Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        buttonText: 'Stream Now',
        order: 1,
        enabled: true,
        fileSize: '1.6 GB',
        qualityBadge: '1080p',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        downloadButtonText: 'Download 1080p (1.6 GB)'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_POPUPS: Popup[] = [
  {
    id: 'pop-telegram-community',
    title: 'Join Our Official Telegram Channel 🚀',
    message: 'Never lose access! Get instant notifications when new 4K releases drop, request movies directly, and access high-speed backup mirror links.',
    btn1Text: 'Join Telegram Channel',
    btn1Url: 'https://t.me/skxmovies_official',
    btn1Enabled: true,
    btn2Text: 'Remind Me Later',
    btn2Url: '',
    btn2Enabled: true,
    bgImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    type: 'announcement',
    position: 'center',
    frequency: 'once_per_session',
    delaySeconds: 3,
    showOn: 'all',
    active: true,
    priority: 1,
    showCloseBtn: true,
    showOverlay: true,
    closeOnOverlay: true,
    cooldownEnabled: true,
    cooldownHours: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

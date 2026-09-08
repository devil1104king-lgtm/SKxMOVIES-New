import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { ContentGrid } from '../components/content/ContentGrid';
import { TelegramBannerCard } from '../components/common/TelegramBadge';
import { ContentItem, Category, Genre } from '../types';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { Film, TrendingUp, Sparkles, Compass, Layers, ArrowRight, Send } from 'lucide-react';

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState<ContentItem[]>([]);
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [latest, setLatest] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await api.getHomepage();
        setFeatured(data.featured || []);
        setTrending(data.trending || []);
        setLatest(data.latest || []);
        setCategories(data.categories || []);
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Error fetching homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div id="home-page" className="space-y-16 pb-12">
      {/* Cinematic Hero Premiere Banner */}
      <HeroBanner
        featuredItems={featured.length > 0 ? featured : latest.slice(0, 3)}
        navigate={navigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Telegram Community Banner */}
        <TelegramBannerCard />

        {/* Latest Cinematic Releases Section */}
        <section id="home-latest-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Fresh Drops</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {settings.homeLatestTitle || 'Latest Additions'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {settings.homeLatestSubtitle || 'Recently indexed 4K and 1080p high-bitrate streaming releases'}
              </p>
            </div>

            <button
              id="home-explore-latest-btn"
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
            >
              <span>{settings.homeLatestExploreBtnText || 'Explore All Vault'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ContentGrid
            items={latest}
            isLoading={loading}
            onItemClick={item => navigate(`/content/${item.slug}`)}
          />
        </section>

        {/* Trending Cinema Section */}
        {trending.length > 0 && (
          <section id="home-trending-section" className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Most Watched</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {settings.homeTrendingTitle || 'Trending Today'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {settings.homeTrendingSubtitle || 'Community top picks and highly requested mirrors'}
                </p>
              </div>
            </div>

            <ContentGrid
              items={trending}
              isLoading={loading}
              onItemClick={item => navigate(`/content/${item.slug}`)}
            />
          </section>
        )}

        {/* Browse by Categories Section */}
        {categories.length > 0 && (
          <section id="home-categories-section" className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Collections</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {settings.homeCategoriesTitle || 'Explore Categories'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {settings.homeCategoriesSubtitle || 'Handcrafted collections across every dimension of cinema'}
                </p>
              </div>

              <button
                id="home-view-all-cats-btn"
                onClick={() => navigate('/categories')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                {settings.homeCategoriesViewAllText || 'View All Categories →'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  id={`cat-card-${cat.slug}`}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 p-5 hover:border-amber-500/40 hover:bg-zinc-900/60 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                    <Film className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Genres Chips */}
        {genres.length > 0 && (
          <section id="home-genres-section" className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Discover</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {settings.homeGenresTitle || 'Browse by Genre'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {settings.homeGenresSubtitle || 'Find your exact vibe from cyberpunk neon to deep sci-fi thrillers'}
                </p>
              </div>

              <button
                id="home-view-all-genres-btn"
                onClick={() => navigate('/genres')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                {settings.homeGenresViewAllText || 'Browse All Genres →'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {genres.map(g => (
                <button
                  key={g.id}
                  id={`genre-chip-${g.slug}`}
                  onClick={() => navigate(`/genre/${g.slug}`)}
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-amber-400 transition-all active:scale-95"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

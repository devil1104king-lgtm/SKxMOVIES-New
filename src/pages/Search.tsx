import React, { useEffect, useState } from 'react';
import { ContentItem, Category, Genre } from '../types';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { ContentGrid } from '../components/content/ContentGrid';
import { Search as SearchIcon, Filter, X, RotateCcw, Sparkles } from 'lucide-react';

interface SearchProps {
  initialQuery?: string;
  navigate: (path: string) => void;
}

export const Search: React.FC<SearchProps> = ({ initialQuery = '', navigate }) => {
  const { settings } = useSettings();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'views' | 'title' | 'releaseDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getGenres()])
      .then(([cats, gens]) => {
        setCategories(cats);
        setGenres(gens);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.getContent({
          search: query.trim() || undefined,
          categorySlug: selectedCategory || undefined,
          genreSlug: selectedGenre || undefined,
          sortBy,
          sortOrder,
          limit: 60
        });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedGenre, sortBy, sortOrder]);

  const handleReset = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedGenre('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div id="search-vault-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <SearchIcon className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Search Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {settings.searchPageTitle || 'Search Cinema Vault'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          {settings.searchPageSubtitle ||
            'Filter through our multi-database library across titles, actors, genres, and audio formats.'}
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-5 space-y-4">
        {/* Search input */}
        <div className="relative">
          <input
            id="search-page-input"
            type="text"
            placeholder={settings.searchPlaceholder || 'Search by title, actor, director or keyword...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <SearchIcon className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            id="search-filter-category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">{settings.searchAllCategoriesText || 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Genre Filter */}
          <select
            id="search-filter-genre"
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">{settings.searchAllGenresText || 'All Genres'}</option>
            {genres.map(g => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            id="search-sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [sb, so] = e.target.value.split('-') as [any, any];
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="createdAt-desc">{settings.searchSortLatestText || 'Recently Added'}</option>
            <option value="views-desc">{settings.searchSortViewsText || 'Most Popular'}</option>
            <option value="title-asc">{settings.searchSortAlphabeticalText || 'Alphabetical (A-Z)'}</option>
            <option value="releaseDate-desc">Release Year (Newest)</option>
          </select>

          {/* Reset button */}
          {(query || selectedCategory || selectedGenre || sortBy !== 'createdAt') && (
            <button
              id="search-reset-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{settings.searchResetBtnText || 'Reset'}</span>
            </button>
          )}

          {/* Total count badge */}
          <div className="ml-auto text-xs font-medium text-zinc-400">
            Found <span className="font-bold text-white">{total}</span> titles
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <ContentGrid
        items={items}
        isLoading={loading}
        onItemClick={item => navigate(`/content/${item.slug}`)}
        emptyTitle={settings.searchEmptyTitle || 'No Titles Found'}
        emptyDescription={
          settings.searchEmptyDescription ||
          'Try adjusting your search keywords or resetting active filters.'
        }
      />
    </div>
  );
};

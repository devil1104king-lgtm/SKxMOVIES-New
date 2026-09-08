import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Category, Genre } from '../../types';
import { api } from '../../lib/api';
import {
  Search,
  Menu,
  ChevronDown,
  Sparkles,
  Layers,
  Compass,
  Send,
  Film,
  X
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenMobileMenu }) => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getGenres().then(setGenres).catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setShowCatMenu(false);
      }
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setShowGenreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpenMobile(false);
    }
  };

  return (
    <header
      id="main-navbar-header"
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl py-3'
          : 'bg-gradient-to-b from-black/90 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="navbar-brand-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-600 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <Film className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xl font-extrabold tracking-tight font-sans flex items-center">
                <span className="text-white">{settings.logoPrefixText || 'SK'}</span>
                <span className="text-amber-400 mx-0.5">{settings.logoHighlightText || 'x'}</span>
                <span className="text-white">{settings.logoSuffixText || 'MOVIES'}</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase -mt-0.5">
                {settings.logoSubtext || 'CINEMA HUB'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-link-home"
              onClick={() => navigate('/')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/' ? 'text-amber-400 bg-zinc-900/60' : 'text-zinc-300 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              {settings.navHomeLabel || 'Home'}
            </button>

            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                id="nav-dropdown-categories"
                onClick={() => {
                  setShowCatMenu(!showCatMenu);
                  setShowGenreMenu(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPath.startsWith('/categor') ? 'text-amber-400 bg-zinc-900/60' : 'text-zinc-300 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Layers className="w-4 h-4 text-zinc-400" />
                <span>{settings.navCategoriesLabel || 'Categories'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
              </button>

              {showCatMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 zoom-in-95 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Browse Categories
                  </div>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      id={`nav-cat-item-${cat.slug}`}
                      onClick={() => {
                        navigate(`/category/${cat.slug}`);
                        setShowCatMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-zinc-800/80 mt-1 pt-1">
                    <button
                      id="nav-cat-view-all"
                      onClick={() => {
                        navigate('/categories');
                        setShowCatMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      View All Categories →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Genres Dropdown */}
            <div className="relative" ref={genreRef}>
              <button
                id="nav-dropdown-genres"
                onClick={() => {
                  setShowGenreMenu(!showGenreMenu);
                  setShowCatMenu(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPath.startsWith('/genre') ? 'text-amber-400 bg-zinc-900/60' : 'text-zinc-300 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Compass className="w-4 h-4 text-zinc-400" />
                <span>{settings.navGenresLabel || 'Genres'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGenreMenu ? 'rotate-180' : ''}`} />
              </button>

              {showGenreMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 shadow-2xl backdrop-blur-2xl z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Cinema Genres
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {genres.map(g => (
                      <button
                        key={g.id}
                        id={`nav-genre-item-${g.slug}`}
                        onClick={() => {
                          navigate(`/genre/${g.slug}`);
                          setShowGenreMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800/80 mt-1 pt-1">
                    <button
                      id="nav-genre-view-all"
                      onClick={() => {
                        navigate('/genres');
                        setShowGenreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      Browse All Genres →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              id="nav-link-about"
              onClick={() => navigate('/about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/about' ? 'text-amber-400 bg-zinc-900/60' : 'text-zinc-300 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              {settings.navAboutLabel || 'About'}
            </button>

            <button
              id="nav-link-support"
              onClick={() => navigate('/support')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/support' ? 'text-sky-400 bg-sky-950/40 border border-sky-500/30' : 'text-zinc-300 hover:text-sky-300 hover:bg-zinc-900/40'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>{settings.navSupportLabel || 'Telegram Support'}</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:block relative w-64 xl:w-72">
            <input
              id="navbar-search-input"
              type="text"
              placeholder={settings.navSearchPlaceholder || 'Search cinema, 4K...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Search Toggle */}
          <button
            id="mobile-search-toggle-btn"
            onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
            className="sm:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Direct Telegram Channel Link (Header Button) */}
          <a
            id="navbar-telegram-btn"
            href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all shadow-sm shadow-sky-500/10 active:scale-95 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Join Telegram</span>
          </a>

          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-trigger-btn"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpenMobile && (
        <div className="sm:hidden px-4 pt-3 pb-2 border-t border-zinc-900 bg-black/95">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <input
              id="navbar-mobile-search-input"
              type="text"
              placeholder={settings.navSearchPlaceholder || 'Search titles, 4K...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setIsSearchOpenMobile(false)}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

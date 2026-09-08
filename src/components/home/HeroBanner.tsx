import React, { useState } from 'react';
import { ContentItem } from '../../types';
import { Play, Info, Sparkles, Send, Star, Clock, Calendar, Volume2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { TrailerModal } from '../content/TrailerModal';

interface HeroBannerProps {
  featuredItems: ContentItem[];
  navigate: (path: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredItems, navigate }) => {
  const { settings } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section id="hero-banner-section" className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-end overflow-hidden mb-12">
      {/* Background Backdrop Image with Deep Vignette Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.6] scale-105 transition-all duration-1000 ease-out"
        />
        {/* Multi-layered Cinema Vignette & Gradients to guarantee pure black transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-3xl space-y-5">
          {/* Badge & Telegram Alert */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.heroBadgeText || 'FEATURED CINEMA PREMIERE'}</span>
            </span>

            <a
              id="hero-telegram-pill"
              href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3 h-3 text-sky-400" />
              <span>Telegram Mirror Live</span>
            </a>

            {current.tags && current.tags.slice(0, 2).map((t, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900/80 text-zinc-300 border border-zinc-800">
                {t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
            {current.title}
          </h1>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
            {current.rating && (
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{current.rating}</span>
              </div>
            )}
            {current.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{current.releaseDate}</span>
              </div>
            )}
            {current.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{current.duration}</span>
              </div>
            )}
            {current.language && (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>{current.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {current.genres && current.genres.map((g, i) => (
                <span key={i} className="text-zinc-400">
                  {g}{i < current.genres.length - 1 ? ' •' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 max-w-2xl leading-relaxed">
            {current.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              id="hero-watch-btn"
              onClick={() => navigate(`/content/${current.slug}`)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-wide transition-all duration-200 shadow-xl shadow-amber-500/25 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{settings.heroWatchBtnText || 'Stream Now'}</span>
            </button>

            {current.trailerUrl && (
              <button
                id="hero-trailer-btn"
                onClick={() => setTrailerUrl(current.trailerUrl || null)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/80 transition-all active:scale-[0.98] backdrop-blur-md"
              >
                <span>{settings.heroTrailerBtnText || 'Watch Trailer'}</span>
              </button>
            )}

            <button
              id="hero-details-btn"
              onClick={() => navigate(`/content/${current.slug}`)}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Details & Mirrors</span>
            </button>
          </div>
        </div>

        {/* Carousel Indicators if multiple featured titles */}
        {featuredItems.length > 1 && (
          <div className="flex items-center gap-2 mt-8">
            {featuredItems.map((_, idx) => (
              <button
                key={idx}
                id={`hero-slide-dot-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          trailerUrl={trailerUrl}
          title={current.title}
          onClose={() => setTrailerUrl(null)}
        />
      )}
    </section>
  );
};

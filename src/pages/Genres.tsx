import React, { useEffect, useState } from 'react';
import { Genre } from '../types';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { Compass, Film, ArrowRight } from 'lucide-react';

interface GenresProps {
  navigate: (path: string) => void;
}

export const Genres: React.FC<GenresProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGenres()
      .then(setGenres)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="genres-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Discover Cinema</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {settings.navGenresLabel || 'Browse by Genre'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Filter titles by thematic styles from pulse-pounding sci-fi to psychological thrillers and action epics.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-950 border border-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map(g => (
            <div
              key={g.id}
              id={`genre-card-${g.slug}`}
              onClick={() => navigate(`/genre/${g.slug}`)}
              className="group cursor-pointer rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-amber-500/40 p-5 flex flex-col justify-between hover:bg-zinc-900/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {g.name}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              {g.description && (
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{g.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

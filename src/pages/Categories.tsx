import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { Layers, Film, ArrowRight } from 'lucide-react';

interface CategoriesProps {
  navigate: (path: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="categories-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Vault Collections</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {settings.navCategoriesLabel || 'Cinema Categories'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Browse our organized collections of movies, web series, franchises, and regional releases.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-950 border border-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-amber-500/40 p-6 flex flex-col justify-between hover:bg-zinc-900/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-6 flex items-center justify-between text-xs font-semibold text-zinc-500 group-hover:text-amber-400 transition-colors border-t border-zinc-900/80 mt-4">
                <span>Explore Titles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

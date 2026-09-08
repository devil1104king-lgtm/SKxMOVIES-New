import React, { useEffect, useState } from 'react';
import { ContentItem, Genre } from '../types';
import { api } from '../lib/api';
import { ContentGrid } from '../components/content/ContentGrid';
import { ArrowLeft, Compass } from 'lucide-react';

interface GenreDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const GenreDetail: React.FC<GenreDetailProps> = ({ slug, navigate }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [genre, setGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenreContent = async () => {
      setLoading(true);
      try {
        const [genres, res] = await Promise.all([
          api.getGenres(),
          api.getContent({ genreSlug: slug, limit: 50 })
        ]);
        const found = genres.find(g => g.slug === slug);
        setGenre(found || null);
        setItems(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGenreContent();
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div id="genre-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/genres')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Genres</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Genre Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {genre ? genre.name : slug.replace('-', ' ')}
        </h1>
        {genre?.description && (
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{genre.description}</p>
        )}
      </div>

      {/* Grid */}
      <ContentGrid
        items={items}
        isLoading={loading}
        onItemClick={item => navigate(`/content/${item.slug}`)}
        emptyTitle={`No titles found under ${genre?.name || slug}`}
        emptyDescription={`Join our Telegram channel to request movies in this genre.`}
      />
    </div>
  );
};

import React from 'react';
import { ContentItem } from '../../types';
import { Play, Star, Clock, Eye } from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onClick }) => {
  // Find highest quality badge from accessOptions or tags
  const qualityBadge =
    item.accessOptions?.[0]?.qualityBadge ||
    item.tags?.find(t => t.includes('4K') || t.includes('1080p') || t.includes('HDR')) ||
    'HD';

  return (
    <div
      id={`content-card-${item.slug}`}
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900/90 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={item.posterUrl}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
            {qualityBadge}
          </span>

          {item.rating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white border border-zinc-800 backdrop-blur-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.rating.replace('IMDb ', '')}</span>
            </span>
          )}
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Bottom Specs Bar inside poster */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-[11px] text-zinc-300 font-medium">
          <div className="flex items-center gap-2">
            {item.releaseDate && <span>{item.releaseDate}</span>}
            {item.duration && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>{item.duration}</span>
              </span>
            )}
          </div>
          {item.views > 0 && (
            <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
              <Eye className="w-3 h-3" />
              <span>{item.views.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Info details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {item.title}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-zinc-400">
          <span className="truncate">{item.categoryName || item.genres?.[0] || 'Feature'}</span>
          {item.language && <span className="text-[10px] text-zinc-500 truncate">{item.language}</span>}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ContentItem } from '../../types';
import { ContentCard } from './ContentCard';
import { Film, RefreshCw } from 'lucide-react';

interface ContentGridProps {
  items: ContentItem[];
  isLoading?: boolean;
  onItemClick: (item: ContentItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  isLoading = false,
  onItemClick,
  emptyTitle = 'No Titles Found',
  emptyDescription = 'There are no titles available matching the selected criteria.'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 animate-pulse">
            <div className="aspect-[2/3] w-full bg-zinc-900" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
              <div className="h-2.5 bg-zinc-900 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div id="content-grid-empty" className="py-16 text-center border border-zinc-900 rounded-2xl bg-zinc-950/60 p-8 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto mb-4">
          <Film className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{emptyTitle}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div id="content-grid-items" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {items.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

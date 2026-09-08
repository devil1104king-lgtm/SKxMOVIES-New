import React, { useEffect, useState } from 'react';
import { ContentItem, Category } from '../types';
import { api } from '../lib/api';
import { ContentGrid } from '../components/content/ContentGrid';
import { ArrowLeft, Layers, Film } from 'lucide-react';

interface CategoryDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ slug, navigate }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryContent = async () => {
      setLoading(true);
      try {
        const [cats, res] = await Promise.all([
          api.getCategories(),
          api.getContent({ categorySlug: slug, limit: 50 })
        ]);
        const found = cats.find(c => c.slug === slug);
        setCategory(found || null);
        setItems(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCategoryContent();
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div id="category-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Categories</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {category ? category.name : slug.replace('-', ' ')}
        </h1>
        {category?.description && (
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{category.description}</p>
        )}
      </div>

      {/* Grid */}
      <ContentGrid
        items={items}
        isLoading={loading}
        onItemClick={item => navigate(`/content/${item.slug}`)}
        emptyTitle={`No titles currently in this category`}
        emptyDescription={`Check back shortly or join our Telegram channel to request additions.`}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Category, Genre } from '../../types';
import { api } from '../../lib/api';
import { Layers, Compass, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Category add/edit state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Genre add state
  const [genreName, setGenreName] = useState('');
  const [genreDesc, setGenreDesc] = useState('');

  const loadAll = async () => {
    try {
      const [c, g] = await Promise.all([api.getCategories(), api.getGenres()]);
      setCategories(c);
      setGenres(g);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      if (editingCatId) {
        await api.updateCategory(editingCatId, { name: catName.trim(), slug, description: catDesc.trim() });
        setEditingCatId(null);
      } else {
        await api.createCategory({ name: catName.trim(), slug, description: catDesc.trim() });
      }
      setCatName('');
      setCatDesc('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) return;
    const slug = genreName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      await api.createGenre({ name: genreName.trim(), slug, description: genreDesc.trim() });
      setGenreName('');
      setGenreDesc('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGenre = async (id: string, name: string) => {
    if (!confirm(`Delete genre "${name}"?`)) return;
    try {
      await api.deleteGenre(id);
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Categories Manager */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Categories</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveCategory} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {editingCatId ? 'Edit Category' : 'Add New Category'}
          </h4>
          <input
            type="text"
            required
            placeholder="Category Name (e.g. Anime Movies)"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Description..."
            value={catDesc}
            onChange={e => setCatDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
          />
          <div className="flex justify-end gap-2 pt-1">
            {editingCatId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCatId(null);
                  setCatName('');
                  setCatDesc('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20"
            >
              {editingCatId ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-2">
          {categories.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs"
            >
              <div>
                <span className="font-bold text-white">{c.name}</span>
                <span className="text-zinc-500 ml-2">/{c.slug}</span>
                {c.description && <p className="text-zinc-400 text-[11px] mt-0.5">{c.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingCatId(c.id);
                    setCatName(c.name);
                    setCatDesc(c.description || '');
                  }}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id, c.name)}
                  className="p-1 text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genres Manager */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Compass className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Genres</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleAddGenre} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Add New Genre</h4>
          <input
            type="text"
            required
            placeholder="Genre Name (e.g. Cyberpunk)"
            value={genreName}
            onChange={e => setGenreName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Genre Description..."
            value={genreDesc}
            onChange={e => setGenreDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
          />
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20"
            >
              Add Genre
            </button>
          </div>
        </form>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {genres.map(g => (
            <div
              key={g.id}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs"
            >
              <div className="truncate">
                <span className="font-bold text-white">{g.name}</span>
                <span className="text-zinc-500 ml-1.5 text-[10px]">/{g.slug}</span>
              </div>
              <button
                onClick={() => handleDeleteGenre(g.id, g.name)}
                className="p-1 text-zinc-500 hover:text-rose-400 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

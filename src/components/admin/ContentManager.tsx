import React, { useState, useEffect } from 'react';
import { ContentItem, Category, Genre, AccessOption, HowToAccessStep, TutorialVideo } from '../../types';
import { api } from '../../lib/api';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  ExternalLink,
  Search,
  X,
  Play,
  Download,
  AlertCircle
} from 'lucide-react';

export const ContentManager: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState('');
  const [rating, setRating] = useState('');
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('');
  const [director, setDirector] = useState('');
  const [castInput, setCastInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Mirrors & Access Options
  const [accessOptions, setAccessOptions] = useState<AccessOption[]>([
    {
      id: 'opt-1',
      label: 'Server 1 - 4K Ultra HD',
      qualityBadge: '4K',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      downloadUrl: '',
      fileSize: '4.8 GB',
      buttonText: 'Watch Stream',
      downloadButtonText: 'Download 4K',
      enabled: true
    },
    {
      id: 'opt-2',
      label: 'Server 2 - 1080p Full HD',
      qualityBadge: '1080p',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      downloadUrl: '',
      fileSize: '2.1 GB',
      buttonText: 'Watch Stream',
      downloadButtonText: 'Download 1080p',
      enabled: true
    }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentRes, cats, gens] = await Promise.all([
        api.getContent({ limit: 100 }),
        api.getCategories(),
        api.getGenres()
      ]);
      setItems(contentRes.items || []);
      setCategories(cats);
      setGenres(gens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setPosterUrl('');
    setBackdropUrl('');
    setCategoryName(categories[0]?.name || 'Movies');
    setSelectedGenres([]);
    setReleaseDate(new Date().getFullYear().toString());
    setRating('IMDb 8.0');
    setDuration('2h 10m');
    setLanguage('English [Dual Audio]');
    setDirector('');
    setCastInput('');
    setTagsInput('4K, HDR, Dolby Atmos');
    setTrailerUrl('');
    setFeatured(false);
    setStatus('published');
    setAccessOptions([
      {
        id: 'opt-1',
        label: 'Fast Mirror 1 - 4K HDR',
        qualityBadge: '4K',
        url: '',
        downloadUrl: '',
        fileSize: '4.2 GB',
        buttonText: 'Watch Stream',
        downloadButtonText: 'Download',
        enabled: true
      }
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description || '');
    setPosterUrl(item.posterUrl || '');
    setBackdropUrl(item.backdropUrl || '');
    setCategoryName(item.categoryName || categories[0]?.name || 'Movies');
    setSelectedGenres(item.genres || []);
    setReleaseDate(item.releaseDate || '');
    setRating(item.rating || '');
    setDuration(item.duration || '');
    setLanguage(item.language || '');
    setDirector(item.director || '');
    setCastInput((item.cast || []).join(', '));
    setTagsInput((item.tags || []).join(', '));
    setTrailerUrl(item.trailerUrl || '');
    setFeatured(item.featured || false);
    setStatus(item.status);
    setAccessOptions(
      item.accessOptions && item.accessOptions.length > 0
        ? item.accessOptions
        : [
            {
              id: 'opt-1',
              label: 'Fast Mirror 1 - 1080p',
              qualityBadge: '1080p',
              url: '',
              downloadUrl: '',
              fileSize: '2.0 GB',
              buttonText: 'Watch Stream',
              downloadButtonText: 'Download',
              enabled: true
            }
          ]
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !posterUrl.trim()) {
      setFormError('Title and Poster URL (External URL) are required.');
      return;
    }

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const catObj = categories.find(c => c.name === categoryName);

    const payload = {
      title: title.trim(),
      slug: generatedSlug,
      description: description.trim(),
      posterUrl: posterUrl.trim(),
      backdropUrl: backdropUrl.trim() || posterUrl.trim(),
      categoryName,
      categoryId: catObj?.id || '',
      categorySlug: catObj?.slug || '',
      genres: selectedGenres,
      releaseDate: releaseDate.trim(),
      rating: rating.trim(),
      duration: duration.trim(),
      language: language.trim(),
      director: director.trim(),
      cast: castInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      tags: tagsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      trailerUrl: trailerUrl.trim(),
      accessOptions,
      featured,
      status
    };

    setSaving(true);
    try {
      if (editingItem) {
        await api.updateContent(editingItem.id, payload);
      } else {
        await api.createContent(payload as any);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save content item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;
    try {
      await api.deleteContent(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete title');
    }
  };

  const handleToggleStatus = async (item: ContentItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await api.toggleContentStatus(item.id, nextStatus);
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: nextStatus } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (item: ContentItem) => {
    const nextFeatured = !item.featured;
    try {
      await api.toggleContentFeatured(item.id, nextFeatured);
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, featured: nextFeatured } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.categoryName && i.categoryName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div id="content-manager-tab" className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            id="admin-content-search"
            type="text"
            placeholder="Search titles in vault..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          id="admin-add-movie-btn"
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie / Series</span>
        </button>
      </div>

      {/* Table of Content */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/70 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Title & Media</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Rating & Specs</th>
                <th className="px-4 py-3.5">Views</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Featured</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    Loading content library...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    No movies or series match your query.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Title & Media */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 rounded-lg object-cover bg-zinc-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">{item.title}</p>
                          <p className="text-[11px] text-zinc-500 truncate">/{item.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {item.categoryName || 'Movies'}
                      </span>
                    </td>

                    {/* Rating & Specs */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="font-semibold text-amber-400">{item.rating || 'N/A'}</p>
                        <p className="text-zinc-500">{item.duration} • {item.releaseDate}</p>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 text-zinc-400 font-medium">
                      {item.views.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          item.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {item.status === 'published' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.featured
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                        title={item.featured ? 'Featured on Hero' : 'Mark as Featured'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        id={`edit-movie-${item.slug}`}
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        title="Edit Details & Mirrors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-movie-${item.slug}`}
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete Title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? `Edit: ${editingItem.title}` : 'Add New Movie / Series'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Notice regarding External URLs */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Zero File Uploads: Provide external HTTPS URLs for posters, banners, trailers, and streaming links.</span>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Movie / Series Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dune: Part Two"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    URL Slug (auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    placeholder="dune-part-two"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category & Genres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Genres (Select applicable)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    {genres.map(g => {
                      const selected = selectedGenres.includes(g.name);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setSelectedGenres(
                              selected
                                ? selectedGenres.filter(x => x !== g.name)
                                : [...selectedGenres, g.name]
                            );
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            selected
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Poster URL & Backdrop URL (External URLs only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Poster Image URL (External HTTPS) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={posterUrl}
                    onChange={e => setPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Backdrop / Banner URL (External HTTPS)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={backdropUrl}
                    onChange={e => setBackdropUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Synopsis / Storyline</label>
                <textarea
                  rows={3}
                  placeholder="Plot summary..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500"
                />
              </div>

              {/* Specs: Rating, Release Year, Duration, Language */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Rating</label>
                  <input
                    type="text"
                    placeholder="IMDb 8.5"
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Release Year</label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={releaseDate}
                    onChange={e => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="2h 15m"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Language</label>
                  <input
                    type="text"
                    placeholder="English [Dual Audio]"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Trailer URL & Director */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Trailer URL (YouTube / Embed)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={trailerUrl}
                    onChange={e => setTrailerUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Director</label>
                  <input
                    type="text"
                    placeholder="Denis Villeneuve"
                    value={director}
                    onChange={e => setDirector(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Cast & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cast (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Timothée Chalamet, Zendaya, Rebecca Ferguson"
                    value={castInput}
                    onChange={e => setCastInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="4K, HDR, IMAX, Dolby Atmos"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Access Options (Streaming & Download Mirrors) */}
              <div className="border-t border-zinc-900 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Streaming & Download Mirrors</h4>
                    <p className="text-[11px] text-zinc-400">
                      Configure external streaming mirrors and download URLs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAccessOptions([
                        ...accessOptions,
                        {
                          id: `opt-${Date.now()}`,
                          label: `Server ${accessOptions.length + 1} - 1080p`,
                          qualityBadge: '1080p',
                          url: '',
                          downloadUrl: '',
                          fileSize: '2.0 GB',
                          buttonText: 'Watch Stream',
                          downloadButtonText: 'Download',
                          enabled: true
                        }
                      ])
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-amber-400 border border-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Mirror
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto p-1">
                  {accessOptions.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Server 1 - 4K)"
                          value={opt.label}
                          onChange={e => {
                            const updated = [...accessOptions];
                            updated[idx].label = e.target.value;
                            setAccessOptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white w-44"
                        />
                        <input
                          type="text"
                          placeholder="Badge (4K, 1080p)"
                          value={opt.qualityBadge}
                          onChange={e => {
                            const updated = [...accessOptions];
                            updated[idx].qualityBadge = e.target.value;
                            setAccessOptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white w-24"
                        />
                        <input
                          type="text"
                          placeholder="File Size (e.g. 4.2 GB)"
                          value={opt.fileSize || ''}
                          onChange={e => {
                            const updated = [...accessOptions];
                            updated[idx].fileSize = e.target.value;
                            setAccessOptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white w-28"
                        />
                        <button
                          type="button"
                          onClick={() => setAccessOptions(accessOptions.filter((_, i) => i !== idx))}
                          className="p-1.5 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          placeholder="Stream URL (Direct MP4 or Web Player Embed)"
                          value={opt.url}
                          onChange={e => {
                            const updated = [...accessOptions];
                            updated[idx].url = e.target.value;
                            setAccessOptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                        />
                        <input
                          type="url"
                          placeholder="Download URL (External file mirror)"
                          value={opt.downloadUrl || ''}
                          onChange={e => {
                            const updated = [...accessOptions];
                            updated[idx].downloadUrl = e.target.value;
                            setAccessOptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles: Featured and Status */}
              <div className="flex items-center gap-6 pt-3 border-t border-zinc-900">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <span>Featured on Hero Banner</span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-300">Publish Status:</span>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Title' : 'Save Title to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

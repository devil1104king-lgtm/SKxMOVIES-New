import React, { useState, useEffect } from 'react';
import { Popup } from '../../types';
import { api } from '../../lib/api';
import { Sparkles, Plus, Trash2, CheckCircle2, XCircle, Edit2, ExternalLink } from 'lucide-react';

export const PopupsManager: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Join Telegram Channel');
  const [buttonUrl, setButtonUrl] = useState('https://t.me/skxmovies_official');
  const [displayDelay, setDisplayDelay] = useState(2);
  const [isActive, setIsActive] = useState(true);

  const loadPopups = async () => {
    try {
      const data = await api.getAdminPopups();
      setPopups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const openNew = () => {
    setEditingPopup(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setButtonText('Join Telegram Channel');
    setButtonUrl('https://t.me/skxmovies_official');
    setDisplayDelay(2);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title: title.trim(),
      message: content.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      buttonText: buttonText.trim(),
      buttonUrl: buttonUrl.trim(),
      btn1Text: buttonText.trim(),
      btn1Url: buttonUrl.trim(),
      btn1Enabled: Boolean(buttonText.trim() && buttonUrl.trim()),
      type: 'announcement' as const,
      displayDelaySeconds: Number(displayDelay) || 0,
      delaySeconds: Number(displayDelay) || 0,
      active: isActive,
      isActive
    };

    try {
      if (editingPopup) {
        await api.updatePopup(editingPopup.id, payload);
      } else {
        await api.createPopup(payload);
      }
      setIsModalOpen(false);
      loadPopups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.togglePopup(id);
      loadPopups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this popup?')) return;
    try {
      await api.deletePopup(id);
      loadPopups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Popup Announcements</h3>
          <p className="text-xs text-zinc-400">
            Create promotional modals, Telegram community invites, or notices displayed to visitors.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Popup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {popups.map(p => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {p.isActive ? 'Active' : 'Disabled'}
                </span>
                <span className="text-[11px] text-zinc-500">Delay: {p.displayDelaySeconds}s</span>
              </div>

              <h4 className="text-base font-bold text-white">{p.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{p.content}</p>

              {p.buttonText && p.buttonUrl && (
                <div className="pt-1">
                  <span className="text-[11px] text-sky-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Button: {p.buttonText} → {p.buttonUrl}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-xs">
              <button
                onClick={() => handleToggle(p.id)}
                className="text-xs font-semibold text-zinc-400 hover:text-white"
              >
                {p.isActive ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-white">Create Announcement Popup</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Official Telegram Channel Launch"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Join our official Telegram community for instant download mirrors..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Image URL (External HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">CTA Button Label</label>
                  <input
                    type="text"
                    placeholder="Join Telegram"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">CTA Link URL</label>
                  <input
                    type="url"
                    placeholder="https://t.me/skxmovies_official"
                    value={buttonUrl}
                    onChange={e => setButtonUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Display Delay (Seconds)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={displayDelay}
                  onChange={e => setDisplayDelay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Save Popup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

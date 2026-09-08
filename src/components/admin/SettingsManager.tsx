import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { SiteSettings } from '../../types';
import { Send, Settings, Check, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof SiteSettings, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Portal & Telegram Settings</h3>
          <p className="text-zinc-400">
            Customize branding, announcement bar, and instant Telegram channels and bots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* TELEGRAM INTEGRATION SECTION (HIGHLIGHTED) */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/40 via-zinc-950 to-zinc-950 border border-sky-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Telegram Integration & Community</h4>
            <p className="text-[11px] text-sky-300/80">
              Configured across header, footer, hero banners, support page, and mirror requests.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Official Telegram Channel URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://t.me/skxmovies_official"
              value={form.telegramUrl || ''}
              onChange={e => handleChange('telegramUrl', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Channel Handle (Displayed in UI)
            </label>
            <input
              type="text"
              placeholder="@skxmovies_official"
              value={form.telegramChannel || ''}
              onChange={e => handleChange('telegramChannel', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Discussion Group URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://t.me/skxmovies_community"
              value={form.telegramGroup || ''}
              onChange={e => handleChange('telegramGroup', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Telegram Support / Request Bot Username
            </label>
            <input
              type="text"
              placeholder="@skxmovies_bot"
              value={form.telegramBotUsername || ''}
              onChange={e => handleChange('telegramBotUsername', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-zinc-300 font-semibold mb-1">
              Telegram Support & Mirror Notice Text
            </label>
            <textarea
              rows={2}
              value={form.telegramSupportNotice || ''}
              onChange={e => handleChange('telegramSupportNotice', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT BANNER */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Top Announcement Bar</h4>
            <p className="text-zinc-400 text-[11px]">Notice bar pinned to top of every page.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-400">
            <input
              type="checkbox"
              checked={form.announcementActive}
              onChange={e => handleChange('announcementActive', e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0"
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-zinc-300 font-semibold mb-1">Announcement Text</label>
            <input
              type="text"
              value={form.announcementText || ''}
              onChange={e => handleChange('announcementText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Link URL</label>
            <input
              type="url"
              value={form.announcementLink || ''}
              onChange={e => handleChange('announcementLink', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Link Button Text</label>
            <input
              type="text"
              value={form.announcementLinkText || ''}
              onChange={e => handleChange('announcementLinkText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
        </div>
      </div>

      {/* BRANDING & LOGO */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
        <h4 className="text-sm font-bold text-white">Branding & Logo Customization</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Logo Prefix</label>
            <input
              type="text"
              value={form.logoPrefixText || ''}
              onChange={e => handleChange('logoPrefixText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Logo Highlight Accent</label>
            <input
              type="text"
              value={form.logoHighlightText || ''}
              onChange={e => handleChange('logoHighlightText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Logo Suffix</label>
            <input
              type="text"
              value={form.logoSuffixText || ''}
              onChange={e => handleChange('logoSuffixText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Logo Subtitle</label>
            <input
              type="text"
              value={form.logoSubtext || ''}
              onChange={e => handleChange('logoSubtext', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

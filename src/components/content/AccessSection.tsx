import React, { useState } from 'react';
import { AccessOption } from '../../types';
import { Play, Download, ExternalLink, ShieldCheck, AlertCircle, Send, Film, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface AccessSectionProps {
  accessOptions: AccessOption[];
  title: string;
}

export const AccessSection: React.FC<AccessSectionProps> = ({ accessOptions, title }) => {
  const { settings } = useSettings();
  const [activePlayerUrl, setActivePlayerUrl] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>('');

  const enabledOptions = (accessOptions || []).filter(o => o.enabled);

  return (
    <div id="access-section" className="rounded-2xl bg-zinc-950/90 border border-zinc-900 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {settings.accessSectionBadge || 'AUTHORIZED PLAYBACK & DOWNLOAD'}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Fast Mirrors
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {settings.accessSectionTitle || 'Stream & Download Mirrors'}
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {settings.accessSectionSubtitle || 'Select your preferred visual fidelity and high-speed delivery server'}
          </p>
        </div>

        {/* Telegram Mirror Help Pill */}
        <a
          id="access-telegram-help-btn"
          href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Need Mirror on Telegram?</span>
        </a>
      </div>

      {/* Embedded Player View if triggered */}
      {activePlayerUrl && (
        <div id="inline-video-player-container" className="rounded-xl overflow-hidden bg-black border border-amber-500/40 shadow-2xl p-2 space-y-3">
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-zinc-300">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              Now Playing: {activeLabel}
            </span>
            <button
              onClick={() => setActivePlayerUrl(null)}
              className="text-zinc-400 hover:text-white px-2 py-1 bg-zinc-900 rounded-md"
            >
              Close Player ✕
            </button>
          </div>
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950">
            {activePlayerUrl.endsWith('.mp4') || activePlayerUrl.endsWith('.webm') ? (
              <video
                src={activePlayerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={activePlayerUrl}
                title={title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      )}

      {/* Mirrors List */}
      <div className="space-y-3">
        {enabledOptions.length === 0 ? (
          <div className="p-6 rounded-xl bg-zinc-900/50 text-center text-zinc-400 text-sm">
            No access options currently configured for this title. Join our Telegram channel to request mirrors.
          </div>
        ) : (
          enabledOptions.map(opt => (
            <div
              key={opt.id}
              id={`access-option-row-${opt.id}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{opt.label}</span>
                    {opt.qualityBadge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {opt.qualityBadge}
                      </span>
                    )}
                  </div>
                  {opt.fileSize && (
                    <span className="text-xs text-zinc-400 font-medium">Estimated File Size: {opt.fileSize}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Watch Stream Button */}
                <button
                  id={`stream-btn-${opt.id}`}
                  onClick={() => {
                    if (opt.url.startsWith('http')) {
                      setActivePlayerUrl(opt.url);
                      setActiveLabel(opt.label);
                    }
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{opt.buttonText || settings.accessDefaultBtnText || 'Watch Stream'}</span>
                </button>

                {/* Direct Download Button (If configured) */}
                {opt.downloadUrl ? (
                  <a
                    id={`download-btn-${opt.id}`}
                    href={opt.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{opt.downloadButtonText || 'Download'}</span>
                  </a>
                ) : (
                  <a
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-all"
                    title="Open External URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice & Disclaimer */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400">
        <AlertCircle className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {settings.accessNoticeText ||
            'Notice: All streams are served via external encrypted delivery networks. If a playback mirror buffers, switch to an alternative server or use direct download.'}
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Popup } from '../../types';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

export const PopupModal: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('skx_dismissed_popups') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.getPopups().then(data => {
      const activeList = data.filter(p => p.isActive && !dismissed.includes(p.id));
      setPopups(activeList);
      if (activeList.length > 0) {
        const first = activeList[0];
        const delay = (first.displayDelaySeconds || 0) * 1000;
        const timer = setTimeout(() => {
          setActivePopup(first);
        }, delay);
        return () => clearTimeout(timer);
      }
    }).catch(() => {});
  }, [dismissed]);

  const handleDismiss = () => {
    if (!activePopup) return;
    const updated = [...dismissed, activePopup.id];
    setDismissed(updated);
    try {
      sessionStorage.setItem('skx_dismissed_popups', JSON.stringify(updated));
    } catch {}
    setActivePopup(null);
  };

  if (!activePopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        id={`active-popup-${activePopup.id}`}
        className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl z-10 animate-in fade-in-50 zoom-in-95"
      >
        <button
          id="popup-dismiss-btn"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-zinc-400 hover:text-white border border-zinc-800 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {activePopup.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Notice</span>
          </div>

          <h3 className="text-xl font-bold text-white leading-snug">
            {activePopup.title}
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {activePopup.content}
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>

            {activePopup.buttonText && activePopup.buttonUrl && (
              <a
                id="popup-cta-btn"
                href={activePopup.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDismiss}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>{activePopup.buttonText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

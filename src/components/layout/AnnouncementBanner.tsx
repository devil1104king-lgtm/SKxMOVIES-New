import React from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useSettings();

  if (!settings.announcementActive || !settings.announcementText) {
    return null;
  }

  return (
    <div
      id="announcement-banner"
      className="bg-gradient-to-r from-sky-950/90 via-zinc-950 to-sky-950/90 border-b border-sky-500/20 text-xs py-2 px-4 relative z-40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sky-200 truncate">
          <AlertCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate font-medium">{settings.announcementText}</span>
        </div>

        {settings.announcementLink && (
          <a
            id="announcement-banner-link"
            href={settings.announcementLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 border border-sky-500/30 transition-all text-[11px] font-semibold shrink-0"
          >
            <Send className="w-3 h-3 text-sky-400" />
            <span>{settings.announcementLinkText || 'Join Telegram'}</span>
          </a>
        )}
      </div>
    </div>
  );
};

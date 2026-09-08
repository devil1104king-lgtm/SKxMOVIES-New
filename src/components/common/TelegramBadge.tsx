import React from 'react';
import { Send, Users, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface TelegramBannerCardProps {
  className?: string;
  variant?: 'card' | 'compact' | 'inline';
}

export const TelegramBannerCard: React.FC<TelegramBannerCardProps> = ({
  className = '',
  variant = 'card'
}) => {
  const { settings } = useSettings();
  const telegramUrl = settings.telegramUrl || 'https://t.me/skxmovies_official';
  const channelHandle = settings.telegramChannel || '@skxmovies_official';

  if (variant === 'compact') {
    return (
      <a
        id="telegram-compact-link"
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 border border-sky-500/30 text-sky-300 transition-all duration-200 group ${className}`}
      >
        <Send className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-sm font-semibold tracking-wide">Join Telegram Channel</span>
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-sky-500/20 ${className}`}>
        <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
          <Send className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs font-semibold text-sky-300">Official Telegram Channel</p>
          <p className="text-xs text-zinc-400">Direct streaming mirrors & instant release alerts</p>
        </div>
        <a
          id="telegram-inline-action-btn"
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all shadow-sm shadow-sky-500/20 whitespace-nowrap"
        >
          Join {channelHandle}
        </a>
      </div>
    );
  }

  return (
    <div
      id="telegram-community-card"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-sky-500/25 p-6 md:p-8 backdrop-blur-md shadow-2xl ${className}`}
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-[90px] pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-black/60 backdrop-blur-sm flex items-center justify-center text-sky-300">
              <Send className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Official Hub
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Broadcasts
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {settings.homeBannerTitle || 'Never Miss a Premiere — Join Our Telegram'}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {settings.homeBannerText ||
                'Get instant notifications the second a new 4K or 1080p release drops. Request custom titles, report dead links, and get direct download mirrors.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <a
            id="telegram-channel-btn"
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/25 active:scale-[0.98] whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>{settings.telegramJoinBtnText || 'Join Telegram Channel'}</span>
          </a>

          {settings.telegramGroup && (
            <a
              id="telegram-group-btn"
              href={settings.telegramGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/80 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Discussion Group</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

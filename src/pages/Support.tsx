import React from 'react';
import { Send, Users, ShieldAlert, Bot, HelpCircle, ArrowRight, MessageSquare, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SupportProps {
  navigate: (path: string) => void;
}

export const Support: React.FC<SupportProps> = ({ navigate }) => {
  const { settings } = useSettings();

  return (
    <div id="telegram-support-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Pure Telegram Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {settings.supportPageTitle || 'Community & Telegram Support'}
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {settings.supportPageSubtitle ||
            'Direct, instant assistance, stream mirror updates, and title requests via Telegram. No slow email forms.'}
        </p>
      </div>

      {/* Main Telegram Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Broadcast Channel */}
        <div className="rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-900/60 border border-sky-500/30 p-7 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Official Broadcast
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Official Telegram Channel</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Subscribe to get instant notifications when new 4K and 1080p movies drop, mirror server updates, and direct download links before they hit the vault.
            </p>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant 4K & 1080p release alerts</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Fast mirror links and backup audio tracks</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero ad spam — purely cinema updates</span>
              </div>
            </div>
          </div>

          <a
            id="support-channel-btn"
            href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Join {settings.telegramChannel || '@skxmovies_official'}</span>
          </a>
        </div>

        {/* Telegram Discussion / Support Bot */}
        <div className="rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-900/60 border border-zinc-800/80 p-7 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Direct Requests & Inquiries
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Telegram Support Bot & Group</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Encountered a dead video link? Need a movie uploaded with dual audio? Message our official automated bot or join our community group for fast response.
            </p>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Report broken streaming servers</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Request missing titles or series episodes</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Connect with fellow cinephiles</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {settings.telegramBotUsername && (
              <a
                id="support-bot-btn"
                href={`https://t.me/${settings.telegramBotUsername.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Open Bot: {settings.telegramBotUsername}</span>
              </a>
            )}

            {settings.telegramGroup && (
              <a
                id="support-group-btn"
                href={settings.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all active:scale-[0.98]"
              >
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Join Community Discussion Group</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-900 p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          <h4 className="font-bold text-white text-sm">Why We Exclusively Use Telegram</h4>
          <p>
            Email inquiries often get delayed, marked as spam, or lost. Telegram allows our team to respond directly within minutes, share verified high-speed mirrors immediately, and keep our entire community notified in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

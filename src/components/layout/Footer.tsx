import React from 'react';
import { Film, Send, ShieldCheck, Heart, Users } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useSettings();

  return (
    <footer id="main-footer" className="border-t border-zinc-900 bg-black text-zinc-400 text-sm mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 p-[1.5px]">
                <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                  <Film className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-white">{settings.logoPrefixText || 'SK'}</span>
                <span className="text-amber-400">{settings.logoHighlightText || 'x'}</span>
                <span className="text-white">{settings.logoSuffixText || 'MOVIES'}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {settings.footerBio ||
                'SKxMOVIES is an ultra-fast, ad-free cinema indexing portal providing high-definition streaming links and direct download mirrors. Optimized for Cloudflare edge.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Popups • Pure Black Cinematic Experience</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Cinema Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => navigate('/')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Featured & Latest Cinema
                </button>
              </li>
              <li>
                <button
                  id="footer-link-categories"
                  onClick={() => navigate('/categories')}
                  className="hover:text-amber-400 transition-colors"
                >
                  All Categories & Series
                </button>
              </li>
              <li>
                <button
                  id="footer-link-genres"
                  onClick={() => navigate('/genres')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse by Movie Genres
                </button>
              </li>
              <li>
                <button
                  id="footer-link-search"
                  onClick={() => navigate('/search')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Multi-Database Search Vault
                </button>
              </li>
            </ul>
          </div>

          {/* Telegram Official Community (Pure Telegram - No other social media) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Official Telegram</span>
            </h4>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              {settings.telegramSupportNotice ||
                'Connect with us exclusively on Telegram for instant download mirrors, daily 4K release alerts, and fast title requests.'}
            </p>

            <div className="space-y-2">
              <a
                id="footer-telegram-channel-btn"
                href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>Channel: {settings.telegramChannel || '@skxmovies_official'}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-sky-400">Join →</span>
              </a>

              {settings.telegramGroup && (
                <a
                  id="footer-telegram-group-btn"
                  href={settings.telegramGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Discussion Community</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Group →</span>
                </a>
              )}

              {settings.telegramBotUsername && (
                <a
                  id="footer-telegram-bot-btn"
                  href={`https://t.me/${settings.telegramBotUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[11px] text-sky-400/80 hover:text-sky-300 transition-colors pt-1"
                >
                  Request Bot: {settings.telegramBotUsername}
                </a>
              )}
            </div>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Legal & Community
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => navigate('/about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About SKxMOVIES
                </button>
              </li>
              <li>
                <button
                  id="footer-link-support"
                  onClick={() => navigate('/support')}
                  className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Telegram Support Hub</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-dmca"
                  onClick={() => navigate('/dmca')}
                  className="hover:text-amber-400 transition-colors"
                >
                  DMCA & Third-Party Disclaimer
                </button>
              </li>
              <li>
                <button
                  id="footer-link-privacy"
                  onClick={() => navigate('/privacy')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-link-terms"
                  onClick={() => navigate('/terms')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="max-w-2xl text-center md:text-left leading-relaxed">
            {settings.footerRightsNotice ||
              'SKxMOVIES does not store or host any media files or video streams on its servers. All streams and downloads are indexed from publicly available third-party sources.'}
          </p>

          <div className="flex items-center gap-4 shrink-0">
            <span>{settings.footerText || '© 2026 SKxMOVIES'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

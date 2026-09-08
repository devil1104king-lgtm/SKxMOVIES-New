import React from 'react';
import { X, Film, Layers, Compass, Info, Send, ChevronRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  currentPath: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigate,
  currentPath
}) => {
  const { settings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-zinc-950 border-l border-zinc-800/80 h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-base tracking-tight">
              <span className="text-white">{settings.logoPrefixText || 'SK'}</span>
              <span className="text-amber-400">{settings.logoHighlightText || 'x'}</span>
              <span className="text-white">{settings.logoSuffixText || 'MOVIES'}</span>
            </div>
          </div>

          <button
            id="mobile-menu-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Direct Join Banner in Mobile Menu */}
        <div className="p-4 border-b border-zinc-900">
          <a
            id="mobile-menu-telegram-link"
            href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-500/30 text-sky-300"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-500/30 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-sky-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">Join Telegram Channel</p>
              <p className="text-[11px] text-sky-300/80 truncate">Fast mirrors & daily updates</p>
            </div>
          </a>
        </div>

        {/* Nav Links */}
        <div className="p-4 space-y-1 flex-1">
          <button
            id="mobile-nav-home"
            onClick={() => {
              navigate('/');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPath === '/' ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Film className="w-4 h-4 text-zinc-400" />
              <span>{settings.navHomeLabel || 'Home'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          <button
            id="mobile-nav-categories"
            onClick={() => {
              navigate('/categories');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPath.startsWith('/categor') ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span>{settings.navCategoriesLabel || 'Categories'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          <button
            id="mobile-nav-genres"
            onClick={() => {
              navigate('/genres');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPath.startsWith('/genre') ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-zinc-400" />
              <span>{settings.navGenresLabel || 'Genres'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          <button
            id="mobile-nav-about"
            onClick={() => {
              navigate('/about');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPath === '/about' ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-zinc-400" />
              <span>{settings.navAboutLabel || 'About'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          <button
            id="mobile-nav-support"
            onClick={() => {
              navigate('/support');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPath === '/support' ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4 text-sky-400" />
              <span>{settings.navSupportLabel || 'Telegram Support'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-900">
          <p className="text-[11px] text-center text-zinc-400">
            {settings.siteName} • Pure Cinema Hub
          </p>
        </div>
      </div>
    </div>
  );
};

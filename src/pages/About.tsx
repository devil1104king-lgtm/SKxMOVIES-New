import React from 'react';
import { Film, Send, ShieldCheck, Zap, Server, Globe } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { TelegramBannerCard } from '../components/common/TelegramBadge';

interface AboutProps {
  navigate: (path: string) => void;
}

export const About: React.FC<AboutProps> = ({ navigate }) => {
  const { settings } = useSettings();

  return (
    <div id="about-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 space-y-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">About the Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          {settings.aboutTitle || 'About SKxMOVIES'}
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
          {settings.aboutHeroText ||
            'SKxMOVIES was engineered to eliminate bloated ads, clunky email support, and slow loading times. We deliver instantaneous streaming links, pristine 4K video feeds, and direct Telegram community support.'}
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Cloudflare Edge Accelerated</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Optimized for ultra-low latency worldwide using Cloudflare Pages serverless edge runtime.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Send className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Direct Telegram Hub</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No antiquated contact forms or email blackholes. Real-time release pings and requests via Telegram.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Multi-Database Resiliency</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Engineered with CockroachDB distributed database clusters with failover and seamless storage expansion.
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-8 space-y-5 text-sm text-zinc-300 leading-relaxed">
        <h2 className="text-xl font-bold text-white">
          {settings.aboutHeroHeading || 'Redefining Cinema Access with Speed & Purity'}
        </h2>
        <p>
          {settings.aboutPageContent ||
            'SKxMOVIES is an enthusiast-run cinema archive designed from the ground up for movie lovers who value clean aesthetics, instant access, and high visual fidelity. We index publicly available streaming and download mirrors so cinephiles can discover and watch motion pictures without navigating intrusive spam networks.'}
        </p>
        <p>
          All content is organized with high-definition metadata, quality badges (4K Ultra-HD, 1080p FHD, 720p HD), IMDb metrics, and multi-track audio descriptions.
        </p>
      </div>

      {/* Telegram Community Card */}
      <TelegramBannerCard />
    </div>
  );
};

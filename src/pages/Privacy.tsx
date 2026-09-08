import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Privacy: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div id="privacy-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-zinc-900 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">User Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-400">
          How SKxMOVIES handles user privacy and browsing security.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information Collection</h2>
          <p>
            {settings.privacyPageContent ||
              'Your privacy is paramount. SKxMOVIES does not require user registration for viewing content, does not log personal information, and does not sell browsing data to advertising brokers.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Log Files & Analytics</h2>
          <p>
            Standard technical server logs may temporarily capture non-identifying technical data (e.g. browser user agent, IP address for rate-limiting and DDoS mitigation) strictly to maintain service stability and prevent abuse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Third-Party Links & Embeds</h2>
          <p>
            SKxMOVIES contains external video embeds and links to third-party file hosts. These external sites operate under their own independent privacy policies. We encourage users to practice safe web browsing habits and use privacy-focused browsers.
          </p>
        </section>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Terms: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div id="terms-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-zinc-900 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Terms & Conditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
        <p className="text-sm text-zinc-400">
          User agreement and guidelines for browsing SKxMOVIES.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            {settings.termsPageContent ||
              'By using SKxMOVIES, you acknowledge that all video embeds and links are provided for informational and indexing purposes.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Prohibited Uses</h2>
          <p>
            You agree not to scrape, flood, DDoS, or attempt unauthorized penetration testing against the application, its API endpoints, or its distributed database clusters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Disclaimer of Warranties</h2>
          <p>
            SKxMOVIES is provided on an "as-is" and "as-available" basis without any express or implied warranty of uptime, link persistence, or content availability.
          </p>
        </section>
      </div>
    </div>
  );
};

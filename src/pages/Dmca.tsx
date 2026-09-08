import React from 'react';
import { ShieldAlert, Send } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Dmca: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div id="dmca-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-zinc-900 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Legal Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {settings.dmcaPageTitle || 'DMCA & Content Disclaimer'}
        </h1>
        <p className="text-sm text-zinc-400">
          {settings.dmcaPageSubtitle || 'Copyright policy, third-party hosting notice, and takedown procedures.'}
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. External Hosting Notice</h2>
          <p>
            {settings.dmcaNoticeText ||
              'SKxMOVIES operates strictly as an indexer and directory of media content freely hosted across third-party websites on the World Wide Web. None of the video files or copyrighted media indexed on this website are uploaded, stored, or hosted on our servers or databases.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Copyright Protection & Takedown Requests</h2>
          <p>
            SKxMOVIES respects the intellectual property rights of others and strictly complies with the Digital Millennium Copyright Act (DMCA). If you are a copyright owner or authorized representative and believe any link indexed on our portal infringes upon your copyright, please notify our administrators.
          </p>
          <p>
            To submit an urgent takedown request, please contact our administrative team via Telegram with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>Identification of the copyrighted work claimed to have been infringed</li>
            <li>Exact URL link(s) on our portal where the indexed reference is located</li>
            <li>Sufficient contact information and authorized agent representation</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-400">Direct DMCA Notice via Telegram Channel/Admin:</p>
            <p className="text-sm font-bold text-sky-400">{settings.telegramChannel || '@skxmovies_official'}</p>
          </div>
          <a
            href={settings.telegramUrl || 'https://t.me/skxmovies_official'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Contact on Telegram</span>
          </a>
        </section>
      </div>
    </div>
  );
};

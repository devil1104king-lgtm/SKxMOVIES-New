import React from 'react';
import { HowToAccessStep } from '../../types';
import { CheckCircle2, ShieldCheck, HelpCircle, Send } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface HowToAccessGuideProps {
  title?: string;
  instructions?: string;
  steps?: HowToAccessStep[];
}

export const HowToAccessGuide: React.FC<HowToAccessGuideProps> = ({
  title,
  instructions,
  steps
}) => {
  const { settings } = useSettings();

  const defaultSteps: HowToAccessStep[] = [
    {
      stepNumber: 1,
      title: 'Select Stream Resolution',
      description: 'Choose between 4K Ultra HD for large screens, 1080p FHD for standard monitors, or 720p for data savings.'
    },
    {
      stepNumber: 2,
      title: 'Direct Browser Playback',
      description: 'Click Watch Stream to open high-speed HTML5 video streaming directly in your browser with zero plug-ins.'
    },
    {
      stepNumber: 3,
      title: 'High-Speed Single-Click Download',
      description: 'Use the Download button to save files offline with multi-threaded resume capability.'
    },
    {
      stepNumber: 4,
      title: 'Telegram Fast Mirror Support',
      description: 'Join our Telegram channel if you need alternate audio tracks, subtitles, or backup mirror links.'
    }
  ];

  const activeSteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <div id="how-to-access-guide" className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-6 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Step-by-Step Guide</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          {title || settings.howToAccessDefaultTitle || 'How to Watch & Download'}
        </h3>
        <p className="text-xs md:text-sm text-zinc-400 mt-1 leading-relaxed">
          {instructions ||
            settings.howToAccessDefaultInstructions ||
            'Follow these quick steps to watch or download in ultra-high definition without buffering or interruptions.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeSteps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 p-4 rounded-xl bg-zinc-900/40 border border-zinc-900"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
              {step.stepNumber || idx + 1}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

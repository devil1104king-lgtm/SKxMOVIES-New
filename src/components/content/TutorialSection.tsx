import React from 'react';
import { TutorialVideo } from '../../types';
import { Video, Play } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface TutorialSectionProps {
  tutorials: TutorialVideo[];
  title?: string;
}

export const TutorialSection: React.FC<TutorialSectionProps> = ({ tutorials, title }) => {
  const { settings } = useSettings();

  if (!tutorials || tutorials.length === 0) return null;

  return (
    <div id="tutorial-section" className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-amber-400" />
        <h3 className="text-xl font-bold text-white">
          {title || settings.tutorialDefaultTitle || 'Video Walkthrough & Tips'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorials.map((tut, i) => {
          let embedUrl = tut.videoUrl;
          if (embedUrl.includes('youtube.com/watch?v=')) {
            const id = embedUrl.split('v=')[1]?.split('&')[0];
            if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
          } else if (embedUrl.includes('youtu.be/')) {
            const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
            if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
          }

          return (
            <div key={i} className="rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-900 space-y-3 p-3">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  title={tut.title}
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="px-1">
                <h4 className="text-sm font-bold text-white">{tut.title}</h4>
                {tut.description && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{tut.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

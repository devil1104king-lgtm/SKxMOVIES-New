import React, { useState } from 'react';
import { BackgroundMotionStyle } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, Check, Flame, Waves, Eye, Compass, Moon } from 'lucide-react';

interface StyleOption {
  id: BackgroundMotionStyle;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  previewBg: string;
}

const MOTION_OPTIONS: StyleOption[] = [
  {
    id: 'cinematic-particles',
    name: 'Cinematic Particles & Golden Embers',
    tagline: 'Floating stardust and glowing embers on pitch black',
    description:
      'Realistic high-performance particle simulation with floating micro-embers, drifting stardust, and organic light pulsation.',
    badge: 'Popular & Recommended',
    previewBg: 'bg-gradient-to-br from-amber-950/40 via-black to-blue-950/40'
  },
  {
    id: 'aurora-glow',
    name: 'Cosmic Aurora & Biome Mesh',
    tagline: 'Smooth undulating cinematic lights and filmic color washes',
    description:
      'Deep cosmic indigo, bioluminescent emerald, and warm amber light cones drifting smoothly over pure black.',
    badge: 'Vibrant & Modern',
    previewBg: 'bg-gradient-to-br from-sky-900/40 via-black to-emerald-950/40'
  },
  {
    id: 'anamorphic-flares',
    name: 'Anamorphic 35mm Lens Flares',
    tagline: 'Cinema projector beams and horizontal anamorphic streaks',
    description:
      'Horizontal anamorphic lens light bars and drifting spotlight beams that simulate a classic 35mm / 70mm movie projector.',
    badge: 'Classic Cinema',
    previewBg: 'bg-gradient-to-r from-blue-950/40 via-amber-900/30 to-black'
  },
  {
    id: 'cosmic-constellation',
    name: 'Deep Star Constellations',
    tagline: 'Luminous star nodes interconnected with thin filaments',
    description:
      'Deep-space star nodes with subtle interactive filament lines connecting neighboring particles in the void.',
    badge: 'Deep Space Sci-Fi',
    previewBg: 'bg-gradient-to-br from-zinc-900/60 via-black to-indigo-950/40'
  },
  {
    id: 'pure-minimal',
    name: 'Pure Pitch-Black Minimalist',
    tagline: 'Obsidian void with optical cinema vignette',
    description:
      'Clean pure #000000 background with subtle film vignette and zero moving canvas particles for maximum battery saving.',
    badge: 'Minimalist & Fast',
    previewBg: 'bg-black'
  }
];

export const BackgroundMotionSelector: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [currentStyle, setCurrentStyle] = useState<BackgroundMotionStyle>(
    settings.backgroundStyle || 'cinematic-particles'
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApply = async (styleId: BackgroundMotionStyle) => {
    setCurrentStyle(styleId);
    setSaving(true);
    try {
      await updateSettings({ backgroundStyle: styleId });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update background motion style:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="background-motion-selector" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Background Motion Style Selector</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Choose a realistic cinematic background motion style to apply site-wide across all pages.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 animate-in fade-in">
            <Check className="w-4 h-4" />
            Applied Site-Wide!
          </span>
        )}
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOTION_OPTIONS.map(opt => {
          const isSelected = (settings.backgroundStyle || 'cinematic-particles') === opt.id;
          return (
            <div
              key={opt.id}
              id={`motion-style-card-${opt.id}`}
              onClick={() => handleApply(opt.id)}
              className={`group cursor-pointer relative rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-zinc-950 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-zinc-950/80 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50'
              }`}
            >
              {/* Subtle visual representation background */}
              <div className={`absolute inset-0 opacity-40 pointer-events-none ${opt.previewBg}`} />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {opt.badge}
                  </span>

                  {isSelected ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Check className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Click to Apply
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {opt.name}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium mt-0.5">{opt.tagline}</p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{opt.description}</p>
              </div>

              <div className="relative z-10 pt-4 border-t border-zinc-900 mt-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-500">Pure Black Foundation: #000000</span>
                <button
                  type="button"
                  disabled={saving}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : 'Select Style'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

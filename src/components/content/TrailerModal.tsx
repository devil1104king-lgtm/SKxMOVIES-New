import React from 'react';
import { X, Film } from 'lucide-react';

interface TrailerModalProps {
  trailerUrl: string;
  title: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, title, onClose }) => {
  // Convert standard YouTube watch URLs to embed format if needed
  let embedUrl = trailerUrl;
  if (trailerUrl.includes('youtube.com/watch?v=')) {
    const videoId = trailerUrl.split('v=')[1]?.split('&')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (trailerUrl.includes('youtu.be/')) {
    const videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden z-10 shadow-2xl animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white truncate max-w-md">
              Official Trailer: {title}
            </h3>
          </div>
          <button
            id="trailer-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

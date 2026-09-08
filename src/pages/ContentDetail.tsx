import React, { useEffect, useState } from 'react';
import { ContentItem } from '../types';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { AccessSection } from '../components/content/AccessSection';
import { HowToAccessGuide } from '../components/content/HowToAccessGuide';
import { TutorialSection } from '../components/content/TutorialSection';
import { TrailerModal } from '../components/content/TrailerModal';
import { TelegramBannerCard } from '../components/common/TelegramBadge';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Volume2,
  Users,
  Video,
  Share2,
  Send,
  Play,
  Check,
  Film
} from 'lucide-react';

interface ContentDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ContentDetail: React.FC<ContentDetailProps> = ({ slug, navigate }) => {
  const { settings } = useSettings();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const item = await api.getContentBySlug(slug);
        setContent(item);
      } catch (err: any) {
        console.error('Failed to fetch content details:', err);
        setError(err.message || 'Movie not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: content?.title || 'Watch on SKxMOVIES',
          text: `Stream ${content?.title} in 4K UHD on SKxMOVIES:`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Accessing cinema vault...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Title Not Located</h2>
        <p className="text-sm text-zinc-400 mb-6">{error || 'This title could not be found in our database.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm"
        >
          {settings.backToLibraryText || 'Back to Library'}
        </button>
      </div>
    );
  }

  const bgImage = content.backdropUrl || content.posterUrl;

  return (
    <div id="content-detail-page" className="pb-24 space-y-12">
      {/* Top Hero Backdrop & Meta Info */}
      <div className="relative w-full min-h-[500px] lg:min-h-[560px] flex items-end overflow-hidden">
        {/* Background Image with Deep Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt={content.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.4] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            id="detail-back-btn"
            onClick={() => navigate(-1 as any)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{settings.backToLibraryText || 'Back to Library'}</span>
          </button>
        </div>

        {/* Content Details in Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Poster Card */}
            <div className="w-44 sm:w-56 md:w-64 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl shrink-0">
              <img
                src={content.posterUrl}
                alt={content.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-4 max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {content.categoryName || 'Cinema Release'}
                </span>

                {content.tags && content.tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-800">
                    {t}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {content.title}
              </h1>

              {/* Quick Spec Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
                {content.rating && (
                  <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{content.rating}</span>
                  </div>
                )}
                {content.releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{content.releaseDate}</span>
                  </div>
                )}
                {content.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{content.duration}</span>
                  </div>
                )}
                {content.language && (
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{content.language}</span>
                  </div>
                )}
                {content.genres && (
                  <div className="text-zinc-400">
                    {content.genres.join(' • ')}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                {content.description}
              </p>

              {/* Director & Cast */}
              {(content.director || (content.cast && content.cast.length > 0)) && (
                <div className="pt-2 space-y-1.5 text-xs text-zinc-400 border-t border-zinc-900">
                  {content.director && (
                    <p>
                      <span className="font-semibold text-zinc-300">Director: </span>
                      {content.director}
                    </p>
                  )}
                  {content.cast && content.cast.length > 0 && (
                    <p>
                      <span className="font-semibold text-zinc-300">Starring: </span>
                      {content.cast.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  id="detail-stream-jump-btn"
                  href="#access-section"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Choose Streaming Server</span>
                </a>

                {content.trailerUrl && (
                  <button
                    id="detail-trailer-btn"
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition-all"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  id="detail-share-btn"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied!' : (settings.shareBtnText || 'Share Movie')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Stream & Download Mirrors Section */}
        <AccessSection
          accessOptions={content.accessOptions || []}
          title={content.title}
        />

        {/* How to Access Step-by-Step Instructions */}
        <HowToAccessGuide
          title={content.howToAccessTitle}
          instructions={content.howToAccessInstructions}
          steps={content.howToAccessSteps}
        />

        {/* Video Tutorial Section (if present) */}
        {content.tutorialVideos && content.tutorialVideos.length > 0 && (
          <TutorialSection
            tutorials={content.tutorialVideos}
            title={content.tutorialTitle}
          />
        )}

        {/* Telegram Banner Support Card */}
        <TelegramBannerCard />
      </div>

      {/* Trailer Modal */}
      {showTrailer && content.trailerUrl && (
        <TrailerModal
          trailerUrl={content.trailerUrl}
          title={content.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

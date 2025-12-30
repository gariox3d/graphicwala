import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const BANNER_DISMISSED_KEY = 'announcement_banner_dismissed';

const AnnouncementBanner = () => {
  const { settings, loading } = useStoreSettings();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed for this specific message
    const dismissedText = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedText === settings?.announcement_text) {
      setDismissed(true);
    }
  }, [settings?.announcement_text]);

  const handleDismiss = () => {
    if (settings?.announcement_text) {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, settings.announcement_text);
    }
    setDismissed(true);
  };

  // Don't show if loading, disabled, no text, or dismissed
  if (loading || !settings?.announcement_enabled || !settings?.announcement_text || dismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-2.5 px-4 overflow-hidden">
      {/* Subtle animated background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      
      <div className="container relative flex items-center justify-center gap-3">
        <p className="text-sm font-medium text-center flex-1 pr-8">
          {settings.announcement_text}
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBanner;

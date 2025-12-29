import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Check } from 'lucide-react';

const WELCOME_POPUP_KEY = 'welcome_popup_shown_session';

const WelcomeBackPopup: React.FC = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Only show if user is authenticated
    if (!user) {
      // Clear the flag when user logs out
      sessionStorage.removeItem(WELCOME_POPUP_KEY);
      return;
    }

    // Check if popup was already shown this session
    const alreadyShown = sessionStorage.getItem(WELCOME_POPUP_KEY);
    if (alreadyShown) return;

    // Show popup and mark as shown
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(WELCOME_POPUP_KEY, 'true');
    }, 300); // Small delay for smooth UX

    return () => clearTimeout(timer);
  }, [user, loading]);

  useEffect(() => {
    if (isOpen) {
      // Auto close after 2.5 seconds
      const autoCloseTimer = setTimeout(() => {
        setIsOpen(false);
      }, 2500);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen]);

  // Don't render anything during loading or if no user
  if (loading || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          
          {/* Animated glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Success icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-6 ring-4 ring-primary/10">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                <Check className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
            
            {/* Welcome text */}
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              Welcome back <span className="text-2xl">👋</span>
            </h2>
            
            <p className="text-muted-foreground mb-4">
              You're securely logged in.
            </p>
            
            <p className="text-sm text-muted-foreground/80 flex items-center justify-center gap-1">
              Let's continue where you left off 
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </p>
            
            {/* Progress bar for auto-close */}
            <div className="mt-6 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                style={{
                  animation: 'shrink 2.5s linear forwards',
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </Dialog>
  );
};

export default WelcomeBackPopup;

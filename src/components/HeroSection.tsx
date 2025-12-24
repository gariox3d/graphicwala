import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Award, Heart, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const heroHeadlines = [
  "Turn Your Memories into Beautiful Gifts 🎁",
  "Photo Frames, PVC Cards & Personalized Gifts",
  "Perfect Gifts for Every Special Moment",
  "Custom Printed with Love ❤️",
];

const trustBadges = [
  { icon: Truck, text: "All India Delivery" },
  { icon: Award, text: "Premium Quality" },
  { icon: Heart, text: "100% Custom Made" },
  { icon: CreditCard, text: "Prepaid Only" },
];

const HeroSection = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % heroHeadlines.length);
        setIsAnimating(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="relative min-h-[90vh] md:min-h-[85vh] flex items-center bg-foreground text-background overflow-hidden"
      aria-label="Graphic Wala - Custom Printing Store Bihar"
    >
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/95" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container relative z-10 py-16 md:py-24">
        <header className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold mb-8 animate-fade-in backdrop-blur-sm">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Bihar's Favorite Custom Printing Store
          </span>

          {/* Animated Headline - H1 for SEO */}
          <div className="h-[120px] md:h-[160px] flex items-center justify-center mb-6">
            <h1 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-background transition-all duration-500 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
              {heroHeadlines[currentHeadline]}
            </h1>
          </div>

          {/* Sub-heading with SEO keywords */}
          <h2 
            className="text-lg md:text-xl lg:text-2xl text-background/90 mb-6 max-w-3xl mx-auto animate-fade-in font-medium px-4"
            style={{ animationDelay: '0.2s', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            Custom Photo Frames, PVC Cards, ID Cards & Keychains —
            <br className="hidden md:block" />
            <span className="text-primary font-semibold">Personalized Gifts Delivered Across Bihar 🇮🇳</span>
          </h2>

          {/* Emotional Quote */}
          <blockquote 
            className="text-base md:text-lg text-background/70 italic mb-10 max-w-2xl mx-auto animate-fade-in px-4"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="text-primary/80">"</span>
            Because the best gifts are not bought,
            <br className="hidden sm:block" />
            they are created with memories.
            <span className="text-primary/80">"</span>
          </blockquote>

          {/* Trust Badges */}
          <div 
            className="flex flex-wrap justify-center gap-3 md:gap-6 mb-10 animate-fade-in px-4"
            style={{ animationDelay: '0.5s' }}
            role="list"
            aria-label="Store features"
          >
            {trustBadges.map((badge) => (
              <div 
                key={badge.text}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-background/10 border border-background/20 backdrop-blur-sm"
                role="listitem"
              >
                <badge.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium text-background/90">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <nav 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in px-4"
            style={{ animationDelay: '0.6s' }}
            aria-label="Shop actions"
          >
            <Link to="/products" aria-label="Create your personalized gift">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1"
              >
                Create Your Gift
                <ArrowRight className="h-5 w-5 ml-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/products" aria-label="Browse gift categories">
              <Button 
                variant="outline" 
                size="xl"
                className="w-full sm:w-auto border-2 border-background/40 bg-background/10 text-background hover:bg-background hover:text-foreground font-bold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
              >
                Browse Gift Categories
              </Button>
            </Link>
          </nav>

          {/* SEO Content - Hidden visually but readable by search engines */}
          <p className="sr-only">
            Graphic Wala Store offers premium custom printing services in Bihar including personalized photo frames, 
            PVC card printing, ID card printing, visiting card printing, and keychain printing. 
            We provide home delivery across Bihar with prepaid orders only. 
            Order your custom printed gifts online and get them delivered to your doorstep.
          </p>
        </header>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block" aria-hidden="true">
          <div className="w-6 h-10 rounded-full border-2 border-background/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-background/50 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

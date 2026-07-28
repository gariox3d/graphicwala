import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, Star, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';

const heroSubtexts = [
  "Photo Frames, framed forever",
  "PVC Cards & Keychains, your story",
  "Visiting Cards that speak for you",
  "Premium Print. Prepaid. All India.",
];

const trustBadges = [
  { icon: Truck, text: "All-India Delivery" },
  { icon: Shield, text: "Premium Print" },
  { icon: CreditCard, text: "Prepaid & Secure" },
];

const HeroSection = () => {
  const [currentSubtext, setCurrentSubtext] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const { settings, isThemeActive } = useFestivalSettings();
  const festivalActive = isThemeActive();
  const { data: showcase } = useHeroShowcase();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentSubtext((prev) => (prev + 1) % heroSubtexts.length);
        setIsAnimating(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const card = {
    collection_label: showcase?.collection_label || 'COLLECTION 01',
    eyebrow: showcase?.eyebrow || 'YOUR PHOTO',
    title: showcase?.title || 'A moment,\nframed forever.',
    price_prefix: showcase?.price_prefix || 'STARTS AT',
    price_label: showcase?.price_label || '₹99',
    rating_value: showcase?.rating_value || '4.9 / 5',
    rating_subtitle: showcase?.rating_subtitle || '10K+ ORDERS',
    image_url: showcase?.image_url || null,
    is_active: showcase?.is_active !== false,
  };

  return (
    <section
      className="relative bg-white overflow-hidden"
      aria-label="Graphic Wala - Custom Printing Store India"
    >
      {/* Subtle editorial grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="container relative z-10 py-10 md:py-16">
        {/* Brand row — logo + brand name always on one line */}
        <div className="flex items-center gap-2 mb-6 whitespace-nowrap">
          <div className="w-8 h-8 shrink-0 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground shrink-0">
            Graphic Wala
          </span>
          <span className="ml-2 hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
            <Sparkles className="h-3 w-3 text-primary" /> Custom Print Studio
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: editorial copy */}
          <header className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              India's Favourite Custom Gift Studio
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-foreground mb-5">
              Your Memories,
              <br />
              <span className="relative inline-block">
                <span
                  className={`text-primary transition-all duration-500 ${
                    isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                  }`}
                >
                  {heroSubtexts[currentSubtext]}
                </span>
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Personalised photo frames, PVC cards, keychains & gifts —
              printed with premium quality and delivered across India.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Start Creating
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto rounded-full border-2 border-foreground/15 hover:bg-muted font-semibold"
                >
                  Browse Categories
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <badge.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </header>

          {/* Right: showcase card */}
          {card.is_active && (
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md">
                {/* Rating chip */}
                <div className="absolute -top-4 right-2 sm:right-6 z-20 bg-foreground text-background rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2 animate-fade-in">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <div className="leading-tight">
                    <div className="text-sm font-bold">{card.rating_value}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-80">
                      {card.rating_subtitle}
                    </div>
                  </div>
                </div>

                {/* Card */}
                <div className="relative rounded-[2rem] border border-foreground/10 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] overflow-hidden aspect-[4/5]">
                  <div className="absolute top-5 left-5 z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/90 border border-foreground/10 text-[11px] font-bold tracking-widest text-foreground">
                      {card.collection_label}
                    </span>
                  </div>

                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-gradient-to-b from-white to-muted/40">
                      <div className="text-xs font-bold tracking-[0.25em] text-primary mb-3">
                        {card.eyebrow}
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight whitespace-pre-line">
                        {card.title}
                      </h2>
                      <div className="w-16 h-0.5 bg-primary mt-6" />
                    </div>
                  )}
                </div>

                {/* Price chip */}
                <div className="absolute -bottom-4 left-2 sm:-left-4 z-20 bg-white border border-foreground/10 rounded-2xl px-4 py-2 shadow-xl animate-fade-in">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {card.price_prefix}
                  </div>
                  <div className="text-xl font-black text-foreground leading-none">
                    {card.price_label}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {festivalActive && settings?.show_countdown && settings?.end_date && (
          <div className="mt-10">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}

        <p className="sr-only">
          Graphic Wala offers custom printing across India — personalised photo frames,
          PVC cards, ID cards, visiting cards and keychains with premium print quality and prepaid delivery.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;

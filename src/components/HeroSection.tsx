import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';

const DEFAULT_HERO_IMAGE = '/images/hero-products.jpg';

const HeroSection = () => {
  const { settings, isThemeActive } = useFestivalSettings();
  const festivalActive = isThemeActive();
  const { data: showcase } = useHeroShowcase();

  const card = {
    title: showcase?.title || 'Personalized Gifts\nMade for You',
    subtitle: showcase?.eyebrow || 'Custom Photo Frames, Mugs, T-Shirts & Keychains',
    rating_value: showcase?.rating_value || '4.9 / 5',
    rating_subtitle: showcase?.rating_subtitle || '10K+ Orders',
    price_prefix: showcase?.price_prefix || 'STARTS AT',
    price_label: showcase?.price_label || '₹99',
    image_url: showcase?.image_url || DEFAULT_HERO_IMAGE,
    is_active: showcase?.is_active !== false,
  };

  return (
    <section
      className="relative bg-white overflow-hidden"
      aria-label="Graphicwala - Custom Printing Store India"
    >
      <div className="container relative z-10 py-8 md:py-12 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left: sales copy */}
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Trusted by 10,000+ Happy Customers
            </div>

            <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.85rem] font-black leading-[1.08] tracking-tight text-foreground mb-3">
              Custom Photo Frames, Mugs, T-Shirts &amp;{' '}
              <span className="text-primary">Personalized Gifts</span> Delivered Across India
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-5 leading-relaxed">
              Upload your photo and we print it beautifully on premium products — shipped to your doorstep in 24-48 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto mb-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-2 border-foreground/10 font-semibold hover:bg-muted transition-all"
                >
                  Explore Categories
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                All India Delivery
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Secure Payment
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Quality Assured
              </span>
            </div>
          </header>

          {/* Right: product visual */}
          {card.is_active && (
            <div className="relative flex justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px]">
                {/* Rating chip */}
                <div className="absolute -top-3 right-2 sm:right-4 z-20 bg-foreground text-background rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2 animate-fade-in">
                  <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                  <div className="leading-tight">
                    <div className="text-sm font-bold">{card.rating_value}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-80">
                      {card.rating_subtitle}
                    </div>
                  </div>
                </div>

                {/* Product visual */}
                <div className="relative rounded-3xl border border-foreground/10 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] overflow-hidden aspect-square">
                  <SmartImage
                    src={card.image_url}
                    alt={card.title.replace('\n', ' ')}
                    className="absolute inset-0 w-full h-full object-cover"
                    widths={[320, 480, 640, 800, 1024]}
                    fallbackWidth={800}
                    quality={80}
                    resize="cover"
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 400px, 460px"
                    priority
                    width={1024}
                    height={1024}
                  />
                </div>

                {/* Price chip */}
                <div className="absolute -bottom-3 left-2 sm:-left-3 z-20 bg-white border border-foreground/10 rounded-2xl px-4 py-2 shadow-xl animate-fade-in">
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
          <div className="mt-8 md:mt-10">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, BadgeCheck, Star, ArrowRight } from 'lucide-react';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEFAULT_HERO_IMAGE = '/images/hero-products.jpg';

const HeroSection = () => {
  const { settings, isThemeActive } = useFestivalSettings();
  const festivalActive = isThemeActive();
  const { data: showcase } = useHeroShowcase();

  const card = {
    rating_value: showcase?.rating_value || '4.9 / 5',
    rating_subtitle: showcase?.rating_subtitle || '10K+ Orders',
    price_prefix: showcase?.price_prefix || 'Starts at',
    price_label: showcase?.price_label || '₹99',
    image_url: showcase?.image_url || DEFAULT_HERO_IMAGE,
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      aria-label="Graphicwala — premium custom printing store India"
    >
      {/* Soft ambient wash — clean, modern, no busy photo background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_10%,hsl(var(--primary)/0.10),transparent_65%),radial-gradient(50%_50%_at_0%_100%,hsl(var(--muted)),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <div className="grid items-center gap-10 lg:gap-16 py-12 sm:py-16 lg:py-24 lg:grid-cols-2">
          {/* Copy */}
          <header className="text-center lg:text-left animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Premium Custom Printing
            </span>

            <h1 className="mt-6 font-display italic font-semibold leading-[1.06] tracking-tight text-[2.3rem] sm:text-5xl lg:text-6xl text-foreground">
              Moments,
              <br />
              <span className="text-primary">Elegantly Captured.</span>
            </h1>

            <p className="mt-5 mx-auto lg:mx-0 max-w-md text-sm sm:text-base leading-relaxed text-muted-foreground">
              Custom photo frames, mugs, t-shirts and keychains — crafted with a premium finish and delivered across India in 24–48 hours.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link
                to="/products"
                className={cn(buttonVariants({ variant: 'hero', size: 'xl' }), 'group w-full sm:w-auto gap-2 rounded-full text-sm tracking-[0.06em]')}
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <div className="inline-flex items-center gap-2.5 text-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{card.rating_value}</span>
                <span className="h-3 w-px bg-border" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{card.rating_subtitle}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                All India Delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Secure Payment
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Quality Assured
              </span>
            </div>
          </header>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none animate-scale-in">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-brand">
              <SmartImage
                src={card.image_url}
                alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
                className="aspect-[4/5] lg:aspect-[5/5] h-full w-full object-cover object-center"
                widths={[480, 720, 960, 1280]}
                fallbackWidth={960}
                quality={85}
                resize="cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
                width={960}
                height={1200}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/35 to-transparent" aria-hidden="true" />
            </div>

            {/* Floating price chip */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 rounded-full border border-border bg-card px-5 py-3 shadow-brand">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{card.price_prefix}</span>
              <span className="ml-2 text-base font-bold text-foreground">{card.price_label}</span>
            </div>
          </div>
        </div>

        {festivalActive && settings?.show_countdown && settings?.end_date && (
          <div className="pb-12">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, Star, ArrowRight, Sparkles } from 'lucide-react';
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
      {/* Soft ambient wash — premium, clean, no busy photo background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_88%_10%,hsl(var(--primary)/0.10),transparent_62%),radial-gradient(50%_50%_at_0%_100%,hsl(var(--muted)),transparent_72%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 py-10 sm:py-14 lg:py-20 xl:py-24">
        <div className="grid items-center gap-10 lg:gap-16 xl:gap-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* Copy */}
          <header className="text-center lg:text-left animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              Premium Custom Printing
            </span>

            <h1 className="mt-6 font-outfit text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.2rem] xl:text-[5.2rem] 2xl:text-[5.8rem]">
              Moments,
              <br />
              <span className="text-primary">Elegantly Captured.</span>
            </h1>

            <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-base sm:text-lg xl:text-xl font-light leading-relaxed text-muted-foreground">
              Quality products, carefully crafted and delivered across India.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link
                to="/products"
                className={cn(
                  buttonVariants({ variant: 'hero', size: 'xl' }),
                  'group w-full sm:w-auto gap-2 rounded-full text-base tracking-wide'
                )}
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <Link
                to="/about"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xl' }),
                  'w-full sm:w-auto rounded-full text-base'
                )}
              >
                Learn More
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-4 py-2 text-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                <span className="text-sm font-bold">{card.rating_value}</span>
                <span className="h-3.5 w-px bg-border" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {card.rating_subtitle}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Premium Quality
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Secure Payment
              </span>
            </div>
          </header>

          {/* Visual — full product visible, never cropped */}
          <div className="relative animate-scale-in">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-md xl:max-w-lg rounded-[2rem] border border-border bg-card p-3 sm:p-4 xl:p-5 shadow-brand">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-white">
                <SmartImage
                  src={card.image_url}
                  alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
                  className="h-auto w-full object-contain bg-white"
                  widths={[480, 720, 960, 1280, 1600]}
                  fallbackWidth={1280}
                  quality={88}
                  resize="contain"
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  priority
                  width={1280}
                  height={1000}
                />
              </div>

              {/* Floating price chip */}
              <div className="absolute -bottom-4 left-6 sm:left-10 rounded-full border border-border bg-card px-5 py-3 shadow-brand">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {card.price_prefix}
                </span>
                <span className="ml-2 text-base font-bold text-foreground">{card.price_label}</span>
              </div>
            </div>
          </div>
        </div>

        {festivalActive && settings?.show_countdown && settings?.end_date && (
          <div className="mt-12">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

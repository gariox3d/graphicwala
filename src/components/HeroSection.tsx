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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_85%_15%,hsl(var(--primary)/0.10),transparent_60%),radial-gradient(45%_45%_at_0%_100%,hsl(var(--muted)),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 py-8 sm:py-10 lg:py-14 xl:py-16">
        <div className="mx-auto w-full max-w-6xl xl:max-w-none overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-brand">
          <div className="grid items-center lg:grid-cols-2">
            {/* Copy */}
            <header className="p-8 sm:p-10 lg:p-12 xl:p-16 2xl:p-20 text-center lg:text-left animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                Premium Custom Printing
              </span>

              <h1 className="mt-5 font-outfit text-[2rem] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground sm:text-4xl lg:text-[2.6rem] xl:text-[3rem] 2xl:text-[3.3rem]">
                Moments,
                <br />
                <span className="text-primary">Elegantly Captured.</span>
              </h1>

              <p className="mt-4 mx-auto lg:mx-0 max-w-md xl:max-w-lg text-xs sm:text-sm xl:text-base font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Quality products, carefully crafted and delivered across India.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className={cn(
                    buttonVariants({ variant: 'hero', size: 'lg' }),
                    'group w-full sm:w-auto gap-2 rounded-full text-sm tracking-wide'
                  )}
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>

                <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-4 py-2 text-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                  <span className="text-sm font-bold">{card.rating_value}</span>
                  <span className="h-3.5 w-px bg-border" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {card.rating_subtitle}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Premium Quality
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Secure Payment
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Made in India
                </span>
              </div>
            </header>

            {/* Visual */}
            <div className="relative h-64 sm:h-80 lg:h-auto lg:min-h-[460px] xl:min-h-[520px] bg-white animate-scale-in">
              <SmartImage
                src={card.image_url}
                alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
                className="absolute inset-0 h-full w-full object-contain object-center p-3 sm:p-4"
                widths={[480, 720, 960, 1280]}
                fallbackWidth={960}
                quality={85}
                resize="contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                width={960}
                height={1200}
              />

              {/* Floating price chip */}
              <div className="absolute bottom-5 right-5 rounded-full border border-border bg-card px-5 py-2.5 shadow-brand">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {card.price_prefix}
                </span>
                <span className="ml-2 text-base font-bold text-foreground">{card.price_label}</span>
              </div>
            </div>
          </div>
        </div>

        {festivalActive && settings?.show_countdown && settings?.end_date && (
          <div className="mt-10">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

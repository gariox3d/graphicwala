import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { waLink } from '@/components/services/ServiceBlocks';
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_88%_10%,hsl(var(--primary)/0.10),transparent_62%),radial-gradient(50%_50%_at_0%_100%,hsl(var(--muted)),transparent_72%)] animate-hero-loop-glow"
        aria-hidden="true"
      />

      <div className="container relative z-10 py-10 sm:py-14 lg:py-20 xl:py-24">
        <div className="grid items-center gap-10 lg:gap-16 xl:gap-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* Copy */}
          <header className="text-center lg:text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              Graphic Wala · डिजाइन की नई पहचान
            </span>

            <h1 className="mt-6 font-outfit text-[2.6rem] font-black leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.2rem] xl:text-[5rem]">
              <span className="block">DESIGN.</span>
              <span className="block text-primary">PRINT.</span>
              <span className="block">CUSTOMIZE.</span>
            </h1>

            <p className="mt-6 mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Graphic design, business printing, wedding cards and personalised products — from idea to doorstep.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/design-print"
                className={cn(
                  buttonVariants({ variant: 'hero', size: 'xl' }),
                  'group w-full sm:w-auto gap-2 rounded-full text-base tracking-wide'
                )}
              >
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <a
                href={waLink('Hello Graphic Wala, I want to place an order.')}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xl' }),
                  'w-full sm:w-auto gap-2 rounded-full text-base'
                )}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Order on WhatsApp
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Design approval before print
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Secure Payment
              </span>
            </div>
          </header>

          {/* Visual — full product visible, no outer box */}
          <div className="relative animate-hero-slow-scale">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-[46rem] animate-hero-float">
              <SmartImage
                src={card.image_url}
                alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
                className="h-auto w-full object-contain"
                widths={[480, 720, 960, 1280, 1600, 1920]}
                fallbackWidth={1600}
                quality={96}
                resize="contain"
                sizes="(max-width: 1024px) 92vw, 50vw"
                priority
                width={1600}
                height={1200}
              />

              {/* Floating price chip */}
              <div className="absolute -bottom-2 left-4 sm:left-8 rounded-full border border-border bg-card px-5 py-3 shadow-brand animate-hero-chip-pulse">
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

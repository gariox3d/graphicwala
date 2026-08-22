import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, BadgeCheck, Star } from 'lucide-react';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';

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
      className="relative w-full overflow-hidden bg-foreground"
      aria-label="Graphicwala — premium custom printing store India"
    >
      {/* Full-bleed editorial image */}
      <div className="absolute inset-0">
        <SmartImage
          src={card.image_url}
          alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
          className="h-full w-full object-cover object-center scale-[1.02] motion-safe:animate-[heroZoom_14s_ease-out_forwards]"
          widths={[640, 960, 1280, 1600, 1920]}
          fallbackWidth={1280}
          quality={78}
          resize="cover"
          sizes="100vw"
          priority
          width={1920}
          height={1080}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/45 to-foreground/25 lg:bg-gradient-to-r lg:from-foreground/90 lg:via-foreground/55 lg:to-foreground/10"
          aria-hidden="true"
        />
      </div>

      <div className="container relative z-10">
        <div className="flex min-h-[520px] sm:min-h-[600px] lg:min-h-[min(86vh,760px)] flex-col justify-end lg:justify-center py-12 lg:py-20">
          <header className="max-w-xl animate-fade-in">
            <span className="eyebrow !text-background/75 block mb-4">Premium Custom Printing</span>

            <h1 className="font-display italic font-semibold text-background leading-[1.08] tracking-tight text-[2.4rem] sm:text-5xl lg:text-6xl mb-5">
              Moments,
              <br />
              Elegantly Captured.
            </h1>

            <p className="text-sm sm:text-base text-background/80 max-w-md leading-relaxed mb-8">
              Custom photo frames, mugs, t-shirts and keychains — crafted with premium finish and delivered across India in 24-48 hours.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center bg-background text-foreground px-9 py-4 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-500 hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                Shop the Collection
              </Link>

              <div className="inline-flex items-center gap-2.5 text-background/85">
                <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{card.rating_value}</span>
                <span className="h-3 w-px bg-background/30" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.18em]">{card.rating_subtitle}</span>
              </div>
            </div>

            {/* Trust line */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-background/70">
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

            <p className="mt-6 text-background/70 text-[11px] uppercase tracking-[0.2em]">
              {card.price_prefix} <span className="text-background font-bold text-base tracking-normal ml-1">{card.price_label}</span>
            </p>
          </header>

          {festivalActive && settings?.show_countdown && settings?.end_date && (
            <div className="mt-10">
              <EidCountdown endDate={settings.end_date} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

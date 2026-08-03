import { Link } from 'react-router-dom';
import { ArrowRight, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

const HeroSection = () => {
  const { settings, isThemeActive } = useFestivalSettings();
  const festivalActive = isThemeActive();
  const { data: showcase } = useHeroShowcase();

  const whatsappUrl = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME}, I want to order a custom product.`,
  )}`;

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
      aria-label="Graphicwala - Custom Printing Store India"
    >
      <div className="container relative z-10 py-10 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: sales copy */}
          <header className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Trusted by 10,000+ happy customers
            </div>

            <h1 className="text-[2rem] sm:text-5xl lg:text-[3.4rem] font-black leading-[1.06] tracking-tight text-foreground mb-4">
              <span className="block text-base md:text-lg font-bold text-primary mb-2">Graphicwala</span>
              Custom Photo Frames, PVC Cards &amp;{' '}
              <span className="text-primary">Personalized Gifts</span> Delivered Across India
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-7 leading-relaxed">
              Upload your photo, we print it beautifully and ship it to your doorstep — photo frames,
              PVC cards, ID cards, visiting cards and keychains, made to order.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Shop Bestsellers
                  <ArrowRight className="h-5 w-5 ml-1" aria-hidden="true" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-2 border-foreground/15 font-semibold hover:bg-muted"
                >
                  <MessageCircle className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
                  WhatsApp to Order
                </Button>
              </a>
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

      </div>
    </section>
  );
};

export default HeroSection;

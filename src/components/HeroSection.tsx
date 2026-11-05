import SmartImage from '@/components/SmartImage';
import {
  ShieldCheck,
  BadgeCheck,
  Star,
  ArrowRight,
  MessageCircle,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';

const DEFAULT_HERO_IMAGE = '/images/hero-products.jpg';

const QUICK_CATEGORIES = [
  { label: 'Photo Frames & Mugs', dot: 'bg-[#00AEEF]' },
  { label: 'T-Shirts & Keychains', dot: 'bg-[#E6007E]' },
  { label: 'Billbook & Letterpad', dot: 'bg-[#FFED00] border border-slate-400' },
  { label: 'Handbill & Posters', dot: 'bg-[#0F172A]' },
  { label: 'Wedding Cards & Invites', dot: 'bg-[#E6007E]' },
];

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

  const cleanPhone = (WHATSAPP_NUMBER || '916207142994').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME || 'GraphicWala'}, I want to order custom printing / personalized gifts. Please share details.`
  )}`;
  const callUrl = `tel:+${cleanPhone}`;

  return (
    <section
      className="relative w-full overflow-hidden bg-white border-b border-slate-200/80"
      aria-label="GraphicWala (Graphic Wala) — Official Custom Printing, Sublimation Gifts & Branding Studio"
    >
      {/* Subtle 4-Color CMYK Light Ambient Glows on Crisp White Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_10%_15%,rgba(0,174,239,0.08),transparent_70%),radial-gradient(45%_45%_at_90%_20%,rgba(230,0,126,0.07),transparent_70%),radial-gradient(40%_40%_at_50%_95%,rgba(255,237,0,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 py-10 sm:py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:gap-14 xl:gap-20 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          {/* Left Content Column */}
          <header className="text-center lg:text-left">
            {/* Official CMYK 4-Dots Brand Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/90 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#0F172A] shadow-sm">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00AEEF]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E6007E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFED00] border border-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#0F172A]" />
              </span>
              <span>PRINTING • DESIGN • BRANDING</span>
            </div>

            {/* SEO-Optimized Brand & Service H1 Heading */}
            <h1 className="mt-5 font-outfit text-[2.35rem] font-black leading-[1.08] tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              <span className="block">
                Graphic<span className="text-[#E6007E]">Wala</span> Custom
              </span>
              <span className="block mt-1">
                <span className="text-[#00AEEF]">Sublimation Gifts</span> &amp;{' '}
                <span className="underline decoration-[#FFED00] decoration-4 underline-offset-4">
                  Printing Hub
                </span>
              </span>
            </h1>

            {/* Complete Service Description */}
            <p className="mt-5 mx-auto lg:mx-0 max-w-2xl text-sm sm:text-base xl:text-lg font-medium leading-relaxed text-slate-600">
              Order personalized <strong className="text-[#0F172A]">Photo Frames, Mugs, T-Shirts, Keychains &amp; PVC Cards</strong> along with complete commercial printing —{' '}
              <strong className="text-[#0F172A]">Billbooks, Letterpads, Handbills, Posters &amp; Wedding Invitations</strong>. Share your photos on WhatsApp and check your live design preview before printing!
            </p>

            {/* Quick Category Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {QUICK_CATEGORIES.map(item => (
                <a
                  key={item.label}
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#00AEEF] px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition"
                >
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>

            {/* Direct WhatsApp, Call & Browse Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-emerald-500/25 transition"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>Order on WhatsApp</span>
              </a>

              <a
                href={callUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F172A] bg-white hover:bg-[#0F172A] text-[#0F172A] hover:text-white px-5 py-3.5 text-sm sm:text-base font-extrabold transition"
              >
                <Phone className="h-4 w-4 text-[#E6007E]" aria-hidden="true" />
                <span>Call for Enquiry</span>
              </a>

              <a
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#00AEEF] hover:bg-[#0095CC] px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-md shadow-[#00AEEF]/20 transition group"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>

            {/* Trust & Proof Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-3 pt-6 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[#0F172A]">
                <Star className="h-4 w-4 fill-[#FFED00] text-amber-500" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-extrabold">{card.rating_value}</span>
                <span className="h-3.5 w-px bg-slate-300" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {card.rating_subtitle}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#00AEEF]" aria-hidden="true" />
                Live Design Preview on WhatsApp
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <BadgeCheck className="h-4 w-4 text-[#E6007E]" aria-hidden="true" />
                HD Print Quality
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                All India Delivery
              </span>
            </div>
          </header>

          {/* Right Visual Column — Product Showcase with CMYK Frame Accent */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl animate-hero-float">
              {/* Decorative CMYK top bar above showcase */}
              <div
                className="mx-auto mb-3 h-1.5 w-40 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, #00AEEF 0% 25%, #E6007E 25% 50%, #FFED00 50% 75%, #0F172A 75% 100%)',
                }}
              />

              <SmartImage
                src={card.image_url}
                alt="GraphicWala Custom Photo Frames, Sublimation Mugs, T-Shirts, Keychains, Billbooks and Wedding Cards"
                className="h-auto w-full object-contain drop-shadow-xl"
                widths={[480, 720, 960, 1280, 1600, 1920]}
                fallbackWidth={1600}
                quality={96}
                resize="contain"
                sizes="(max-width: 1024px) 92vw, 50vw"
                priority
                width={1600}
                height={1200}
              />

              {/* Floating Price Chip with CMYK Accent */}
              <div className="absolute -bottom-3 left-4 sm:left-8 rounded-2xl border-2 border-[#00AEEF] bg-white px-5 py-2.5 shadow-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {card.price_prefix}
                </span>
                <span className="ml-2 text-lg font-black text-[#E6007E]">{card.price_label}</span>
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

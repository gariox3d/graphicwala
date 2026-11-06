
import SmartImage from '@/components/SmartImage';

import {
  ShieldCheck,
  BadgeCheck,
  Star,
  ArrowRight,
  MessageCircle,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';

import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';

const DEFAULT_HERO_IMAGE = '/images/hero-products.jpg';

const QUICK_CATEGORIES = [
  { label: 'Photo Frames & Mugs', color: '#00AEEF' },
  { label: 'T-Shirts & Keychains', color: '#E6007E' },
  { label: 'Billbooks & Letterpads', color: '#EAB308' },
  { label: 'Handbills & Posters', color: '#111827' },
  { label: 'Wedding Cards & Invites', color: '#E6007E' },
];

const HeroSection = () => {
  const { settings, isThemeActive } = useFestivalSettings();
  const festivalActive = isThemeActive();

  const { data: showcase } = useHeroShowcase();

  const card = {
    rating_value: showcase?.rating_value || '4.9 / 5',
    rating_subtitle: showcase?.rating_subtitle || '10K+ Orders',
    price_prefix: showcase?.price_prefix || 'Starting at',
    price_label: showcase?.price_label || '₹99',
    image_url: showcase?.image_url || DEFAULT_HERO_IMAGE,
  };

  const cleanPhone = (WHATSAPP_NUMBER || '916207142994').replace(
    /[^0-9]/g,
    ''
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME || 'Graphic Wala'}, I want to order custom printing and personalized gifts. Please share details.`
  )}`;

  const callUrl = `tel:+${cleanPhone}`;

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-[linear-gradient(135deg,#f4fbff_0%,#ffffff_44%,#fff5fa_100%)]"
      aria-label="Graphic Wala - Custom Printing, Sublimation Gifts and Branding Studio"
    >
      {/* Background Effects */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#00AEEF]/[0.07] blur-[100px]" />
        <div className="absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#E6007E]/[0.06] blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-300/[0.08] blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-[4.5rem] xl:py-24">

        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12 xl:gap-16">

          {/* LEFT CONTENT */}
          <header className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">

            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">

              <Sparkles className="h-4 w-4 text-[#E6007E]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-700 sm:text-xs">
                Printing · Design · Branding
              </span>

              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#00AEEF]" />
                <span className="h-2 w-2 rounded-full bg-[#E6007E]" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-slate-900" />
              </span>

            </div>

            {/* Main Heading */}
            <h1 className="mt-6 font-outfit text-[2.55rem] font-extrabold leading-[1.03] tracking-[-0.055em] text-[#111827] sm:text-5xl lg:text-[3.8rem] xl:text-[4.25rem]">

              <span className="block">
                Your Ideas,
              </span>

              <span className="block">
                Our <span className="bg-gradient-to-r from-[#00AEEF] via-[#E6007E] to-[#8B4513] bg-clip-text text-transparent">
                  Creativity.
                </span>
              </span>

              <span className="mt-2 block text-[1.75rem] font-bold leading-tight tracking-[-0.035em] text-slate-700 sm:text-3xl lg:text-[2.5rem]">
                Custom Printing & Gifts
              </span>

            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-xl text-sm font-normal leading-7 text-slate-600 sm:text-base sm:leading-8 lg:mx-0 lg:text-[1.05rem]">

              From personalized{' '}
              <strong className="font-semibold text-slate-900">
                Photo Frames, Mugs, T-Shirts, Keychains & PVC Cards
              </strong>{' '}
              to professional commercial printing,{' '}
              <strong className="font-semibold text-slate-900">
                Billbooks, Letterpads, Posters & Wedding Invitations.
              </strong>{' '}
              We bring your ideas to life with quality printing.

            </p>

            {/* Quick Categories */}
            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">

              {QUICK_CATEGORIES.map((item) => (
                <a
                  key={item.label}
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:text-xs"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  {item.label}

                </a>
              ))}

            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#128C4A] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-12px_rgba(18,140,74,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0F783F] hover:shadow-lg sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />

                Order on WhatsApp

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              {/* Call */}
              <a
                href={callUrl}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-md sm:w-auto"
              >
                <Phone className="h-4 w-4 text-[#E6007E]" />

                Call for Enquiry

              </a>

              {/* Catalog */}
              <a
                href="/products"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-14px_rgba(15,23,42,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#273449] sm:w-auto"
              >
                Explore Catalog

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

              </a>

            </div>

            {/* Trust Section */}
            <div className="mt-9 border-t border-slate-200/80 pt-7">

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 lg:justify-start">

                {/* Rating */}
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-2">

                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />

                  <span className="text-sm font-extrabold text-slate-900">
                    {card.rating_value}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-500">
                    {card.rating_subtitle}
                  </span>

                </div>

                {/* Trust Items */}
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00AEEF]" />
                  HD Print Quality
                </span>

                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#E6007E]" />
                  Design Preview
                </span>

                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
                  All India Delivery
                </span>

              </div>

            </div>

          </header>

          {/* RIGHT PRODUCT SHOWCASE */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

            {/* Decorative Background */}
            <div className="absolute inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#00AEEF]/10 via-white to-[#E6007E]/10 blur-2xl" />

            {/* Main Showcase Card */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/95 p-3 shadow-[0_34px_100px_-38px_rgba(15,23,42,0.38)] ring-1 ring-slate-200/80 backdrop-blur-sm sm:rounded-[2rem] sm:p-5">

              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    GRAPHIC WALA
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Made With Creativity
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  <span className="text-[10px] font-bold text-green-700">
                    Quality First
                  </span>

                </div>

              </div>

              {/* Product Image */}
              <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_45%,#f8fafc_0%,#ffffff_68%)] px-2 py-5 sm:min-h-[370px] sm:px-4">

                <SmartImage
                  src={card.image_url}
                  alt="Graphic Wala custom photo frames, sublimation mugs, T-shirts, keychains, billbooks and wedding cards"
                  className="h-auto max-h-[430px] w-full object-contain"
                  widths={[480, 720, 960, 1280, 1600, 1920]}
                  fallbackWidth={1600}
                  quality={96}
                  resize="contain"
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  priority
                  width={1600}
                  height={1200}
                />

              </div>

              {/* Bottom Footer */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-4 sm:rounded-2xl sm:px-5">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Custom Printing
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    Designed For You.
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {card.price_prefix}
                  </p>

                  <p className="mt-0.5 text-2xl font-black tracking-tight text-[#E6007E]">
                    {card.price_label}
                  </p>

                </div>

              </div>

            </div>

            {/* Floating Rating Card */}
            <div className="absolute -left-3 top-24 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block lg:-left-7">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {card.rating_value}
                  </p>

                  <p className="text-[10px] font-medium text-slate-500">
                    Customer Rating
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Festival Countdown */}
        {festivalActive && settings?.show_countdown && settings?.end_date && (
          <div className="mt-14">
            <EidCountdown endDate={settings.end_date} />
          </div>
        )}

      </div>

    </section>
  );
};

export default HeroSection;

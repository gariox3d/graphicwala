import SmartImage from '@/components/SmartImage';
import { ShieldCheck, BadgeCheck, Star, ArrowDown, Sparkles } from 'lucide-react';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import EidCountdown from '@/components/festival/EidCountdown';
import { useHeroShowcase } from '@/hooks/useHeroShowcase';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback } from 'react';

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

  // Hero parallax — cursor-driven, spring-smoothed (21st.dev Aurora Hero pattern)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, [-1, 1], [-40, 40]);
  const bgY = useTransform(sy, [-1, 1], [-30, 30]);
  const imgX = useTransform(sx, [-1, 1], [14, -14]);
  const imgY = useTransform(sy, [-1, 1], [10, -10]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
      my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    [mx, my]
  );

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      aria-label="Graphicwala — premium custom printing store India"
      onMouseMove={onMouseMove}
    >
      {/* Aurora background — brand red/rose/warm tones, animated (21st.dev Aurora Hero) */}
      <motion.div className="absolute inset-[-60%] opacity-[0.35]" style={{ x: bgX, y: bgY }} aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(100deg, hsl(var(--primary)) 10%, #f43f5e 15%, #fb923c 20%, hsl(var(--primary)) 25%, #e11d48 30%)',
            backgroundSize: '300% 100%',
            filter: 'blur(90px)',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(100deg, hsl(var(--primary)/0.12) 0%, hsl(var(--primary)/0.12) 7%, transparent 10%, transparent 12%, hsl(var(--primary)/0.12) 16%), repeating-linear-gradient(100deg, hsl(var(--primary)) 10%, #f43f5e 15%, #fb923c 20%, hsl(var(--primary)) 25%, #e11d48 30%)',
            backgroundSize: '200%, 100%',
            backgroundPosition: '50% 50%, 50% 50%',
            mixBlendMode: 'overlay',
          }}
          animate={{
            backgroundPosition: ['50% 50%, 50% 50%', '100% 50%, 150% 50%', '50% 50%, 50% 50%'],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Soft vignette to keep text readable on white theme */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)/0.9) 100%)' }}
        aria-hidden="true"
      />

      <div className="container relative z-10 py-10 sm:py-14 lg:py-16 xl:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 xl:gap-20">
          {/* Copy */}
          <header className="text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3 w-3 text-primary animate-sparkle-spin" aria-hidden="true" />
              Premium Custom Printing
            </motion.span>

            <h1 className="mt-6 font-outfit text-[2.65rem] font-bold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem] xl:text-[4.8rem]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                >
                  Your Memories,
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-primary"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
                >
                  Perfectly Printed
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: 'easeOut' }}
              className="mt-6 mx-auto max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 xl:text-xl"
            >
              Turn your favourite photos into meaningful frames, mugs, t-shirts and keychains—crafted for gifting across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75, ease: 'easeOut' }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              {/* Shimmer Button — scrolls to products */}
              <button
                type="button"
                onClick={scrollToProducts}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-brand transition-transform duration-300 hover:scale-[1.03] active:scale-95 sm:w-auto"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  Shop Products
                  <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
                </span>
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-loop"
                  aria-hidden="true"
                />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/80 px-4 py-2 text-foreground backdrop-blur">
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
            </motion.div>
          </header>

          {/* Visual — parallax float, full product visible, never cropped */}
          <motion.div
            style={{ x: imgX, y: imgY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-border bg-card p-3 shadow-brand animate-hero-float sm:max-w-lg sm:p-4 lg:max-w-xl xl:max-w-2xl xl:p-6">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-white">
                <SmartImage
                  src={card.image_url}
                  alt="Personalised photo frames, mugs, t-shirts and keychains by Graphicwala"
                  className="h-auto w-full object-contain bg-white"
                  widths={[480, 720, 960, 1280, 1600]}
                  fallbackWidth={1280}
                  quality={94}
                  resize="contain"
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  priority
                  width={1280}
                  height={1000}
                />
              </div>

              {/* Floating price chip */}
              <div className="absolute -bottom-4 left-6 sm:left-10 rounded-full border border-border bg-card px-5 py-3 shadow-brand animate-hero-chip-pulse">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {card.price_prefix}
                </span>
                <span className="ml-2 text-base font-bold text-foreground">{card.price_label}</span>
              </div>
            </div>
          </motion.div>
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

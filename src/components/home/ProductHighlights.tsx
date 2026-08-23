import SmartImage from '@/components/SmartImage';
import Reveal from '@/components/Reveal';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HIGHLIGHTS = [
  {
    id: 'photo-frames',
    title: 'Photo Frames',
    description:
      'Turn your favourite memories into elegant wall or desk art. Our custom photo frames are printed on premium materials with vivid colours and a polished finish — perfect for home décor, gifting, or preserving special moments.',
    image: '/images/photo-frame-highlight.jpg',
    href: '/category/photo-frames',
    alt: 'Custom photo frame with family picture by Graphicwala',
    price: 'Starts at ₹199',
  },
  {
    id: 'keychains',
    title: 'Keychains',
    description:
      'Carry your loved ones with you everywhere. Personalised metal and wooden keychains with your photos, names, or initials make thoughtful gifts for birthdays, anniversaries, and everyday keepsakes.',
    image: '/images/keychain-highlight.jpg',
    href: '/category/keychains',
    alt: 'Personalised heart shaped photo keychain by Graphicwala',
    price: 'Starts at ₹99',
  },
  {
    id: 'id-cards',
    title: 'ID Cards',
    description:
      'Professional PVC ID cards for offices, schools, events, and staff. Sharp printing, durable lamination, and optional lanyards — designed to look crisp and last through daily use.',
    image: '/images/id-card-highlight.jpg',
    href: '/category/id-cards',
    alt: 'Professional PVC ID card with lanyard by Graphicwala',
    price: 'Starts at ₹49',
  },
  {
    id: 'pvc-cards',
    title: 'PVC Cards',
    description:
      'Premium PVC visiting cards and business cards that leave a lasting impression. Glossy or matte finish, rounded corners, and high-quality printing for professionals who want to stand out.',
    image: '/images/pvc-card-highlight.jpg',
    href: '/category/pvc-cards',
    alt: 'Premium PVC visiting cards stack by Graphicwala',
    price: 'Starts at ₹99',
  },
];

const ProductHighlights = () => {
  return (
    <section aria-labelledby="product-highlights-heading">
      <h2 id="product-highlights-heading" className="sr-only">
        Featured product highlights
      </h2>

      {HIGHLIGHTS.map((item, i) => {
        const reversed = i % 2 === 1;

        return (
          <div
            key={item.id}
            className={cn(
              'w-full',
              i % 2 === 1 ? 'bg-secondary/40' : 'bg-background'
            )}
          >
            <div className="container py-14 md:py-20 xl:py-24">
              <div className="grid items-center gap-10 md:gap-14 xl:gap-20 lg:grid-cols-2">
                <Reveal
                  className={cn(
                    'order-1',
                    reversed ? 'lg:order-2' : 'lg:order-1'
                  )}
                >
                  <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-brand">
                    <SmartImage
                      src={item.image}
                      alt={item.alt}
                      className="h-auto w-full object-contain bg-white transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
                      widths={[480, 720, 960, 1280]}
                      fallbackWidth={960}
                      quality={88}
                      resize="contain"
                      sizes="(max-width: 1024px) 92vw, 46vw"
                      width={960}
                      height={960}
                    />
                  </div>
                </Reveal>

                <Reveal
                  delay={90}
                  className={cn(
                    'order-2 text-center lg:text-left',
                    reversed ? 'lg:order-1' : 'lg:order-2'
                  )}
                >
                  <span className="inline-block rounded-full border border-border bg-secondary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {item.price}
                  </span>

                  <h3 className="mt-5 display-title text-3xl md:text-5xl xl:text-6xl tracking-[-0.03em]">
                    {item.title}
                  </h3>

                  <p className="mt-4 mx-auto lg:mx-0 max-w-lg text-base md:text-lg font-light leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                    <Link
                      to={item.href}
                      className={cn(
                        buttonVariants({ variant: 'hero', size: 'lg' }),
                        'group w-full sm:w-auto gap-2 rounded-full'
                      )}
                      aria-label={`Shop ${item.title} online with All India delivery`}
                    >
                      Shop Now
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      to="/products"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'lg' }),
                        'w-full sm:w-auto rounded-full'
                      )}
                    >
                      Explore
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ProductHighlights;

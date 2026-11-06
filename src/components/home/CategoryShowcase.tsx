import SmartImage from '@/components/SmartImage';
import Reveal from '@/components/Reveal';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';
import { categorySlug } from '@/lib/categorySeo';
import { getCategoryCopy } from '@/components/home/CategoryGrid';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  categories: Category[];
  getImage: (name: string, image: string | null) => string | null;
}

const CategoryShowcase = ({ categories, getImage }: Props) => {
  if (!categories.length) return null;

  return (
    <section className="bg-white" aria-labelledby="categories-heading">
      <div className="container pt-16 md:pt-24 pb-4 md:pb-8">
        <Reveal as="header" className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">Shop by Category</p>
          <h2 id="categories-heading" className="display-title text-3xl tracking-[-0.04em] sm:text-4xl md:text-5xl xl:text-[3.4rem]">
            What would you like to personalise?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base md:text-lg">
            Every product printed to order, checked by hand, delivered across India.
          </p>
        </Reveal>
      </div>

      {categories.map((category, i) => {
        const img = getImage(category.name, category.image_url ?? null);
        const slug = categorySlug(category.name);
        const reversed = i % 2 === 1;

        return (
          <div
            key={category.id}
            className={cn('w-full border-t border-slate-100', i % 2 === 1 ? 'bg-slate-50/80' : 'bg-white')}
          >
            <div className="container py-10 md:py-16 xl:py-20">
              <div className="mx-auto max-w-5xl grid items-center gap-8 md:gap-10 lg:grid-cols-2">
                <Reveal className={cn('order-1', reversed ? 'lg:order-2' : 'lg:order-1')}>
                  <div className={cn(
                    'relative mx-auto w-full max-w-[16rem] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)] sm:max-w-xs md:max-w-sm',
                    reversed ? 'lg:ml-auto lg:mr-0' : 'lg:mr-auto lg:ml-0'
                  )}>
                    {img ? (
                      <SmartImage
                        src={img}
                        alt={`${category.name} by Graphic Wala`}
                        className="h-auto w-full object-contain bg-white transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
                        widths={[600, 900, 1200, 1600]}
                        fallbackWidth={1200}
                        quality={92}
                        resize="contain"
                        sizes="(max-width: 1024px) 92vw, 46vw"
                        width={960}
                        height={960}
                      />
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-primary/12 to-foreground/10" />
                    )}
                  </div>
                </Reveal>

                <Reveal
                  delay={90}
                  className={cn(
                    'order-2 text-center lg:text-left',
                    reversed ? 'lg:order-1' : 'lg:order-2'
                  )}
                >
                  <h3 className="display-title text-3xl md:text-5xl xl:text-6xl tracking-[-0.03em]">
                    {category.name}
                  </h3>
                  <p className="mt-4 mx-auto lg:mx-0 max-w-lg text-base md:text-lg font-light leading-relaxed text-muted-foreground">
                    {category.description || getCategoryCopy(category.name)}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                    <Link
                      to={`/category/${slug}`}
                      className={cn(
                        buttonVariants({ variant: 'hero', size: 'lg' }),
                        'group w-full sm:w-auto gap-2 rounded-full'
                      )}
                      aria-label={`Shop ${category.name} online with All India delivery`}
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

export default CategoryShowcase;

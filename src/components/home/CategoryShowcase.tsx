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

  const preferredNames = ['photo frame', 'ceramic mug', 't-shirt', 'acrylic keychain'];
  const featured = preferredNames
    .map((name) => categories.find((category) => category.name.toLowerCase().includes(name)))
    .filter((category): category is Category => Boolean(category));
  const displayCategories = [...featured, ...categories.filter((category) => !featured.some((item) => item.id === category.id))].slice(0, 4);

  return (
    <section className="bg-secondary/45 py-16 md:py-24" aria-labelledby="categories-heading">
      <div className="container">
        <Reveal as="header" className="text-center max-w-3xl mx-auto">
          <p className="eyebrow mb-3">Made for you</p>
          <h2 id="categories-heading" className="display-title text-3xl md:text-5xl">
            Pick your perfect gift
          </h2>
          <p className="mt-5 text-base md:text-lg font-light text-muted-foreground">
            Every product printed to order, checked by hand, delivered across India.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {displayCategories.map((category, i) => {
        const img = getImage(category.name, category.image_url ?? null);
        const slug = categorySlug(category.name);

        return (
          <Reveal key={category.id} delay={i * 70} className="h-full">
            <Link
              to={`/category/${slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-brand"
              aria-label={`Shop ${category.name} online with All India delivery`}
            >
                  <div className="relative aspect-square overflow-hidden bg-background">
                    {img ? (
                      <SmartImage
                        src={img}
                        alt={`${category.name} by Graphic Wala`}
                        className="h-full w-full object-contain bg-background p-3 transition-transform duration-700 group-hover:scale-105 sm:p-5"
                        widths={[360, 600, 900]}
                        fallbackWidth={900}
                        quality={95}
                        resize="contain"
                        sizes="(max-width: 640px) 48vw, (max-width: 1024px) 24vw, 300px"
                        width={900}
                        height={900}
                      />
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-primary/12 to-foreground/10" />
                    )}
                    <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform duration-300 group-hover:rotate-45">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="display-title text-lg sm:text-xl">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {category.description || getCategoryCopy(category.name)}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-primary">Explore collection</span>
                  </div>
            </Link>
          </Reveal>
        );
      })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;

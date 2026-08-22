import SmartImage from '@/components/SmartImage';
import Reveal from '@/components/Reveal';

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';
import { categorySlug } from '@/lib/categorySeo';

export const CATEGORY_COPY: Record<string, string> = {
  'photo frame': 'Turn your favourite photo into a premium framed keepsake.',
  'pvc card': 'Waterproof, long-lasting PVC cards printed in full colour.',
  'id card': 'School, office and staff ID cards with clean, professional layouts.',
  'visiting card': 'Business cards that make the right first impression.',
  'keychain': 'Personalised photo keychains — perfect small gifts.',
};

export const getCategoryCopy = (name: string) => {
  const key = Object.keys(CATEGORY_COPY).find((k) => name.toLowerCase().includes(k));
  return key ? CATEGORY_COPY[key] : `Custom ${name.toLowerCase()} printed and delivered across India.`;
};

interface Props {
  categories: Category[];
  getImage: (name: string, image: string | null) => string | null;
}

const CategoryGrid = ({ categories, getImage }: Props) => (
  <section className="py-16 md:py-24 bg-background" aria-labelledby="categories-heading">
    <div className="container">
      <Reveal as="header" className="text-center max-w-2xl mx-auto mb-12">
        <p className="eyebrow mb-3">Shop by Category</p>
        <h2 id="categories-heading" className="display-title italic text-3xl md:text-5xl">
          What Would You Like to Personalise?
        </h2>
        <div className="mt-5 mx-auto h-px w-10 bg-primary" aria-hidden="true" />
      </Reveal>

      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const img = getImage(category.name, category.image_url ?? null);
          return (
            <Reveal key={category.id} delay={(i % 3) * 90} className="h-full">
              <Link
                to={`/category/${categorySlug(category.name)}`}
                className="group flex h-full flex-col"
                aria-label={`Shop ${category.name} online with All India delivery`}
              >
                <div className="relative aspect-square bg-white overflow-hidden border border-border">
                  {img ? (
                    <SmartImage
                      src={img}
                      alt={`${category.name} by Graphic Wala`}
                      className="h-full w-full object-contain bg-white transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      widths={[320, 480, 640]}
                      fallbackWidth={480}
                      quality={68}
                      resize="contain"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 320px"
                      width={640}
                      height={640}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-foreground/10" />
                  )}
                </div>
                <div className="pt-5 text-center">
                  <h3 className="display-title text-xl">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {category.description || getCategoryCopy(category.name)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground border-b border-primary pb-1 transition-colors group-hover:text-primary">
                    Shop {category.name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);


export default CategoryGrid;
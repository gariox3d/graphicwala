import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

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
  <section className="py-14 md:py-20 bg-background" aria-labelledby="categories-heading">
    <div className="container">
      <header className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Shop by Category</p>
        <h2 id="categories-heading" className="text-3xl md:text-4xl font-black tracking-tight">
          What Would You Like to Personalise?
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const img = getImage(category.name, category.image_url ?? null);
          return (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-brand transition-shadow"
              aria-label={`Shop ${category.name} online with All India delivery`}
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={`Custom ${category.name} online in India — Graphic Wala`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-foreground/10" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {category.description || getCategoryCopy(category.name)}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Shop {category.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
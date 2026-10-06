import { useEffect, useState } from 'react';
import SmartImage from '@/components/SmartImage';
import { supabase } from '@/integrations/supabase/client';
import { PORTFOLIO_CATEGORIES, PortfolioItem } from '@/data/portfolioCategories';
import { cn } from '@/lib/utils';

const FILTERS = ['All', ...PORTFOLIO_CATEGORIES];

const PortfolioGallery = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('All');

  useEffect(() => {
    supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as PortfolioItem[]) || []);
        setLoading(false);
      });
  }, []);

  const shown = active === 'All' ? items : items.filter((i) => i.category === active);

  return (
    <section className="py-12 md:py-16" aria-labelledby="portfolio-gallery-heading">
      <div className="container">
        <h2 id="portfolio-gallery-heading" className="mb-6 text-center text-2xl font-bold md:text-3xl">Portfolio Gallery</h2>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={active === f}
              onClick={() => setActive(f)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary hover:text-primary',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : shown.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No work in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {shown.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                <div className="aspect-square bg-muted">
                  <SmartImage
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                    widths={[320, 480, 640, 800]}
                    fallbackWidth={640}
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 300px"
                    width={400}
                    height={400}
                  />
                </div>
                <figcaption className="p-3">
                  <span className="text-[11px] font-medium text-primary">{item.category}</span>
                  <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                  {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioGallery;

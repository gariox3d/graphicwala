import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, getEffectivePrice } from '@/lib/types';

interface Props {
  products: Product[];
  loading: boolean;
}

const isNew = (p: Product) =>
  p.created_at ? Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 21 : false;

const benefitLine = (p: Product) => {
  if (p.description) return p.description;
  const cat = p.categories?.name?.toLowerCase() || '';
  if (cat.includes('frame')) return 'Premium finish frame with your own photo printed.';
  if (cat.includes('card')) return 'Full-colour print on durable premium material.';
  if (cat.includes('keychain')) return 'Personalised photo keychain — a perfect small gift.';
  return 'Custom printed and delivered anywhere in India.';
};

const Bestsellers = ({ products, loading }: Props) => (
  <section className="py-14 md:py-20 bg-secondary" aria-labelledby="bestsellers-heading">
    <div className="container">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Bestsellers</p>
          <h2 id="bestsellers-heading" className="text-3xl md:text-4xl font-black tracking-tight">
            Most Ordered This Month
          </h2>
        </div>
        <Link to="/products" className="hidden md:block">
          <Button variant="outline" className="rounded-full font-semibold">
            View All Products
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p, i) => {
            const href = `/product/${p.slug || p.id}`;
            const price = getEffectivePrice(p);
            const days = p.delivery_days || 7;
            return (
              <article
                key={p.id}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-brand transition-shadow"
              >
                <Link to={href} className="relative block aspect-square bg-muted overflow-hidden">
                  {p.image_url ? (
                    <SmartImage
                      src={p.image_url}
                      alt={`${p.name} — buy custom ${p.categories?.name || 'printing'} online India | Graphic Wala`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      widths={CARD_WIDTHS}
                      fallbackWidth={480}
                      quality={68}
                      resize="cover"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                      width={600}
                      height={600}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {i < 3 && (
                      <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                        Best Seller
                      </span>
                    )}
                    {isNew(p) && (
                      <span className="rounded-md bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-background">
                        New
                      </span>
                    )}
                  </div>
                  {!p.stock_quantity && (
                    <div className="absolute inset-0 bg-foreground/55 flex items-center justify-center">
                      <span className="rounded-md bg-destructive px-3 py-1 text-xs font-black uppercase tracking-wider text-destructive-foreground">
                        Sold Out
                      </span>
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link to={href}>
                    <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{benefitLine(p)}</p>

                  <div className="mt-3">
                    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      Starts at
                    </span>
                    <span className="text-xl font-black text-foreground">₹{price.toFixed(0)}</span>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    Delivery in {days} days
                  </p>

                  <Link to={href} className="mt-4 block">
                    <Button className="w-full rounded-full font-bold" size="sm">
                      View Product
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link to="/products">
          <Button variant="outline" size="lg" className="rounded-full font-semibold">
            View All Products
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default Bestsellers;
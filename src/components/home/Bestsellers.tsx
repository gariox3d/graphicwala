import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import ProductGridCard from '@/components/products/ProductGridCard';

interface Props {
  products: Product[];
  loading: boolean;
}

const Bestsellers = ({ products, loading }: Props) => (
  <section className="py-14 md:py-20 bg-secondary" aria-labelledby="bestsellers-heading">
    <div className="container">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold tracking-wide text-primary mb-2">Bestsellers</p>
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
          {products.slice(0, 8).map((p, i) => (
            <ProductGridCard key={p.id} product={p} badge={i < 3 ? 'Best Seller' : undefined} />
          ))}
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

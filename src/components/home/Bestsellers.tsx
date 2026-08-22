import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';
import ProductGridCard from '@/components/products/ProductGridCard';
import Reveal from '@/components/Reveal';

interface Props {
  products: Product[];
  loading: boolean;
}

const Bestsellers = ({ products, loading }: Props) => (
  <section className="py-16 md:py-24 bg-secondary/40" aria-labelledby="bestsellers-heading">
    <div className="container">
      <Reveal as="header" className="text-center max-w-2xl mx-auto mb-12">
        <p className="eyebrow mb-3">Curated Excellence</p>
        <h2 id="bestsellers-heading" className="display-title italic text-3xl md:text-5xl">
          The Bestsellers
        </h2>
        <div className="mt-5 mx-auto h-px w-10 bg-primary" aria-hidden="true" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <ProductGridCard product={p} badge={i < 3 ? 'Best Seller' : undefined} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Link
          to="/products"
          className="inline-flex items-center justify-center border border-foreground px-10 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-foreground transition-all duration-500 hover:bg-foreground hover:text-background"
        >
          Explore All Products
        </Link>
      </div>
    </div>
  </section>
);

export default Bestsellers;

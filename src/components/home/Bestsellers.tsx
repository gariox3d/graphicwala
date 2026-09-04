import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Product } from '@/lib/types';
import ProductGridCard from '@/components/products/ProductGridCard';
import Reveal from '@/components/Reveal';

interface Props {
  products: Product[];
  loading: boolean;
}

const Bestsellers = ({ products, loading }: Props) => (
  <section className="py-16 md:py-24 xl:py-28 bg-secondary/40" aria-labelledby="bestsellers-heading">
    <div className="container">
      <Reveal as="header" className="text-center max-w-3xl mx-auto mb-14">
        <p className="eyebrow mb-3">Curated Excellence</p>
        <h2 id="bestsellers-heading" className="display-title text-4xl md:text-5xl xl:text-6xl tracking-[-0.03em]">
          The Bestsellers
        </h2>
        <p className="mt-5 text-base md:text-lg font-light text-muted-foreground">
          Our most-loved personalised products, printed fresh for every order.
        </p>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-10 xl:gap-12">
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
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-10 xl:gap-12">
          {products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <ProductGridCard product={p} badge={i < 3 ? 'Best Seller' : undefined} showDelivery={false} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Link to="/products" className={buttonVariants({ variant: 'editorial', size: 'lg' })}>
          Explore All Products
        </Link>
      </div>
    </div>
  </section>
);

export default Bestsellers;

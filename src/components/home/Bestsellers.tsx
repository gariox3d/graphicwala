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
  <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-14 md:py-20 xl:py-24" aria-labelledby="bestsellers-heading">
    <div className="container relative">
      <Reveal as="header" className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
        <p className="eyebrow mb-3">Curated Excellence</p>
        <h2 id="bestsellers-heading" className="display-title text-3xl tracking-[-0.04em] sm:text-4xl md:text-5xl xl:text-[3.4rem]">
          The Bestsellers
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base md:text-lg">
          Our most-loved personalised products, printed fresh for every order.
        </p>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
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

      <div className="mt-10 text-center md:mt-12">
        <Link to="/products" className={buttonVariants({ variant: 'editorial', size: 'lg' })}>
          Explore All Products
        </Link>
      </div>
    </div>
  </section>
);

export default Bestsellers;

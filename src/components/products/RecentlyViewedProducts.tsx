import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { Clock } from 'lucide-react';

interface RecentlyViewedProductsProps {
  viewedIds: string[];
  excludeId?: string;
}

const RecentlyViewedProducts = ({ viewedIds, excludeId }: RecentlyViewedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const ids = viewedIds.filter(id => id !== excludeId).slice(0, 4);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      
      if (data) {
        // Sort by viewedIds order
        const sorted = ids
          .map(id => data.find(p => p.id === id))
          .filter(Boolean) as unknown as Product[];
        setProducts(sorted);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [viewedIds, excludeId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-12 bg-background" aria-labelledby="recently-viewed-heading">
      <div className="container">
        <header className="flex items-center gap-2 mb-8">
          <Clock className="h-5 w-5 text-primary" />
          <h2 id="recently-viewed-heading" className="text-2xl font-bold">Recently Viewed</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;

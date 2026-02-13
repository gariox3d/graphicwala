import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { TrendingUp, Flame } from 'lucide-react';

const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Get trending product IDs from the view
        const { data: trending } = await supabase
          .from('trending_products' as any)
          .select('product_id, total_sold')
          .limit(4);

        if (trending && trending.length > 0) {
          const ids = trending.map((t: any) => t.product_id);
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .in('id', ids);

          if (prods) {
            // Sort by trending order
            const sorted = ids
              .map((id: string) => prods.find((p: any) => p.id === id))
              .filter(Boolean) as unknown as Product[];
            setProducts(sorted);
          }
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24" aria-labelledby="trending-heading">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background" aria-labelledby="trending-heading">
      <div className="container">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
            <h2 id="trending-heading" className="text-3xl md:text-4xl font-bold">
              Trending Now 🔥
            </h2>
          </div>
          <p className="text-muted-foreground ml-14">
            Most loved products by our customers
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;

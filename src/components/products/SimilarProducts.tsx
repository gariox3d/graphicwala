import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { PRODUCT_CARD_FIELDS_WITH_CATEGORY } from '@/lib/productFields';

interface SimilarProductsProps {
  currentProductId: string;
  categoryId?: string | null;
}

const SimilarProducts = ({ currentProductId, categoryId }: SimilarProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);

      // Try same category first, then random
      let query = supabase
        .from('products')
        .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .gt('stock_quantity', 0);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query.limit(8);

      let results = (data || []) as any[];

      // If not enough from same category, fetch more random
      if (results.length < 4 && categoryId) {
        const { data: moreData } = await supabase
          .from('products')
          .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY)
          .eq('is_active', true)
          .neq('id', currentProductId)
          .neq('category_id', categoryId)
          .gt('stock_quantity', 0)
          .limit(8);
        results = [...results, ...(moreData || [])];
      }

      // Shuffle and pick 4
      const shuffled = results.sort(() => Math.random() - 0.5).slice(0, 4);
      setProducts(shuffled as Product[]);
      setLoading(false);
    };

    fetchSimilar();
  }, [currentProductId, categoryId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="container py-10">
      <h2 className="text-2xl font-bold mb-6 animate-fade-in">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;

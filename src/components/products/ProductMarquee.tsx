import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

const ProductMarquee = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, image_url, price, sale_price, sale_start, sale_end')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(20);
      if (data) setProducts(data as unknown as Product[]);
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  // Duplicate for seamless infinite loop
  const items = [...products, ...products, ...products];

  const getPrice = (product: any) => {
    const now = new Date();
    const saleActive =
      product.sale_price &&
      product.sale_start &&
      product.sale_end &&
      new Date(product.sale_start) <= now &&
      new Date(product.sale_end) >= now;
    return saleActive ? product.sale_price : product.price;
  };

  return (
    <div className="relative overflow-hidden bg-foreground/[0.03] border-y border-border py-6">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <div
        className="flex gap-4 w-max"
        style={{
          animation: 'marquee-scroll 60s linear infinite',
        }}
      >
        {items.map((product, idx) => (
          <Link
            key={`${product.id}-${idx}`}
            to={`/products/${product.id}`}
            className="group flex-shrink-0 w-36 md:w-44"
            tabIndex={-1}
          >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
              <div className="aspect-square overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-1">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-primary">
                  ₹{getPrice(product)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        .flex.gap-4.w-max:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default ProductMarquee;

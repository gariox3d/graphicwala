import { useState, useEffect } from 'react';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';

interface StickyAddToCartProps {
  product: Product & { sale_price?: number | null; sale_end?: string | null; sale_start?: string | null };
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const StickyAddToCart = ({ product, onAddToCart, onBuyNow }: StickyAddToCartProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const now = new Date();
  const saleActive = product.sale_price != null && product.sale_start && product.sale_end &&
    new Date(product.sale_start) <= now && new Date(product.sale_end) >= now;
  const displayPrice = saleActive ? product.sale_price! : product.price;
  const isOutOfStock = !product.stock_quantity;

  if (isOutOfStock) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-[0_-4px_20px_-4px_hsl(var(--primary)/0.15)] transition-all duration-300 md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container flex items-center gap-3 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">₹{displayPrice.toFixed(0)}</span>
            {saleActive && (
              <span className="text-xs line-through text-muted-foreground">₹{product.price.toFixed(0)}</span>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" onClick={onAddToCart}>
          <ShoppingCart className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="hero" className="shrink-0" onClick={onBuyNow}>
          <Zap className="h-4 w-4" />
          Buy
        </Button>
      </div>
    </div>
  );
};

export default StickyAddToCart;

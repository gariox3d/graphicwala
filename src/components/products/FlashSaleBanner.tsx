import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

// Per-card countdown hook
const useCountdown = (saleEnd: string | null | undefined) => {
  const calc = useCallback(() => {
    if (!saleEnd) return { label: '', expired: true };
    const diff = new Date(saleEnd).getTime() - Date.now();
    if (diff <= 0) return { label: 'Expired', expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h >= 24) {
      const d = Math.floor(h / 24);
      return { label: `${d}d ${h % 24}h`, expired: false };
    }
    return {
      label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      expired: false,
    };
  }, [saleEnd]);

  const [state, setState] = useState(calc);
  useEffect(() => {
    setState(calc());
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return state;
};

const FlashProductCard = ({ product }: { product: Product }) => {
  // All hooks at top level — no conditional hooks
  const { label, expired } = useCountdown(product.sale_end);

  const now = Date.now();
  const saleActive =
    !expired &&
    product.sale_price != null &&
    product.sale_start != null &&
    product.sale_end != null &&
    new Date(product.sale_start).getTime() <= now &&
    new Date(product.sale_end).getTime() >= now;

  if (!saleActive) return null;

  const discount = Math.round(
    ((product.price - (product.sale_price ?? 0)) / product.price) * 100
  );

  return (
    <Link to={`/product/${product.id}`} className="group flex-shrink-0 w-44 md:w-52">
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400/50 bg-card shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* Discount Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="h-3 w-3 animate-pulse" />
          {discount}% OFF
        </div>

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Flame className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-2">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-extrabold text-primary">
              ₹{(product.sale_price ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
          {/* Per-card countdown */}
          <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-lg px-2 py-1">
            <Clock className="h-3 w-3 text-destructive flex-shrink-0" />
            <span className="text-[11px] font-mono font-bold text-destructive">
              {label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const FlashSaleBanner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [globalTime, setGlobalTime] = useState('');

  useEffect(() => {
    const fetchFlashProducts = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('sale_price', 'is', null)
        .lte('sale_start', now)
        .gte('sale_end', now)
        .order('display_order', { ascending: true });

      if (data) setProducts(data as unknown as Product[]);
    };

    fetchFlashProducts();
  }, []);

  // Global countdown to earliest sale end
  useEffect(() => {
    if (products.length === 0) return;
    const earliest = products.reduce(
      (min: string | null, p) =>
        p.sale_end && (!min || p.sale_end < min) ? p.sale_end : min,
      null
    );
    if (!earliest) return;

    const update = () => {
      const diff = new Date(earliest).getTime() - Date.now();
      if (diff <= 0) { setGlobalTime('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setGlobalTime(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [products]);

  if (products.length === 0) return null;

  // Duplicate for seamless loop
  const items = products.length < 4
    ? [...products, ...products, ...products]
    : [...products, ...products];

  return (
    <section className="py-6 overflow-hidden bg-secondary border-y-2 border-destructive/20">
      {/* Header */}
      <div className="container mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-primary flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                ⚡ Flash Sale
                <span className="text-sm font-normal text-muted-foreground ml-2">— Limited time deals</span>
              </h2>
            </div>
          </div>
          {globalTime && (
            <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-md">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">Ends in</span>
              <span className="font-mono font-extrabold text-base tracking-widest">{globalTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrolling Cards */}
      <div className="relative overflow-hidden">
        {/* Fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10 bg-gradient-to-r from-secondary to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10 bg-gradient-to-l from-secondary to-transparent" />

        <div
          className="flex gap-4 px-6 w-max flash-scroll-container"
          style={{ animation: 'flash-scroll 40s linear infinite' }}
        >
          {items.map((product, idx) => (
            <FlashProductCard key={`${product.id}-${idx}`} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes flash-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .flash-scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default FlashSaleBanner;

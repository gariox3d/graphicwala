import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

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

// Animation variants for each card
const animations = [
  'flash-slide-up',
  'flash-slide-right',
  'flash-zoom-in',
  'flash-slide-left',
  'flash-flip-in',
];

const FlashProductCard = ({ product, index, onSelect }: { product: Product; index: number; onSelect: (p: Product) => void }) => {
  const { label, expired } = useCountdown(product.sale_end);
  const [visible, setVisible] = useState(false);

  const now = Date.now();
  const saleActive =
    !expired &&
    product.sale_price != null &&
    product.sale_start != null &&
    product.sale_end != null &&
    new Date(product.sale_start).getTime() <= now &&
    new Date(product.sale_end).getTime() >= now;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  if (!saleActive) return null;

  const discount = Math.round(
    ((product.price - (product.sale_price ?? 0)) / product.price) * 100
  );

  const animClass = animations[index % animations.length];

  return (
    <div
      className={`group cursor-pointer ${visible ? animClass : 'opacity-0'}`}
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400/50 bg-card shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="h-3 w-3 animate-pulse" />
          {discount}% OFF
        </div>

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
          <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-lg px-2 py-1">
            <Clock className="h-3 w-3 text-destructive flex-shrink-0" />
            <span className="text-[11px] font-mono font-bold text-destructive">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick-view overlay
const ProductOverlay = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { label } = useCountdown(product.sale_end);
  const discount = Math.round(
    ((product.price - (product.sale_price ?? 0)) / product.price) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-border flash-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur rounded-full p-1.5 hover:bg-background transition-colors"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="h-4 w-4 animate-pulse" />
          {discount}% OFF
        </div>

        <div className="aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Flame className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground mb-2">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{product.description}</p>
          )}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-extrabold text-primary">
              ₹{(product.sale_price ?? 0).toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground line-through">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
            <Clock className="h-4 w-4 text-destructive" />
            <span className="text-sm font-mono font-bold text-destructive">{label}</span>
            <span className="text-xs text-destructive/80">remaining</span>
          </div>
          <Link
            to={`/product/${product.id}`}
            className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            onClick={onClose}
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
};

const FlashSaleBanner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [globalTime, setGlobalTime] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

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

  return (
    <>
      <section className="py-6 overflow-hidden bg-secondary border-y-2 border-destructive/20">
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

        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((product, idx) => (
              <FlashProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        <style>{`
          .flash-slide-up {
            animation: flashSlideUp 0.6s ease-out forwards;
          }
          .flash-slide-right {
            animation: flashSlideRight 0.6s ease-out forwards;
          }
          .flash-zoom-in {
            animation: flashZoomIn 0.5s ease-out forwards;
          }
          .flash-slide-left {
            animation: flashSlideLeft 0.6s ease-out forwards;
          }
          .flash-flip-in {
            animation: flashFlipIn 0.7s ease-out forwards;
          }
          @keyframes flashSlideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes flashSlideRight {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes flashZoomIn {
            from { opacity: 0; transform: scale(0.7); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes flashSlideLeft {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes flashFlipIn {
            from { opacity: 0; transform: rotateY(90deg); }
            to { opacity: 1; transform: rotateY(0deg); }
          }
        `}</style>
      </section>

      {selected && <ProductOverlay product={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default FlashSaleBanner;

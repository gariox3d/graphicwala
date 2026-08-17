import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { PRODUCT_CARD_FIELDS } from '@/lib/productFields';

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

const getProductImages = (product: Product): string[] => {
  const images: string[] = [];
  if (product.image_urls && Array.isArray(product.image_urls)) {
    (product.image_urls as string[]).forEach((url) => {
      if (typeof url === 'string' && url) images.push(url);
    });
  }
  if (images.length === 0 && product.image_url) {
    images.push(product.image_url);
  }
  return images;
};

const FlashCard = ({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) => {
  const { label, expired } = useCountdown(product.sale_end);
  const images = getProductImages(product);
  const [imgIdx, setImgIdx] = useState(0);

  const now = Date.now();
  const saleActive =
    !expired &&
    product.sale_price != null &&
    product.sale_start != null &&
    product.sale_end != null &&
    new Date(product.sale_start).getTime() <= now &&
    new Date(product.sale_end).getTime() >= now;

  // Auto-rotate through ALL images
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setImgIdx((i) => (i + 1) % images.length), 2500);
    return () => clearInterval(id);
  }, [images.length]);

  if (!saleActive) return null;

  const discount = Math.round(((product.price - (product.sale_price ?? 0)) / product.price) * 100);

  return (
    <div
      className="group cursor-pointer flex-shrink-0 w-40 md:w-48"
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400/50 bg-card shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="h-3 w-3 animate-pulse" />
          {discount}% OFF
        </div>

        <div className="aspect-square overflow-hidden bg-muted relative">
          {images.length > 0 ? (
            <SmartImage
              src={images[imgIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-500"
              widths={[160, 240, 320]}
              fallbackWidth={240}
              quality={66}
              resize="cover"
              sizes="200px"
              width={240}
              height={240}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Flame className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-2.5">
          <p className="text-xs font-semibold text-foreground line-clamp-1 leading-tight mb-1.5">{product.name}</p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm font-extrabold text-primary">₹{(product.sale_price ?? 0).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 rounded-md px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5 text-destructive flex-shrink-0" />
            <span className="text-[10px] font-mono font-bold text-destructive">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductOverlay = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { label } = useCountdown(product.sale_end);
  const images = getProductImages(product);
  const [imgIdx, setImgIdx] = useState(0);
  const discount = Math.round(((product.price - (product.sale_price ?? 0)) / product.price) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-border animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur rounded-full p-1.5 hover:bg-background transition-colors">
          <X className="h-4 w-4 text-foreground" />
        </button>
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="h-4 w-4 animate-pulse" />
          {discount}% OFF
        </div>
        <div className="aspect-square overflow-hidden bg-muted relative">
          {images.length > 0 ? (
            <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Flame className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur rounded-full p-1 hover:bg-background transition-colors">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur rounded-full p-1 hover:bg-background transition-colors">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground mb-2">{product.name}</h3>
          {product.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{product.description}</p>}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-extrabold text-primary">₹{(product.sale_price ?? 0).toLocaleString()}</span>
            <span className="text-base text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
            <Clock className="h-4 w-4 text-destructive" />
            <span className="text-sm font-mono font-bold text-destructive">{label}</span>
            <span className="text-xs text-destructive/80">remaining</span>
          </div>
          <Link to={`/product/${(product as any).slug || product.id}`} className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity" onClick={onClose}>
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
        .select(PRODUCT_CARD_FIELDS)
        .eq('is_active', true)
        .not('sale_price', 'is', null)
        .lte('sale_start', now)
        .gte('sale_end', now)
        .order('display_order', { ascending: true })
        .limit(12);

      if (data) setProducts(data as unknown as Product[]);
    };
    fetchFlashProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const earliest = products.reduce(
      (min: string | null, p) => (p.sale_end && (!min || p.sale_end < min) ? p.sale_end : min),
      null
    );
    if (!earliest) return;

    const update = () => {
      const diff = new Date(earliest).getTime() - Date.now();
      if (diff <= 0) { setGlobalTime('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setGlobalTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [products]);

  if (products.length === 0) return null;

  // Triplicate for seamless infinite scroll loop
  const items = [...products, ...products, ...products];

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

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-secondary to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-secondary to-transparent" />

          <div className="flex gap-4 w-max flash-marquee-track">
            {items.map((product, idx) => (
              <FlashCard key={`${product.id}-${idx}`} product={product} onSelect={setSelected} />
            ))}
          </div>
        </div>

        <style>{`
          .flash-marquee-track {
            animation: flash-marquee-scroll 30s linear infinite;
          }
          .flash-marquee-track:hover {
            animation-play-state: paused;
          }
          @keyframes flash-marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% / 3)); }
          }
        `}</style>
      </section>

      {selected && <ProductOverlay product={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default FlashSaleBanner;

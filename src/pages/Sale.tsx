import Seo from '@/components/seo/Seo';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Gift, Percent, ArrowRight, Sparkles, Tag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

const SaleCountdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const blocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {blocks.map((b) => (
        <div key={b.label} className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-bold bg-background/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px] text-center tabular-nums">
            {String(b.value).padStart(2, '0')}
          </span>
          <span className="text-xs mt-1 opacity-80 font-medium">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

const Sale = () => {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sale end date — find the latest sale_end from active sale products
  const saleEndDate = useMemo(() => {
    const dates = saleProducts
      .map((p) => p.sale_end)
      .filter(Boolean)
      .map((d) => new Date(d!));
    if (dates.length === 0) {
      // Default: 7 days from now
      return new Date(Date.now() + 7 * 86400000);
    }
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }, [saleProducts]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const [saleRes, allRes] = await Promise.allSettled([
        supabase
          .from('products')
          .select('*')
          .not('sale_price', 'is', null)
          .lte('sale_start', now)
          .gte('sale_end', now)
          .order('display_order'),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
          .limit(8),
      ]);
      if (saleRes.status === 'fulfilled' && saleRes.value.data) {
        setSaleProducts(saleRes.value.data as unknown as Product[]);
      }
      if (allRes.status === 'fulfilled' && allRes.value.data) {
        setAllProducts(allRes.value.data as unknown as Product[]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const hasSaleProducts = saleProducts.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Sale - Graphic Wala | Upto 50% Off on Custom Gifts & Photo Frames"
        description="Graphic Wala Sale - Get upto 50% off on custom photo frames, PVC cards, keychains & personalized gifts. Limited time offers with All India delivery!"
        path="/sale"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white py-16 md:py-24">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-1/2 -right-20 w-60 h-60 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-red-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold">
              <Flame className="h-4 w-4" />
              Limited Time Offer
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg">
              MEGA <span className="text-yellow-200">SALE</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              Upto <span className="font-bold text-yellow-200 text-2xl">50% OFF</span> on Custom Photo Frames, PVC Cards, Keychains & more!
            </p>

            <div className="py-4">
              <p className="text-sm mb-3 opacity-80 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" /> Sale Ends In
              </p>
              <SaleCountdown targetDate={saleEndDate} />
            </div>

            <Link to="/products">
              <Button size="xl" className="bg-white text-red-600 hover:bg-yellow-100 font-bold text-lg shadow-xl">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Sale Highlights */}
        <section className="py-10 bg-background border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Percent, title: 'Upto 50% Off', desc: 'On selected products' },
                { icon: Gift, title: 'Free Gifts', desc: 'On orders above ₹999' },
                { icon: Tag, title: 'Extra Coupons', desc: 'Use code at checkout' },
                { icon: Sparkles, title: 'Premium Quality', desc: '100% satisfaction' },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sale Products */}
        {hasSaleProducts && (
          <section className="py-16 bg-background">
            <div className="container">
              <div className="flex items-center gap-3 mb-8">
                <Flame className="h-7 w-7 text-red-500" />
                <h2 className="text-2xl md:text-3xl font-bold">🔥 Hot Deals</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {saleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products / Recommendations */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                {hasSaleProducts ? '🎁 More Products You\'ll Love' : '🎁 Featured Products'}
              </h2>
              <Link to="/products">
                <Button variant="outline">View All <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            {loading ? (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-orange-500 text-white text-center">
          <div className="container space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Don't Miss Out! 🎉</h2>
            <p className="opacity-90 max-w-xl mx-auto">Grab these amazing deals before they're gone. Limited stock available!</p>
            <Link to="/products">
              <Button size="xl" className="bg-white text-red-600 hover:bg-yellow-100 font-bold shadow-xl mt-4">
                Shop All Products <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sale;

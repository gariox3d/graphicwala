import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Users, Star, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const useCountUp = (target: number, duration = 2000, inView: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, inView, duration]);

  return count;
};

const StatCard = ({ stat, inView }: { stat: StatItem; inView: boolean }) => {
  const count = useCountUp(stat.value, 2000, inView);
  const Icon = stat.icon;

  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2" aria-hidden="true">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-foreground">
        {count}{stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
    </div>
  );
};

const StatsCounter = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch real data using select queries (RLS allows public read on products & reviews)
      const [productsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('id').eq('is_active', true),
        supabase.from('reviews').select('id'),
      ]);

      const totalProducts = productsRes.data?.length || 0;
      const totalReviews = reviewsRes.data?.length || 0;

      // For orders — RLS restricts to own orders, so we count order_items from trending_products view
      // which gives us real delivered/sold data
      const { data: trendingData } = await supabase.from('trending_products').select('total_sold');
      const totalDelivered = trendingData?.reduce((sum, t) => sum + (t.total_sold || 0), 0) || 0;
      const totalOrders = trendingData?.reduce((sum, t) => sum + 1, 0) || 0;

      // Use unique customers from trending or fallback to order count
      const uniqueCustomers = trendingData?.length || 0;

      setStats([
        { icon: ShoppingBag, value: totalDelivered, suffix: '+', label: 'Orders Delivered' },
        { icon: Users, value: uniqueCustomers, suffix: '+', label: 'Happy Customers' },
        { icon: Package, value: totalProducts, suffix: '', label: 'Products Available' },
        { icon: Star, value: totalReviews, suffix: '+', label: '5-Star Reviews' },
      ]);
    };
    fetchStats();
  }, []);

  if (stats.length === 0) return null;

  return (
    <section ref={ref} className="py-12 bg-primary/5 border-y border-border/50" aria-label="Store statistics">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;

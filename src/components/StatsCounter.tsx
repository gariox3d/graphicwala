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
      // Use RPC function that bypasses RLS with SECURITY DEFINER
      const { data, error } = await supabase.rpc('get_public_stats' as any);

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return;

      setStats([
        { icon: ShoppingBag, value: Number(row.total_orders) || 0, suffix: '+', label: 'Orders Delivered' },
        { icon: Users, value: Number(row.total_customers) || 0, suffix: '+', label: 'Happy Customers' },
        { icon: Package, value: Number(row.total_products) || 0, suffix: '', label: 'Products Available' },
        { icon: Star, value: Number(row.total_reviews) || 0, suffix: '+', label: '5-Star Reviews' },
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

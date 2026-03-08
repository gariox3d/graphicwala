import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, ShoppingCart, IndianRupee, Package, Minus } from 'lucide-react';

interface DailySummary {
  todayOrders: number;
  todayRevenue: number;
  todayPickup: number;
  yesterdayOrders: number;
  yesterdayRevenue: number;
  yesterdayPickup: number;
  topProduct: { name: string; quantity: number } | null;
}

const DailySalesSummary = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

        const [
          { data: todayOrders },
          { data: yesterdayOrders },
          { data: todayPickup },
          { data: yesterdayPickup },
          { data: todayItems },
        ] = await Promise.all([
          supabase.from('orders').select('total_amount').eq('payment_status', 'paid').gte('created_at', todayStart),
          supabase.from('orders').select('total_amount').eq('payment_status', 'paid').gte('created_at', yesterdayStart).lt('created_at', todayStart),
          supabase.from('store_pickup_earnings').select('amount').gte('created_at', todayStart),
          supabase.from('store_pickup_earnings').select('amount').gte('created_at', yesterdayStart).lt('created_at', todayStart),
          supabase.from('order_items').select('product_name, quantity').in(
            'order_id',
            (await supabase.from('orders').select('id').eq('payment_status', 'paid').gte('created_at', todayStart)).data?.map(o => o.id) || []
          ),
        ]);

        // Find top product today
        const productMap: Record<string, number> = {};
        (todayItems || []).forEach((item: any) => {
          productMap[item.product_name] = (productMap[item.product_name] || 0) + item.quantity;
        });
        const topEntry = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];

        setSummary({
          todayOrders: todayOrders?.length || 0,
          todayRevenue: (todayOrders || []).reduce((s, o) => s + Number(o.total_amount), 0),
          todayPickup: (todayPickup || []).reduce((s, o) => s + Number(o.amount), 0),
          yesterdayOrders: yesterdayOrders?.length || 0,
          yesterdayRevenue: (yesterdayOrders || []).reduce((s, o) => s + Number(o.total_amount), 0),
          yesterdayPickup: (yesterdayPickup || []).reduce((s, o) => s + Number(o.amount), 0),
          topProduct: topEntry ? { name: topEntry[0], quantity: topEntry[1] } : null,
        });
      } catch (err) {
        console.error('Daily summary error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground animate-pulse">
          Loading today's summary...
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const totalToday = summary.todayRevenue + summary.todayPickup;
  const totalYesterday = summary.yesterdayRevenue + summary.yesterdayPickup;
  const revenueDiff = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday) * 100 : totalToday > 0 ? 100 : 0;
  const orderDiff = summary.yesterdayOrders > 0 ? ((summary.todayOrders - summary.yesterdayOrders) / summary.yesterdayOrders) * 100 : summary.todayOrders > 0 ? 100 : 0;

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const TrendBadge = ({ value }: { value: number }) => (
    <Badge variant="outline" className={`text-xs gap-1 ${value > 0 ? 'text-green-600 border-green-200 bg-green-50' : value < 0 ? 'text-red-600 border-red-200 bg-red-50' : 'text-muted-foreground'}`}>
      <TrendIcon value={value} />
      {value > 0 ? '+' : ''}{Math.round(value)}% vs kal
    </Badge>
  );

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          📊 Aaj Ka Summary
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today Revenue */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5" /> Aaj ki kamai
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totalToday.toLocaleString()}</p>
            <TrendBadge value={revenueDiff} />
          </div>

          {/* Today Orders */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShoppingCart className="h-3.5 w-3.5" /> Aaj ke orders
            </div>
            <p className="text-2xl font-bold">{summary.todayOrders}</p>
            <TrendBadge value={orderDiff} />
          </div>

          {/* Online vs Pickup split */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Online / Pickup</p>
            <p className="text-lg font-semibold">
              ₹{summary.todayRevenue.toLocaleString()} 
              <span className="text-muted-foreground font-normal"> / </span>
              ₹{summary.todayPickup.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Kal: ₹{summary.yesterdayRevenue.toLocaleString()} / ₹{summary.yesterdayPickup.toLocaleString()}</p>
          </div>

          {/* Top Product */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-3.5 w-3.5" /> Top Product
            </div>
            {summary.topProduct ? (
              <>
                <p className="text-sm font-semibold truncate">{summary.topProduct.name}</p>
                <p className="text-xs text-muted-foreground">{summary.topProduct.quantity} units sold today</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Abhi koi order nahi</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;

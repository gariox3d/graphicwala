import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingCart,
  Users, Package, Calendar, ArrowUpRight
} from 'lucide-react';
import { format, subDays, startOfDay, parseISO, isAfter } from 'date-fns';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [ordersRes, itemsRes, productsRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*').eq('payment_status', 'paid'),
        supabase.from('order_items').select('*'),
        supabase.from('products').select('id, name, price, image_url, is_active'),
        supabase.from('profiles').select('user_id, created_at'),
      ]);
      setOrders(ordersRes.data || []);
      setOrderItems(itemsRes.data || []);
      setProducts(productsRes.data || []);
      setProfiles(profilesRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    return orders.filter(o => isAfter(parseISO(o.created_at), cutoff));
  }, [orders, timeRange]);

  // Revenue & order trends (daily)
  const dailyTrends = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;
    const map: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      map[d] = { date: d, revenue: 0, orders: 0 };
    }
    filteredOrders.forEach(o => {
      const d = format(parseISO(o.created_at), 'yyyy-MM-dd');
      if (map[d]) {
        map[d].revenue += Number(o.total_amount);
        map[d].orders += 1;
      }
    });
    return Object.values(map).map(v => ({
      ...v,
      label: format(parseISO(v.date), 'dd MMM'),
    }));
  }, [filteredOrders, timeRange]);

  // Top products by quantity sold
  const topProducts = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    const orderMap = new Map(filteredOrders.map(o => [o.id, o]));
    orderItems.forEach(item => {
      if (!orderMap.has(item.order_id)) return;
      if (!itemMap[item.product_id]) {
        itemMap[item.product_id] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      itemMap[item.product_id].qty += item.quantity;
      itemMap[item.product_id].revenue += item.quantity * Number(item.product_price);
    });
    return Object.entries(itemMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [filteredOrders, orderItems]);

  // Order status distribution
  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // New customers per period
  const newCustomers = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;
    const map: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      map[d] = 0;
    }
    profiles.forEach(p => {
      const d = format(parseISO(p.created_at), 'yyyy-MM-dd');
      if (map[d] !== undefined) map[d]++;
    });
    return Object.entries(map).map(([date, count]) => ({
      label: format(parseISO(date), 'dd MMM'),
      customers: count,
    }));
  }, [profiles, timeRange]);

  // Summary metrics
  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItemsSold = useMemo(() => {
    const orderMap = new Map(filteredOrders.map(o => [o.id, true]));
    return orderItems.filter(i => orderMap.has(i.order_id)).reduce((s, i) => s + i.quantity, 0);
  }, [filteredOrders, orderItems]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">Sales trends, top products & customer insights</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(r => (
              <Button
                key={r}
                size="sm"
                variant={timeRange === r ? 'default' : 'outline'}
                onClick={() => setTimeRange(r)}
              >
                {r === 'all' ? 'All Time' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, accent: 'text-green-600' },
            { label: 'Orders', value: totalOrders, icon: ShoppingCart, accent: 'text-blue-600' },
            { label: 'Avg. Order', value: `₹${Math.round(avgOrderValue).toLocaleString()}`, icon: TrendingUp, accent: 'text-purple-600' },
            { label: 'Items Sold', value: totalItemsSold, icon: Package, accent: 'text-orange-600' },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders per day + Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Daily Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDist.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 13,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products + New Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium truncate">{p.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">₹{p.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                New Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={newCustomers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 13,
                      }}
                    />
                    <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

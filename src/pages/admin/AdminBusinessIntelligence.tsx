import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Eye,
  Users, Package, AlertTriangle, Calendar, ArrowRight
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

interface ProductRow {
  id: string;
  name: string;
  price: number;
  cost_price: number | null;
  is_active: boolean | null;
}

interface OrderRow {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

interface OrderItemRow {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface CartRow {
  product_id: string;
  quantity: number;
  created_at: string;
}

interface ViewRow {
  product_id: string;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  created_at: string;
}

interface TrendingRow {
  product_id: string;
  order_count: number;
  total_sold: number;
}

const AdminBusinessIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [cartItems, setCartItems] = useState<CartRow[]>([]);
  const [views, setViews] = useState<ViewRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [trending, setTrending] = useState<TrendingRow[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [
        ordersRes,
        itemsRes,
        productsRes,
        cartsRes,
        viewsRes,
        profilesRes,
        trendingRes,
      ] = await Promise.all([
        supabase.from('orders').select('id, user_id, total_amount, payment_status, created_at'),
        supabase.from('order_items').select('order_id, product_id, product_name, product_price, quantity'),
        supabase.from('products').select('id, name, price, cost_price, is_active'),
        supabase.from('cart_items').select('product_id, quantity, created_at'),
        supabase.from('product_views').select('product_id, created_at'),
        supabase.from('profiles').select('user_id, created_at'),
        supabase.from('trending_products').select('*'),
      ]);
      setOrders((ordersRes.data as OrderRow[]) || []);
      setOrderItems((itemsRes.data as OrderItemRow[]) || []);
      setProducts((productsRes.data as ProductRow[]) || []);
      setCartItems((cartsRes.data as CartRow[]) || []);
      setViews((viewsRes.data as ViewRow[]) || []);
      setProfiles((profilesRes.data as ProfileRow[]) || []);
      setTrending((trendingRes.data as TrendingRow[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<string, ProductRow>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    return orders.filter((o) => isAfter(parseISO(o.created_at), cutoff));
  }, [orders, timeRange]);

  const filteredOrderItems = useMemo(() => {
    const orderIds = new Set(filteredOrders.map((o) => o.id));
    return orderItems.filter((i) => orderIds.has(i.order_id));
  }, [filteredOrders, orderItems]);

  const filteredCartItems = useMemo(() => {
    if (timeRange === 'all') return cartItems;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    return cartItems.filter((c) => isAfter(parseISO(c.created_at), cutoff));
  }, [cartItems, timeRange]);

  const filteredViews = useMemo(() => {
    if (timeRange === 'all') return views;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    return views.filter((v) => isAfter(parseISO(v.created_at), cutoff));
  }, [views, timeRange]);

  const paidOrders = useMemo(
    () => filteredOrders.filter((o) => o.payment_status === 'paid'),
    [filteredOrders]
  );

  // Daily revenue & profit trend
  const dailyTrends = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;
    const map: Record<string, { date: string; revenue: number; cost: number; profit: number; orders: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      map[d] = { date: d, revenue: 0, cost: 0, profit: 0, orders: 0 };
    }
    paidOrders.forEach((o) => {
      const d = format(parseISO(o.created_at), 'yyyy-MM-dd');
      if (map[d]) {
        map[d].revenue += Number(o.total_amount);
        map[d].orders += 1;
      }
    });
    const orderDates: Record<string, string> = {};
    filteredOrders.forEach((o) => {
      orderDates[o.id] = format(parseISO(o.created_at), 'yyyy-MM-dd');
    });
    filteredOrderItems.forEach((item) => {
      const d = orderDates[item.order_id];
      if (!d || !map[d]) return;
      const product = productMap.get(item.product_id);
      if (product?.cost_price) {
        map[d].cost += Number(product.cost_price) * item.quantity;
      }
    });
    Object.values(map).forEach((v) => {
      v.profit = v.revenue - v.cost;
    });
    return Object.values(map).map((v) => ({
      ...v,
      label: format(parseISO(v.date), 'dd MMM'),
    }));
  }, [paidOrders, filteredOrderItems, productMap, timeRange]);

  // Summary metrics
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalCost = filteredOrderItems.reduce((s, item) => {
    const product = productMap.get(item.product_id);
    return s + (product?.cost_price ? Number(product.cost_price) * item.quantity : 0);
  }, 0);
  const estimatedProfit = totalRevenue - totalCost;
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const abandonedCartValue = filteredCartItems.reduce((s, c) => {
    const product = productMap.get(c.product_id);
    return s + (product ? Number(product.price) * c.quantity : 0);
  }, 0);

  // Top selling products by revenue
  const topProductsByRevenue = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};
    filteredOrderItems.forEach((item) => {
      if (!map[item.product_id]) {
        map[item.product_id] = { name: item.product_name, qty: 0, revenue: 0, cost: 0 };
      }
      const product = productMap.get(item.product_id);
      map[item.product_id].qty += item.quantity;
      map[item.product_id].revenue += item.quantity * Number(item.product_price);
      if (product?.cost_price) {
        map[item.product_id].cost += item.quantity * Number(product.cost_price);
      }
    });
    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v, profit: v.revenue - v.cost }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrderItems, productMap]);

  // Funnel: Views -> Cart -> Orders -> Paid
  const funnelData = useMemo(() => {
    const viewCount = new Set(filteredViews.map((v) => v.product_id)).size; // unique products viewed
    const cartCount = filteredCartItems.reduce((s, c) => s + c.quantity, 0);
    const orderCount = filteredOrders.length;
    const paidCount = paidOrders.length;
    return [
      { name: 'Product Views', value: viewCount, fill: COLORS[0] },
      { name: 'Cart Additions', value: cartCount, fill: COLORS[1] },
      { name: 'Orders Placed', value: orderCount, fill: COLORS[2] },
      { name: 'Paid Purchases', value: paidCount, fill: COLORS[3] },
    ];
  }, [filteredViews, filteredCartItems, filteredOrders, paidOrders]);

  // Low conversion products
  const lowConversionProducts = useMemo(() => {
    const viewsByProduct: Record<string, number> = {};
    filteredViews.forEach((v) => {
      viewsByProduct[v.product_id] = (viewsByProduct[v.product_id] || 0) + 1;
    });
    const salesByProduct: Record<string, number> = {};
    filteredOrderItems.forEach((item) => {
      salesByProduct[item.product_id] = (salesByProduct[item.product_id] || 0) + item.quantity;
    });
    return Object.entries(viewsByProduct)
      .map(([productId, viewCount]) => {
        const product = productMap.get(productId);
        if (!product) return null;
        const sold = salesByProduct[productId] || 0;
        const conversion = viewCount > 0 ? (sold / viewCount) * 100 : 0;
        return {
          id: productId,
          name: product.name,
          views: viewCount,
          sold,
          conversion,
          potentialRevenue: Number(product.price) * viewCount,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x && x.sold === 0 && x.views >= 3)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [filteredViews, filteredOrderItems, productMap]);

  // 7-day sales forecast
  const forecast = useMemo(() => {
    const days = 14;
    const map: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      map[d] = 0;
    }
    paidOrders.forEach((o) => {
      const d = format(parseISO(o.created_at), 'yyyy-MM-dd');
      if (map[d] !== undefined) map[d] += Number(o.total_amount);
    });
    const values = Object.values(map);
    const last7 = values.slice(-7);
    const avgLast7 = last7.reduce((a, b) => a + b, 0) / Math.max(last7.length, 1);
    const next7Total = avgLast7 * 7;
    return { avgDaily: avgLast7, next7Total };
  }, [paidOrders]);

  // Product-wise profit analysis
  const productProfitAnalysis = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; cost: number; qty: number }> = {};
    filteredOrderItems.forEach((item) => {
      if (!map[item.product_id]) {
        map[item.product_id] = { name: item.product_name, revenue: 0, cost: 0, qty: 0 };
      }
      const product = productMap.get(item.product_id);
      map[item.product_id].qty += item.quantity;
      map[item.product_id].revenue += item.quantity * Number(item.product_price);
      if (product?.cost_price) {
        map[item.product_id].cost += item.quantity * Number(product.cost_price);
      }
    });
    return Object.entries(map)
      .map(([id, v]) => ({
        id,
        ...v,
        profit: v.revenue - v.cost,
        margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0,
        hasCost: v.cost > 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrderItems, productMap]);

  // Customer purchase trends
  const customerTrends = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;
    const map: Record<string, { date: string; newCustomers: number; payingCustomers: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      map[d] = { date: d, newCustomers: 0, payingCustomers: 0 };
    }
    profiles.forEach((p) => {
      const d = format(parseISO(p.created_at), 'yyyy-MM-dd');
      if (map[d]) map[d].newCustomers++;
    });
    paidOrders.forEach((o) => {
      const d = format(parseISO(o.created_at), 'yyyy-MM-dd');
      if (map[d]) map[d].payingCustomers++;
    });
    return Object.values(map).map((v) => ({
      ...v,
      label: format(parseISO(v.date), 'dd MMM'),
    }));
  }, [profiles, paidOrders, timeRange]);

  const totalCustomers = new Set(orders.map((o) => o.user_id)).size;
  const returningCustomers = orders.filter((o, i, arr) => arr.findIndex((x) => x.user_id === o.user_id) !== i).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading business intelligence...</div>
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              Business Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced insights: profit, funnel, forecast & conversion signals
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => (
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
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, accent: 'text-blue-600' },
            { label: 'Est. Profit', value: `₹${estimatedProfit.toLocaleString()}`, icon: TrendingUp, accent: 'text-green-600' },
            { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString()}`, icon: ShoppingCart, accent: 'text-purple-600' },
            { label: 'Abandoned Cart Value', value: `₹${abandonedCartValue.toLocaleString()}`, icon: AlertTriangle, accent: 'text-orange-600' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{kpi.label}</p>
                    <p className="text-xl lg:text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 shrink-0 ${kpi.accent}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sales & Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sales & Estimated Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="biRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="biProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="url(#biRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" name="Est. Profit" stroke="#10b981" fill="url(#biProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {totalCost === 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Tip: Add <strong>Cost Price</strong> in product form to see accurate profit margins.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Funnel + Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Product Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 13,
                      }}
                    />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="inside" fill="#fff" stroke="none" dataKey="name" />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Projected sales (next 7 days)</p>
                <p className="text-3xl font-bold text-primary">₹{Math.round(forecast.next7Total).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. daily revenue (last 7 days)</p>
                <p className="text-xl font-semibold">₹{Math.round(forecast.avgDaily).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Based on the average daily revenue from the last 7 paid days.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products + Low Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Products by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProductsByRevenue.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {topProductsByRevenue.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium truncate">{p.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">₹{p.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{p.qty} sold · ₹{p.profit.toLocaleString()} est. profit</p>
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
                <TrendingDown className="h-5 w-5 text-destructive" />
                Low-Conversion Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowConversionProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No low-conversion products in this period</p>
              ) : (
                <div className="space-y-3">
                  {lowConversionProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.views} views · 0 sales</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        ₹{p.potentialRevenue.toLocaleString()} potential
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product-wise Profit Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Product-Wise Profit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium text-right">Sold</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Est. Cost</th>
                    <th className="pb-2 font-medium text-right">Est. Profit</th>
                    <th className="pb-2 font-medium text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {productProfitAnalysis.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-medium truncate max-w-[200px]">{p.name}</td>
                      <td className="py-3 text-right">{p.qty}</td>
                      <td className="py-3 text-right">₹{p.revenue.toLocaleString()}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {p.hasCost ? `₹${p.cost.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {p.hasCost ? `₹${p.profit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 text-right">
                        {p.hasCost ? (
                          <Badge variant={p.margin >= 30 ? 'default' : p.margin >= 15 ? 'secondary' : 'destructive'}>
                            {p.margin.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Customer Trends + Trending Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customer Purchase Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerTrends}>
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
                    <Legend />
                    <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="payingCustomers" name="Paying Customers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Paying Customers</p>
                  <p className="text-xl font-bold">{totalCustomers}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Returning Orders</p>
                  <p className="text-xl font-bold">{returningCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Trending Products (90 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trending.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No trending data yet</p>
              ) : (
                <div className="space-y-3">
                  {trending.map((t, i) => {
                    const product = productMap.get(t.product_id);
                    return (
                      <div key={t.product_id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                          <span className="text-sm font-medium truncate">{product?.name || 'Unknown Product'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">{t.total_sold} sold</p>
                          <p className="text-xs text-muted-foreground">{t.order_count} orders</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBusinessIntelligence;

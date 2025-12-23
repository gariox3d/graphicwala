import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        // Fetch orders count and revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, payment_status');

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch profiles count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (orders) {
          const paidOrders = orders.filter(o => o.payment_status === 'paid');
          const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
          const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
          const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
          const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

          // Get recent orders
          const { data: recentOrders } = await supabase
            .from('orders')
            .select('*, profiles!orders_user_id_fkey(full_name)')
            .order('created_at', { ascending: false })
            .limit(5);

          setStats({
            totalOrders: orders.length,
            totalRevenue,
            totalUsers: usersCount || 0,
            totalProducts: productsCount || 0,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            recentOrders: recentOrders || [],
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const orderStatusCards = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Cancelled Orders',
      value: stats.cancelledOrders,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderStatusCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.full_name || 'Unknown Customer'} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild size="lg" className="h-16">
            <Link to="/admin/products/new">
              <Package className="mr-2 h-5 w-5" />
              Add New Product
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16">
            <Link to="/admin/orders">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Manage Orders
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16">
            <Link to="/admin/products">
              <Package className="mr-2 h-5 w-5" />
              View Products
            </Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

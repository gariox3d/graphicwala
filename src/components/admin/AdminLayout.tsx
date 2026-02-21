import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Star,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  Truck,
  FolderOpen,
  Ticket,
  MessageSquare,
  Moon
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
  }, [location.pathname]);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/settings', label: 'Delivery & Settings', icon: Truck },
    { path: '/admin/festival-theme', label: 'Festival Theme', icon: Moon },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Graphic Wala</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-foreground'}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium flex-1">{item.label}</span>
                {item.path === '/admin/messages' && unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                View Store
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 lg:ml-0 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

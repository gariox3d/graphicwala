import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface RecentOrder {
  customer_name: string;
  shipping_city: string;
  product_name: string;
  created_at: string;
}

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Patna', 'Lucknow', 'Jaipur', 'Pune', 'Hyderabad', 'Chennai'];

const SocialProofNotifications = () => {
  const [visible, setVisible] = useState(false);
  const [currentNotif, setCurrentNotif] = useState<{ type: 'viewer' | 'order'; text: string; subtext?: string } | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [notifIndex, setNotifIndex] = useState(0);

  // Fetch recent paid orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('customer_name, shipping_city, created_at, order_items(product_name)')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const orders: RecentOrder[] = data.map((o: any) => ({
          customer_name: o.customer_name || 'Someone',
          shipping_city: o.shipping_city || INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)],
          product_name: o.order_items?.[0]?.product_name || '',
          created_at: o.created_at,
        }));
        setRecentOrders(orders);
      }
    };
    fetchRecentOrders();
  }, []);

  // Generate fake viewer count (realistic range)
  const getViewerCount = useCallback(() => {
    return Math.floor(Math.random() * 8) + 3; // 3-10
  }, []);

  // Get time ago text
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  // Cycle notifications
  useEffect(() => {
    if (dismissed) return;

    const showNotification = () => {
      const isViewerType = notifIndex % 3 === 0; // Every 3rd is viewer count

      if (isViewerType) {
        setCurrentNotif({
          type: 'viewer',
          text: `🔥 ${getViewerCount()} people are viewing this page right now`,
        });
      } else if (recentOrders.length > 0) {
        const order = recentOrders[notifIndex % recentOrders.length];
        const firstName = order.customer_name.split(' ')[0];
        // Mask name: show first 2 chars + ***
        const maskedName = firstName.length > 2 
          ? firstName.slice(0, 2) + '***' 
          : firstName + '***';
        setCurrentNotif({
          type: 'order',
          text: `${maskedName} just placed an order`,
          subtext: `📍 ${order.shipping_city} • ${getTimeAgo(order.created_at)}`,
        });
      } else {
        setCurrentNotif({
          type: 'viewer',
          text: `🔥 ${getViewerCount()} people are viewing this page right now`,
        });
      }

      setVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);

      setNotifIndex(prev => prev + 1);
    };

    // First notification after 5 seconds
    const initialTimer = setTimeout(showNotification, 5000);

    // Then every 12 seconds
    const interval = setInterval(showNotification, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, notifIndex, recentOrders, getViewerCount]);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 max-w-[320px] sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {visible && currentNotif && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative flex items-start gap-3 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3.5 pr-9 shadow-xl"
          >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${
              currentNotif.type === 'viewer'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {currentNotif.type === 'viewer' ? (
                <Eye className="h-4.5 w-4.5" />
              ) : (
                <ShoppingBag className="h-4.5 w-4.5" />
              )}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {currentNotif.text}
              </p>
              {currentNotif.subtext && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentNotif.subtext}
                </p>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialProofNotifications;

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, Loader2, PhoneCall } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrderTimeline from '@/components/OrderTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { WHATSAPP_NUMBER } from '@/lib/types';
import { toast } from 'sonner';

interface TrackedOrder {
  id: string;
  customer_name: string | null;
  status: string;
  payment_status: string | null;
  total_amount: number;
  delivery_charge: number | null;
  delivery_method: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  items: { name: string; quantity: number }[];
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const TrackOrder = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!orderId.trim()) {
      toast.error('Please enter your Order ID');
      return;
    }
    if (cleanPhone.length < 10) {
      toast.error('Please enter the 10-digit phone number used on the order');
      return;
    }

    setLoading(true);
    setSearched(false);
    setOrder(null);
    try {
      const { data, error } = await supabase.rpc('track_order', {
        p_order_id: orderId.trim(),
        p_phone: cleanPhone,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      setOrder((row as unknown as TrackedOrder) || null);
    } catch (err) {
      console.error('Track order failed:', err);
      toast.error('Could not track this order. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Track Your Order | Graphic Wala</title>
        <meta
          name="description"
          content="Track your Graphic Wala order status online. Enter your Order ID and registered phone number to see live printing and delivery updates."
        />
        <link rel="canonical" href="https://graphicwala.com/track-order" />
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
              <Package className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your Order ID and the phone number used while ordering to see live status.
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 3f9c1a2b-..."
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {searched && !order && (
            <Card className="mt-6 border-destructive/40">
              <CardContent className="p-5 text-center space-y-3">
                <p className="font-semibold text-destructive">No order found</p>
                <p className="text-sm text-muted-foreground">
                  Please check your Order ID and phone number. Both must match the details used at checkout.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(
                      'Hi, I need help tracking my order.',
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Get help on WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {order && (
            <Card className="mt-6">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm break-all">{order.id}</p>
                  </div>
                  <Badge className="capitalize">{order.status}</Badge>
                </div>

                <OrderTimeline currentStatus={order.status} />

                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Customer</p>
                    <p className="font-medium">{order.customer_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Order Date</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Payment</p>
                    <p className="font-medium capitalize">{order.payment_status || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Amount</p>
                    <p className="font-bold text-primary">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fulfilment</p>
                    <p className="font-medium capitalize">{order.delivery_method || 'delivery'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Expected Delivery</p>
                    <p className="font-medium">{formatDate(order.estimated_delivery_date)}</p>
                  </div>
                </div>

                {order.items?.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Items</p>
                    <ul className="space-y-1 text-sm">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Last updated: {formatDate(order.updated_at)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
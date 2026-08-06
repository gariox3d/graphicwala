import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/seo/Seo';
import WhatsAppButton from '@/components/WhatsAppButton';
import CallButton from '@/components/CallButton';
import ReturnPolicy from '@/components/ReturnPolicy';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import DeliveryCountdown from '@/components/products/DeliveryCountdown';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, Image, MessageCircle, AlertTriangle, Loader2, Truck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // SECURITY: Validate orderId format (UUID)
      if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        setError('Failed to fetch order');
        setLoading(false);
        return;
      }

      // SECURITY: Order must exist and have payment_status = 'paid'
      if (!orderData) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      // CRITICAL: Only show confirmation for PAID orders
      if (orderData.payment_status !== 'paid') {
        console.error('Order payment not completed:', orderData.payment_status);
        setError('Payment not completed for this order');
        setLoading(false);
        return;
      }

      // Additional verification: razorpay_payment_id must exist for paid orders
      if (!orderData.razorpay_payment_id) {
        console.error('Order marked as paid but missing payment ID');
        setError('Invalid payment verification');
        setLoading(false);
        return;
      }

      // Fetch order items only after verifying payment
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      setOrder({
        ...orderData,
        order_items: itemsData || [],
      } as Order);
      setVerified(true);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  // Handle error state - redirect to cart with error message
  useEffect(() => {
    if (!loading && error) {
      toast.error(error === 'Payment not completed for this order' 
        ? 'Payment not completed. No order was placed.' 
        : 'Invalid or unpaid order.');
      navigate('/cart');
    }
  }, [loading, error, navigate]);

  // Auto-open WhatsApp with order details after payment verified
  useEffect(() => {
    if (!verified || !order) return;
    const shortId = order.id.slice(0, 8).toUpperCase();
    const name = order.customer_name || 'Customer';
    const itemsList = order.order_items?.map((item: OrderItem) => 
      `• ${item.product_name} x${item.quantity}`
    ).join('\n') || '';
    
    const msg = `🎉 *New Order Placed!*

👤 Name: ${name}
📦 Order ID: #${shortId}
💰 Total: ₹${Number(order.total_amount).toLocaleString()}

*Items:*
${itemsList}

📍 Delivery: ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
📞 Phone: ${order.shipping_phone}

_Sent from Graphic Wala Store_`;

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    
    const timer = setTimeout(() => {
      window.open(whatsappLink, '_blank');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [verified, order]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying payment status...</p>
            <p className="text-xs text-muted-foreground">Please do not refresh this page</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SECURITY: Only render confirmation if order is verified as paid
  if (!verified || !order) {
    return null; // Redirect handled by error useEffect
  }


  const hasDesigns = order.order_items?.some(
    (item) => item.front_design_url || item.back_design_url
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="Order Confirmed | Graphic Wala"
        description="Your Graphic Wala order is confirmed. Track printing and delivery updates for your custom order."
        path="/order-confirmation"
        noindex
      />
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>

          {/* WhatsApp & Call Support Banner */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact us anytime for order updates or assistance
                  </p>
                </div>
                <div className="flex gap-3">
                  <WhatsAppButton
                    message={`Hi ${BUSINESS_NAME}, I just placed order #${order.id.slice(0, 8)}. I need help with my order.`}
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  />
                  <CallButton variant="outline" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize font-medium text-green-600">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="capitalize font-medium text-green-600">
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                {order.delivery_charge !== undefined && order.delivery_charge !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{Number(order.delivery_charge) > 0 ? `₹${Number(order.delivery_charge).toLocaleString()}` : 'Free'}</span>
                  </div>
                )}
                {order.coupon_code && order.coupon_discount && Number(order.coupon_discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      Coupon ({order.coupon_code})
                    </span>
                    <span>-₹{Number(order.coupon_discount).toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer_name && (
                  <p className="font-semibold mb-1">{order.customer_name}</p>
                )}
                <p className="text-foreground">{order.shipping_address}</p>
                <p className="text-foreground">
                  {order.shipping_city}, {order.shipping_state} -{' '}
                  {order.shipping_pincode}
                </p>
                <p className="text-muted-foreground mt-2">
                  Phone: {order.shipping_phone}
                </p>
                {order.email && (
                  <p className="text-muted-foreground">Email: {order.email}</p>
                )}
                {order.order_notes && (
                  <div className="mt-3 p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {order.order_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start py-3 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ₹
                        {Number(item.product_price).toLocaleString()}
                      </p>
                      {(item.front_design_url || item.back_design_url) && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Image className="h-3 w-3" />
                          Custom design uploaded
                        </div>
                      )}
                    </div>
                    <p className="font-semibold">
                      ₹{(Number(item.product_price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {order.razorpay_payment_id && (
            <Card className="mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-sm">
                    {order.razorpay_payment_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Razorpay Order ID</span>
                  <span className="font-mono text-sm">{order.razorpay_order_id}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Estimate */}
          <Card className="mt-6 bg-green-50 border-green-200 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Estimated Delivery</h4>
                  <p className="text-sm text-green-700 mt-1">
                    🚚 Your order will be delivered in 5-7 working days.
                  </p>
                  {order.estimated_delivery_date && (
                    <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      📅 Expected by: <strong>{new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</strong>
                    </p>
                  )}
                  <p className="text-xs text-green-600 mt-2">
                    You will be notified once your order is shipped.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Policy */}
          <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <ReturnPolicy orderId={order.id.slice(0, 8).toUpperCase()} />
          </div>

          {/* What's Next Info */}
          {hasDesigns && (
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Image className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Custom Design Order</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your uploaded designs will be reviewed by our team. We'll contact you
                      on WhatsApp if any changes are needed before printing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">View All Orders</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${BUSINESS_NAME}, I just placed order #${order.id.slice(0, 8)}.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="font-medium hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
};

export default OrderConfirmation;
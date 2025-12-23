import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, MapPin, CreditCard } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { user, profile } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [user, cartItems, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { fullName, phone, address, city, state, pincode } = formData;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      toast.error('Please fill in all fields');
      return false;
    }
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay', {
        body: {
          action: 'create-order',
          amount: cartTotal,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            user_id: user?.id,
          },
        },
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create payment order');
      }

      const { order, key_id } = orderData;

      // Create order in database with pending status
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: cartTotal,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_state: formData.state,
          shipping_pincode: formData.pincode,
          shipping_phone: formData.phone,
          razorpay_order_id: order.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB Error:', dbError);
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: dbOrder.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown Product',
        product_price: item.products?.price || 0,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Items Error:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Initialize Razorpay checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Graphic Wala',
        description: 'Purchase from Graphic Wala',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
              body: {
                action: 'verify-payment',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: dbOrder.id,
              },
            });

            if (verifyError || !verifyData?.verified) {
              throw new Error('Payment verification failed');
            }

            // Clear cart and redirect
            await clearCart();
            toast.success('Payment successful! Order confirmed.');
            navigate(`/order-confirmation/${dbOrder.id}`);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: user?.email,
          contact: formData.phone,
        },
        theme: {
          color: '#dc2626',
        },
        modal: {
          ondismiss: async () => {
            // Update order status to cancelled if payment was dismissed
            await supabase
              .from('orders')
              .update({ status: 'cancelled', payment_status: 'failed' })
              .eq('id', dbOrder.id);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Order Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img
                          src={item.products?.image_url || '/placeholder.svg'}
                          alt={item.products?.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.products?.price?.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{((item.products?.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ₹{cartTotal.toLocaleString()}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Razorpay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PriceBreakdown from '@/components/PriceBreakdown';
import SupportContact from '@/components/SupportContact';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import { useStoreSettings, getProductDeliveryCharge } from '@/hooks/useStoreSettings';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, MapPin, CreditCard, Image, AlertCircle, Truck, Store } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ProductDesigns {
  [productId: string]: Record<string, string>;
}

const Checkout = () => {
  const { user, profile } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productDesigns, setProductDesigns] = useState<ProductDesigns>({});
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const { settings } = useStoreSettings();

  // Calculate delivery charge
  const calculateDeliveryCharge = () => {
    if (deliveryMethod === 'store_pickup') return 0;
    let totalDelivery = 0;
    cartItems.forEach(item => {
      const product = item.products as Product & { delivery_charge?: number | null };
      const deliveryCharge = getProductDeliveryCharge(product?.delivery_charge, settings?.default_delivery_charge || 0);
      totalDelivery += deliveryCharge;
    });
    return totalDelivery;
  };

  const deliveryCharge = calculateDeliveryCharge();
  const totalPayable = cartTotal + deliveryCharge;
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    landmark: '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    orderNotes: '',
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

    // Load saved designs from sessionStorage
    const savedDesigns = sessionStorage.getItem('productDesigns');
    if (savedDesigns) {
      setProductDesigns(JSON.parse(savedDesigns));
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [user, cartItems, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        phone: profile.phone || prev.phone,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        state: profile.state || prev.state,
        pincode: profile.pincode || prev.pincode,
      }));
    }
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [profile, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getUploadConfig = (product: any): { id: string; label: string; required: boolean }[] => {
    if (!product) return [];
    if (product.upload_config && Array.isArray(product.upload_config) && product.upload_config.length > 0) {
      return product.upload_config;
    }
    return [];
  };

  const validateForm = () => {
    const { fullName, phone, address, city, state, pincode } = formData;
    
    // For home delivery, address is required
    if (deliveryMethod === 'home_delivery') {
      if (!fullName || !phone || !address || !city || !state || !pincode) {
        toast.error('Please fill in all required fields');
        return false;
      }
      if (pincode.length !== 6) {
        toast.error('Please enter a valid 6-digit pincode');
        return false;
      }
    } else {
      // Store pickup - only name and phone required
      if (!fullName || !phone) {
        toast.error('Please fill in your name and phone number');
        return false;
      }
    }

    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    // Check if customizable products have required designs using upload_config
    for (const item of cartItems) {
      const config = getUploadConfig(item.products);
      const requiredFields = config.filter(f => f.required);
      const designs = productDesigns[item.product_id] || {};
      
      for (const field of requiredFields) {
        if (!designs[field.id]) {
          toast.error(`Please upload ${field.label} for ${item.products?.name}`);
          return false;
        }
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create Razorpay order with total including delivery
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'razorpay',
        {
          body: {
            action: 'create-order',
            amount: totalPayable,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
              user_id: user?.id,
            },
          },
        }
      );

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create payment order');
      }

      const { order, key_id } = orderData;

      // Build full address with landmark
      const fullAddress = deliveryMethod === 'store_pickup' 
        ? `Store Pickup: ${settings?.pickup_address || 'Graphic Wala Shop'}`
        : (formData.landmark
          ? `${formData.address}, ${formData.landmark}`
          : formData.address);

      // Create order in database with pending status
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: totalPayable,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: fullAddress,
          shipping_city: deliveryMethod === 'store_pickup' ? 'Store Pickup' : formData.city,
          shipping_state: deliveryMethod === 'store_pickup' ? '-' : formData.state,
          shipping_pincode: deliveryMethod === 'store_pickup' ? '000000' : formData.pincode,
          shipping_phone: formData.phone,
          razorpay_order_id: order.id,
          customer_name: formData.fullName,
          email: formData.email || null,
          landmark: formData.landmark || null,
          order_notes: formData.orderNotes || null,
          delivery_method: deliveryMethod,
          delivery_charge: deliveryCharge,
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB Error:', dbError);
        throw new Error('Failed to create order');
      }

      // Create order items with design URLs
      const orderItemsData = cartItems.map((item) => {
        const designs = productDesigns[item.product_id] || {};
        return {
          order_id: dbOrder.id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          product_price: item.products?.price || 0,
          quantity: item.quantity,
          front_design_url: designs['front'] || null,
          back_design_url: designs['back'] || null,
          design_approval_status: Object.keys(designs).length > 0 ? 'pending' : null,
        };
      });

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) {
        console.error('Items Error:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Save uploads to order_item_uploads table
      if (insertedItems) {
        for (let i = 0; i < insertedItems.length; i++) {
          const orderItem = insertedItems[i];
          const cartItem = cartItems[i];
          const config = getUploadConfig(cartItem.products);
          const designs = productDesigns[cartItem.product_id] || {};
          
          const uploadRecords = config
            .filter(field => designs[field.id])
            .map(field => ({
              order_item_id: orderItem.id,
              field_id: field.id,
              label: field.label,
              required: field.required,
              file_url: designs[field.id],
            }));
          
          if (uploadRecords.length > 0) {
            await supabase.from('order_item_uploads').insert(uploadRecords);
          }
        }
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
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke('razorpay', {
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

            // Clear cart and session storage
            await clearCart();
            sessionStorage.removeItem('productDesigns');
            toast.success('Payment successful! Order confirmed.');
            navigate(`/order-confirmation/${dbOrder.id}`);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email || user?.email,
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

  const missingDesigns = cartItems.filter((item) => {
    const config = getUploadConfig(item.products);
    const requiredFields = config.filter(f => f.required);
    const designs = productDesigns[item.product_id] || {};
    return requiredFields.some(f => !designs[f.id]);
  });
  const hasCustomizableProducts = cartItems.some((item) => {
    const config = getUploadConfig(item.products);
    return config.length > 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Missing Designs Warning */}
              {missingDesigns.length > 0 && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Designs Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please upload designs for the following products before checkout:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2">
                          {missingDesigns.map((item) => (
                            <li key={item.id}>{item.products?.name}</li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => navigate('/cart')}
                        >
                          Go to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Details
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
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Building, Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Near temple, school, etc."
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

                  <div className="space-y-2">
                    <Label htmlFor="orderNotes">Order Notes / Special Instructions (Optional)</Label>
                    <Textarea
                      id="orderNotes"
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(value) => setDeliveryMethod(value as 'home_delivery' | 'store_pickup')}
                    className="space-y-4"
                  >
                    <div className={`flex items-start space-x-3 p-4 border rounded-lg ${deliveryMethod === 'home_delivery' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="home_delivery" id="home_delivery" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="home_delivery" className="font-medium flex items-center gap-2 cursor-pointer">
                          <Truck className="h-4 w-4" />
                          Home Delivery
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll deliver to your address. Delivery charge: ₹{deliveryCharge > 0 ? deliveryCharge.toLocaleString() : 'Free'}
                        </p>
                      </div>
                    </div>
                    
                    {settings?.store_pickup_enabled && (
                      <div className={`flex items-start space-x-3 p-4 border rounded-lg ${deliveryMethod === 'store_pickup' ? 'border-primary bg-primary/5' : ''}`}>
                        <RadioGroupItem value="store_pickup" id="store_pickup" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="store_pickup" className="font-medium flex items-center gap-2 cursor-pointer">
                            <Store className="h-4 w-4" />
                            Store Pickup (Free)
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Collect from: {settings?.pickup_address || 'Graphic Wala Shop'}
                          </p>
                        </div>
                      </div>
                    )}
                  </RadioGroup>

                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      💳 Cash on Delivery is not available. All orders must be prepaid.
                    </p>
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
                    {cartItems.map((item) => {
                      const designs = productDesigns[item.product_id];
                      const hasDesign = designs?.front || designs?.back;

                      return (
                        <div key={item.id} className="flex gap-4 items-start">
                          <img
                            src={item.products?.image_url || '/placeholder.svg'}
                            alt={item.products?.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.products?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹
                              {item.products?.price?.toLocaleString()}
                            </p>
                            {hasDesign && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                <Image className="h-3 w-3" />
                                Design uploaded
                              </div>
                            )}
                          </div>
                          <p className="font-semibold">
                            ₹
                            {(
                              (item.products?.price || 0) * item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
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
                  <PriceBreakdown
                    productTotal={cartTotal}
                    deliveryCharge={deliveryMethod === 'home_delivery' ? deliveryCharge : 0}
                    deliveryMethod={deliveryMethod}
                    showDetails={false}
                  />
                  
                  <Button
                    onClick={handlePayment}
                    disabled={loading || missingDesigns.length > 0}
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
                        Pay ₹{totalPayable.toLocaleString()}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure prepaid payment via Razorpay
                  </p>

                  {/* Support Section */}
                  <div className="pt-4 border-t">
                    <SupportContact variant="compact" message="Hi, I need help with my checkout." />
                  </div>
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

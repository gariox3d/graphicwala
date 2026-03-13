import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CouponInput, { AppliedCoupon } from '@/components/CouponInput';
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
import LoyaltyRedeemCheckout from '@/components/loyalty/LoyaltyRedeemCheckout';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import PhotoPrivacyNotice from '@/components/PhotoPrivacyNotice';
import ReturnPolicy from '@/components/ReturnPolicy';
import DeliveryCountdown, { calculateEstimatedDeliveryDate } from '@/components/products/DeliveryCountdown';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Product, getEffectivePrice } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, MapPin, CreditCard, Image, AlertCircle, Truck, Store, Package, CheckCircle2, Plus, Minus, Trash2 } from 'lucide-react';

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
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productDesigns, setProductDesigns] = useState<ProductDesigns>({});
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const { settings } = useStoreSettings();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);

  // Calculate delivery charge from product-level charges only
  const calculateDeliveryCharge = useCallback(() => {
    if (deliveryMethod === 'store_pickup') return 0;
    let totalDelivery = 0;
    cartItems.forEach(item => {
      const product = item.products as Product & { delivery_charge?: number | null };
      totalDelivery += (product?.delivery_charge || 0);
    });
    return totalDelivery;
  }, [deliveryMethod, cartItems]);

  const deliveryCharge = calculateDeliveryCharge();
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  // Calculate bulk discount
  const bulkDiscount = (() => {
    if (!settings?.bulk_discount_enabled) return 0;
    const minQty = settings.bulk_discount_min_qty || 2;
    const pct = settings.bulk_discount_percent || 10;
    let discount = 0;
    for (const item of cartItems) {
      if (item.quantity >= minQty && item.products) {
        const price = (item.products as any).sale_price && (item.products as any).sale_end && new Date((item.products as any).sale_end) > new Date()
          ? (item.products as any).sale_price
          : item.products.price;
        discount += price * item.quantity * (pct / 100);
      }
    }
    return Math.round(discount * 100) / 100;
  })();

  const totalPayable = Math.max(0, cartTotal + deliveryCharge - couponDiscount - bulkDiscount - loyaltyDiscount);
  
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
      // Build full address with landmark
      const fullAddress = deliveryMethod === 'store_pickup' 
        ? `Store Pickup: ${settings?.pickup_address || 'Graphic Wala Shop'}`
        : (formData.landmark
          ? `${formData.address}, ${formData.landmark}`
          : formData.address);

      // Calculate estimated delivery date using working days calculation
      const formattedDeliveryDate = calculateEstimatedDeliveryDate("17:00", 7);

      // Prepare order data to send to server (NOT creating order yet)
      const orderPayload = {
        user_id: user!.id,
        total_amount: totalPayable,
        shipping_address: fullAddress,
        shipping_city: deliveryMethod === 'store_pickup' ? 'Store Pickup' : formData.city,
        shipping_state: deliveryMethod === 'store_pickup' ? '-' : formData.state,
        shipping_pincode: deliveryMethod === 'store_pickup' ? '000000' : formData.pincode,
        shipping_phone: formData.phone,
        customer_name: formData.fullName,
        email: formData.email || null,
        landmark: formData.landmark || null,
        order_notes: formData.orderNotes || null,
        delivery_method: deliveryMethod,
        delivery_charge: deliveryCharge,
        delivery_days_used: 7,
        estimated_delivery_date: formattedDeliveryDate,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
      };

      // Prepare order items data
      const orderItemsPayload = cartItems.map((item) => {
        const designs = productDesigns[item.product_id] || {};
        const config = getUploadConfig(item.products);
        return {
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          product_price: getEffectivePrice(item.products as Product),
          quantity: item.quantity,
          front_design_url: designs['front'] || null,
          back_design_url: designs['back'] || null,
          design_approval_status: Object.keys(designs).length > 0 ? 'pending' : null,
          uploads: config
            .filter(field => designs[field.id])
            .map(field => ({
              field_id: field.id,
              label: field.label,
              required: field.required,
              file_url: designs[field.id],
            })),
        };
      });

      // STEP 1: Create Razorpay order ONLY (no database order yet)
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

      // STEP 2: Initialize Razorpay checkout (NO order in database yet)
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Graphic Wala',
        description: 'Purchase from Graphic Wala',
        order_id: order.id,
        handler: async (response: any) => {
          setLoading(true);
          try {
            // CRITICAL: Validate we received all required payment response fields
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error('Incomplete payment response. Please contact support.');
            }

            // STEP 3: Verify payment AND create order ONLY after successful payment
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke('razorpay', {
                body: {
                  action: 'verify-and-create-order',
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_data: orderPayload,
                  order_items: orderItemsPayload,
                },
              });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            // Payment verified and order created successfully
            // Track coupon usage
            if (appliedCoupon && verifyData.order_id) {
              await supabase.from('coupon_usage').insert({
                coupon_id: appliedCoupon.id,
                user_id: user!.id,
                order_id: verifyData.order_id,
              });
              // Increment used_count
              await supabase.rpc('increment_coupon_usage' as any, { coupon_id_input: appliedCoupon.id });
            }

            await clearCart();
            sessionStorage.removeItem('productDesigns');
            toast.success('Payment successful! Order confirmed.');
            navigate(`/order-confirmation/${verifyData.order_id}`, { replace: true });
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed. Please contact support.');
            navigate('/cart', { replace: true });
          } finally {
            setLoading(false);
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
          ondismiss: () => {
            // Payment cancelled/closed - NO order was created
            toast.error('Payment not completed. Order not placed.');
            setLoading(false);
            navigate('/cart', { replace: true });
          },
          escape: false,
          confirm_close: true,
        },
      };

      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure event
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setLoading(false);
        navigate('/cart', { replace: true });
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
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
      <main className="flex-1 py-6 md:py-12">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 min-w-0 space-y-6">
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
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {/* Delivery confirmation */}
                  {deliveryMethod === 'home_delivery' && formData.pincode.length === 6 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">✅ Delivery available to {formData.pincode}</span>
                      </div>
                    </div>
                  )}

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
                    onValueChange={(value) => {
                      setDeliveryMethod(value as 'home_delivery' | 'store_pickup');
                    }}
                    className="space-y-4"
                  >
                    <div className={`flex items-start gap-3 p-3 sm:p-4 border rounded-lg ${deliveryMethod === 'home_delivery' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="home_delivery" id="home_delivery" className="mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="home_delivery" className="font-medium flex items-center gap-2 cursor-pointer">
                          <Truck className="h-4 w-4 shrink-0" />
                          Home Delivery
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          Delivery: {deliveryCharge > 0 ? `₹${deliveryCharge.toLocaleString()}` : 'Free'} • 5-7 working days
                        </p>
                      </div>
                    </div>
                    
                    {settings?.store_pickup_enabled && (
                      <div className={`flex items-start gap-3 p-3 sm:p-4 border rounded-lg ${deliveryMethod === 'store_pickup' ? 'border-primary bg-primary/5' : ''}`}>
                        <RadioGroupItem value="store_pickup" id="store_pickup" className="mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="store_pickup" className="font-medium flex items-center gap-2 cursor-pointer">
                            <Store className="h-4 w-4 shrink-0" />
                            Store Pickup (Free)
                          </Label>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words leading-snug">
                            Collect from: {settings?.pickup_address || 'Graphic Wala Shop'}
                          </p>
                        </div>
                      </div>
                    )}
                  </RadioGroup>

                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="shrink-0 mt-0.5">💳</span>
                      <p className="text-xs sm:text-sm text-destructive font-medium leading-snug break-words">
                        Cash on Delivery is not available. All orders must be prepaid.
                      </p>
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
                    {cartItems.map((item) => {
                      const designs = productDesigns[item.product_id];
                      const hasDesign = designs?.front || designs?.back;

                      return (
                      <div key={item.id} className="flex gap-3 items-start">
                          <img
                            src={item.products?.image_url || '/placeholder.svg'}
                            alt={item.products?.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{item.products?.name}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              ₹{getEffectivePrice(item.products as Product).toLocaleString()} each
                              {item.products && getEffectivePrice(item.products as Product) < item.products.price && (
                                <span className="line-through ml-1 text-xs">₹{item.products.price.toLocaleString()}</span>
                              )}
                            </p>
                            {hasDesign && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                <Image className="h-3 w-3" />
                                Design uploaded
                              </div>
                            )}
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-muted transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center border-x">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-muted transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="font-semibold text-right">
                            ₹{(getEffectivePrice(item.products as Product) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                    
                    {/* Privacy notice when designs are uploaded */}
                    {hasCustomizableProducts && (
                      <div className="pt-3 border-t">
                        <PhotoPrivacyNotice />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="min-w-0">
              <Card className="lg:sticky lg:top-24">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <CreditCard className="h-5 w-5 text-primary shrink-0" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  <PriceBreakdown
                    productTotal={cartTotal}
                    deliveryCharge={deliveryMethod === 'home_delivery' ? deliveryCharge : 0}
                    deliveryMethod={deliveryMethod}
                    showDetails={false}
                    couponDiscount={couponDiscount}
                    couponCode={appliedCoupon?.code}
                    bulkDiscount={bulkDiscount}
                    loyaltyDiscount={loyaltyDiscount}
                  />

                  {bulkDiscount > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-xs sm:text-sm text-green-700 dark:text-green-300 break-words">
                      🎉 Bulk discount of ₹{bulkDiscount.toLocaleString()} applied! Buy {settings?.bulk_discount_min_qty}+ of same product to save {settings?.bulk_discount_percent}%
                    </div>
                  )}

                  {/* Coupon Code Input */}
                  <CouponInput
                    orderTotal={cartTotal}
                    onApply={setAppliedCoupon}
                    appliedCoupon={appliedCoupon}
                  />

                  {/* Loyalty Points Redeem */}
                  <LoyaltyRedeemCheckout
                    onApply={(discount) => {
                      setLoyaltyDiscount(discount);
                      setLoyaltyApplied(true);
                    }}
                    onRemove={() => {
                      setLoyaltyDiscount(0);
                      setLoyaltyApplied(false);
                    }}
                    applied={loyaltyApplied}
                  />

                  {/* Delivery Countdown & Estimate */}
                  {deliveryMethod === 'home_delivery' && (
                    <DeliveryCountdown 
                      cutoffTime="17:00"
                      deliveryDays={7}
                      variant="compact"
                      showDisclaimer={true}
                    />
                  )}
                  
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

                  {/* Return Policy */}
                  <ReturnPolicy variant="compact" className="mt-4" />

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

import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ShoppingBag, Zap, Image, AlertCircle, Upload, Truck, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Product, UploadField, getEffectivePrice } from '@/lib/types';
import DesignUpload from '@/components/DesignUpload';
import PriceBreakdown from '@/components/PriceBreakdown';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import { toast } from 'sonner';

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, loading } = useCart();
  const navigate = useNavigate();
  const [productDesigns, setProductDesigns] = useState<Record<string, Record<string, string>>>({});
  const [expandedUploads, setExpandedUploads] = useState<Set<string>>(new Set());

  // Calculate total delivery charge from product-level charges only
  const calculateDeliveryCharge = () => {
    let totalDelivery = 0;
    cartItems.forEach(item => {
      const product = item.products as Product & { delivery_charge?: number | null };
      // Use product's delivery charge directly, no fallback to global
      totalDelivery += (product?.delivery_charge || 0);
    });
    return totalDelivery;
  };

  const deliveryCharge = calculateDeliveryCharge();
  const totalPayable = cartTotal + deliveryCharge;

  // Load saved designs from session storage
  useEffect(() => {
    const savedDesigns = sessionStorage.getItem('productDesigns');
    if (savedDesigns) {
      setProductDesigns(JSON.parse(savedDesigns));
    }
  }, []);

  const getUploadConfig = (product: Product | undefined): UploadField[] => {
    if (!product) return [];
    if (product.upload_config && Array.isArray(product.upload_config) && product.upload_config.length > 0) {
      return product.upload_config as UploadField[];
    }
    return [];
  };

  const getMissingRequiredUploads = () => {
    const missing: { itemId: string; productName: string; fields: string[] }[] = [];
    
    cartItems.forEach(item => {
      const product = item.products as Product;
      const config = getUploadConfig(product);
      const requiredFields = config.filter(f => f.required);
      const designs = productDesigns[item.product_id] || {};
      
      const missingFields = requiredFields.filter(f => !designs[f.id]).map(f => f.label);
      
      if (missingFields.length > 0) {
        missing.push({
          itemId: item.id,
          productName: product?.name || 'Unknown',
          fields: missingFields,
        });
      }
    });
    
    return missing;
  };

  const handleDesignUpload = (productId: string, urls: Record<string, string>) => {
    const newDesigns = { ...productDesigns, [productId]: urls };
    setProductDesigns(newDesigns);
    sessionStorage.setItem('productDesigns', JSON.stringify(newDesigns));
  };

  const toggleUploadSection = (itemId: string) => {
    const newExpanded = new Set(expandedUploads);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedUploads(newExpanded);
  };

  const handleProceedToCheckout = () => {
    const missingUploads = getMissingRequiredUploads();
    
    if (missingUploads.length > 0) {
      toast.error('Please upload all required photos before checkout');
      // Expand all items with missing uploads
      const newExpanded = new Set(expandedUploads);
      missingUploads.forEach(m => newExpanded.add(m.itemId));
      setExpandedUploads(newExpanded);
      return;
    }
    
    navigate('/checkout');
  };

  const missingUploads = getMissingRequiredUploads();
  const canCheckout = missingUploads.length === 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Your Cart
          </h1>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/products">
                <Button variant="hero">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {/* Missing Uploads Warning */}
                {missingUploads.length > 0 && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-destructive">Photo Upload Required</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Please upload required photos before checkout:
                          </p>
                          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            {missingUploads.map((m) => (
                              <li key={m.itemId}>
                                <strong>{m.productName}:</strong> {m.fields.join(', ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cart Items */}
                {cartItems.map((item) => {
                  const product = item.products as Product;
                  const uploadConfig = getUploadConfig(product);
                  const hasCustomization = uploadConfig.length > 0;
                  const designs = productDesigns[item.product_id] || {};
                  const requiredFields = uploadConfig.filter(f => f.required);
                  const allRequiredUploaded = requiredFields.every(f => designs[f.id]);
                  const isExpanded = expandedUploads.has(item.id);
                  
                  return (
                    <Card key={item.id} className={!allRequiredUploaded && hasCustomization ? 'border-destructive/50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link to={`/product/${product?.id}`} className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {product?.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground/30">
                                {product?.name?.charAt(0)}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{product?.name}</h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-primary font-bold">₹{getEffectivePrice(product).toFixed(2)}</p>
                                  {product && getEffectivePrice(product) < product.price && (
                                    <p className="text-xs text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {hasCustomization && (
                                <Button
                                  variant={allRequiredUploaded ? 'outline' : 'destructive'}
                                  size="sm"
                                  onClick={() => toggleUploadSection(item.id)}
                                  className="gap-1"
                                >
                                  {allRequiredUploaded ? (
                                    <>
                                      <Image className="h-4 w-4" />
                                      View Photos
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      Upload Photos
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Upload Section */}
                        {hasCustomization && isExpanded && (
                          <div className="mt-4 pt-4 border-t">
                            <DesignUpload
                              productId={item.product_id}
                              productName={product?.name || ''}
                              uploadConfig={uploadConfig}
                              onUploadComplete={(urls) => handleDesignUpload(item.product_id, urls)}
                              existingDesigns={designs}
                              isCartMode={true}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Order Summary */}
              <div className="space-y-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PriceBreakdown
                      productTotal={cartTotal}
                      deliveryCharge={deliveryCharge}
                      showDetails={true}
                    />
                    
                    <Button
                      variant="hero"
                      className="w-full"
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={!canCheckout}
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      {canCheckout ? 'Proceed to Checkout' : 'Upload Photos First'}
                    </Button>
                    
                    {!canCheckout && (
                      <p className="text-xs text-destructive text-center">
                        Please upload all required photos above before checkout
                      </p>
                    )}
                    
                    <Link to="/products" className="block">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Delivery Info */}
                <DeliveryInfoBanner variant="compact" />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
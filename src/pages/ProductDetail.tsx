import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Image, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Product, UploadField } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import DesignUpload from '@/components/DesignUpload';
import WhatsAppButton from '@/components/WhatsAppButton';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        // Parse upload_config from JSON
        const uploadConfig = Array.isArray(data.upload_config) 
          ? data.upload_config as unknown as UploadField[]
          : [];
        setProduct({ ...data, upload_config: uploadConfig } as unknown as Product);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  // Load existing designs from session storage
  useEffect(() => {
    if (product) {
      const savedDesigns = sessionStorage.getItem('productDesigns');
      if (savedDesigns) {
        const designs = JSON.parse(savedDesigns);
        if (designs[product.id]) {
          setDesignUrls(designs[product.id]);
        }
      }
    }
  }, [product]);

  const getUploadConfig = (): UploadField[] => {
    if (!product?.customization_enabled) return [];
    
    // Use new upload_config if available
    if (product.upload_config && product.upload_config.length > 0) {
      return product.upload_config;
    }
    
    // Fallback to legacy fields
    const legacyConfig: UploadField[] = [];
    if (product.front_upload_required) {
      legacyConfig.push({ id: 'front', label: 'Front Design', required: true });
    }
    if (product.back_upload_enabled) {
      legacyConfig.push({ id: 'back', label: 'Back Design', required: false });
    }
    return legacyConfig;
  };

  const uploadConfig = getUploadConfig();
  const requiredFields = uploadConfig.filter(f => f.required);
  const allRequiredUploaded = requiredFields.every(f => designUrls[f.id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    // Store design URLs in sessionStorage for checkout
    if (Object.keys(designUrls).length > 0) {
      const designs = JSON.parse(sessionStorage.getItem('productDesigns') || '{}');
      designs[product.id] = designUrls;
      sessionStorage.setItem('productDesigns', JSON.stringify(designs));
    }

    addToCart(product.id, quantity);
    toast.success('Added to cart! You can upload designs now or before checkout.');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }

    // Check if required uploads are missing
    if (uploadConfig.length > 0 && !allRequiredUploaded) {
      toast.error('Please upload all required photos before proceeding');
      return;
    }

    // Store design URLs
    if (Object.keys(designUrls).length > 0) {
      const designs = JSON.parse(sessionStorage.getItem('productDesigns') || '{}');
      designs[product.id] = designUrls;
      sessionStorage.setItem('productDesigns', JSON.stringify(designs));
    }

    // Add to cart and go to checkout
    addToCart(product.id, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Link
            to="/products"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground/30">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.categories && (
                    <Badge variant="secondary">{product.categories.name}</Badge>
                  )}
                  {product.customization_enabled && (
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      <Image className="h-3 w-3 mr-1" />
                      Customizable
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-primary mb-4">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-muted-foreground mb-4">
                  {product.description || 'No description available.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">{product.stock_quantity} in stock</span>
                  ) : (
                    <span className="text-destructive">Out of stock</span>
                  )}
                </p>
              </div>

              {/* Customization Section */}
              {uploadConfig.length > 0 && (
                <DesignUpload
                  productId={product.id}
                  productName={product.name}
                  uploadConfig={uploadConfig}
                  onUploadComplete={(urls) => setDesignUrls(urls)}
                  existingDesigns={designUrls}
                />
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="hero"
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={product.stock_quantity === 0}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                </div>

                {uploadConfig.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    💡 You can upload photos now or add to cart and upload before checkout
                  </p>
                )}
              </div>

              {/* Help Section */}
              <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                <WhatsAppButton
                  message={`Hi, I'm interested in ${product.name} (₹${product.price}). Can you help me?`}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                />
                <p className="text-sm text-muted-foreground">
                  Need help? Chat with us on WhatsApp!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton variant="floating" showText={false} />
    </div>
  );
};

export default ProductDetail;

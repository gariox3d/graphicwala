import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, ArrowLeft, Minus, Plus, Image, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Product, UploadField, BUSINESS_NAME } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import DesignUpload from '@/components/DesignUpload';
import WhatsAppButton from '@/components/WhatsAppButton';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import SupportContact from '@/components/SupportContact';
import ShareButton from '@/components/ShareButton';
import PriceBreakdown from '@/components/PriceBreakdown';
import ProductReviews from '@/components/reviews/ProductReviews';
import LoginPromptDialog from '@/components/reviews/LoginPromptDialog';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ShippingEstimator from '@/components/shipping/ShippingEstimator';
import ReturnPolicy from '@/components/ReturnPolicy';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';

const SITE_URL = 'https://store.graphicwala.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-square.png`;
const SHARE_BASE_URL = `${SITE_URL}/share/product`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const [product, setProduct] = useState<(Product & { 
    delivery_charge?: number | null; 
    image_urls?: string[];
    weight_kg?: number;
  }) | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});
  
  // Get delivery charge from admin settings (default to 0 if not set)
  const deliveryCharge = settings?.default_delivery_charge ?? 0;

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        const uploadConfig = Array.isArray(data.upload_config) 
          ? data.upload_config as unknown as UploadField[]
          : [];
        const imageUrls = Array.isArray(data.image_urls) 
          ? data.image_urls as string[]
          : data.image_url ? [data.image_url] : [];
        setProduct({ 
          ...data, 
          upload_config: uploadConfig,
          delivery_charge: data.delivery_charge,
          image_urls: imageUrls,
          weight_kg: data.weight_kg ?? 0.5,
        } as any);
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
    // Check for new upload_config first - this is the primary source
    if (product?.upload_config && product.upload_config.length > 0) {
      return product.upload_config;
    }
    
    // Check customization_enabled flag (set by admin)
    if (!product?.customization_enabled) return [];
    
    // Fallback to legacy fields for backward compatibility
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

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      // Show login dialog if user tries to add to cart without login
      setShowLoginDialog(true);
      return;
    }

    // Check if required uploads are missing when user is logged in
    if (uploadConfig.length > 0 && requiredFields.length > 0 && !allRequiredUploaded) {
      toast.error('Please upload all required photos before adding to cart');
      return;
    }

    // Store design URLs in sessionStorage for checkout
    if (Object.keys(designUrls).length > 0) {
      const designs = JSON.parse(sessionStorage.getItem('productDesigns') || '{}');
      designs[product.id] = designUrls;
      sessionStorage.setItem('productDesigns', JSON.stringify(designs));
    }

    addToCart(product.id, quantity);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      // Show login dialog if user tries to buy without login
      setShowLoginDialog(true);
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

  // Generate SEO-friendly meta data
  const productTitle = `${product.name} | ${BUSINESS_NAME}`;
  const productDescription = product.description 
    ? `${product.description.slice(0, 140)}${product.description.length > 140 ? '...' : ''} Delivered across Bihar. Prepaid only.`
    : `Order ${product.name} from Graphic Wala. Premium quality with home delivery across Bihar. Prepaid orders only.`;
  const productUrl = `${SITE_URL}/product/${product.id}`;
  const shareUrl = `${SHARE_BASE_URL}/${product.id}`; // Use share URL for social previews
  const productImage = product.image_url || DEFAULT_OG_IMAGE;
  const categoryName = product.categories?.name || 'Custom Products';

  // Generate JSON-LD structured data for the product
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Custom ${product.name} from Graphic Wala`,
    "image": productImage,
    "url": productUrl,
    "brand": {
      "@type": "Brand",
      "name": BUSINESS_NAME
    },
    "category": categoryName,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": product.stock_quantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": BUSINESS_NAME
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressRegion": "Bihar",
          "addressCountry": "IN"
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{productTitle}</title>
        <meta name="title" content={productTitle} />
        <meta name="description" content={productDescription} />
        <link rel="canonical" href={productUrl} />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={productTitle} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:secure_url" content={productImage} />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1080" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={`${product.name} - ${BUSINESS_NAME}`} />
        <meta property="og:site_name" content={BUSINESS_NAME} />
        <meta property="og:locale" content="en_IN" />
        
        {/* Product-specific OG tags */}
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="INR" />
        <meta property="product:availability" content={product.stock_quantity > 0 ? "in stock" : "out of stock"} />
        <meta property="product:category" content={categoryName} />
        <meta property="product:brand" content={BUSINESS_NAME} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={productUrl} />
        <meta name="twitter:title" content={productTitle} />
        <meta name="twitter:description" content={productDescription} />
        <meta name="twitter:image" content={productImage} />
        <meta name="twitter:image:alt" content={`${product.name} - ${BUSINESS_NAME}`} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      </Helmet>

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
            {/* Product Images Gallery */}
            <ProductImageGallery 
              images={product.image_urls || (product.image_url ? [product.image_url] : [])} 
              productName={product.name} 
            />

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
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
                  <ShareButton productId={product.id} productName={product.name} />
                </div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
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

              {/* Delivery Estimate */}
              <ShippingEstimator
                quantity={quantity}
              />

              {/* Price Breakdown */}
              <Card>
                <CardContent className="pt-6">
                  <PriceBreakdown
                    productTotal={product.price * quantity}
                    deliveryCharge={deliveryCharge}
                    showDetails={true}
                  />
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      * Delivery charge: ₹{deliveryCharge.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

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

              {/* Delivery Info */}
              <DeliveryInfoBanner variant="compact" />

              {/* Return Policy */}
              <ReturnPolicy variant="compact" />

              {/* Help Section */}
              <SupportContact 
                variant="compact" 
                message={`Hi, I'm interested in ${product.name} (₹${product.price}). Can you help me?`}
              />
            </div>
          </div>

          {/* Reviews Section */}
          <Separator className="my-12" />
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton variant="floating" showText={false} />

      {/* Login Prompt Dialog */}
      <LoginPromptDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        title="Login Required"
        description="To upload photos and place a customized order, please login first."
      />
    </div>
  );
};

export default ProductDetail;

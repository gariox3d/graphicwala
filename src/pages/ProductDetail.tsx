import { useEffect, useState, useCallback, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, ArrowLeft, Minus, Plus, Image, Zap, Heart } from 'lucide-react';
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
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import SupportContact from '@/components/SupportContact';
import ShareButton from '@/components/ShareButton';
import PriceBreakdown from '@/components/PriceBreakdown';
import LoginPromptDialog from '@/components/reviews/LoginPromptDialog';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import DeliveryCountdown from '@/components/products/DeliveryCountdown';
import ReturnPolicy from '@/components/ReturnPolicy';
import StickyAddToCart from '@/components/products/StickyAddToCart';
import WhyBuyFromProduct from '@/components/products/WhyBuyFromProduct';
import SecurePaymentBadge from '@/components/SecurePaymentBadge';
import PincodeChecker from '@/components/shipping/PincodeChecker';
import { trackEvent } from '@/lib/analytics';
import { categorySlug } from '@/lib/categorySeo';

import WishlistButton from '@/components/products/WishlistButton';
import FlashSaleBadge from '@/components/products/FlashSaleBadge';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import LazySection from '@/components/LazySection';

// Below-the-fold, heavy sections: downloaded only when scrolled near.
const ProductReviews = lazy(() => import('@/components/reviews/ProductReviews'));
const ProductFAQ = lazy(() => import('@/components/products/ProductFAQ'));
const SimilarProducts = lazy(() => import('@/components/products/SimilarProducts'));
const RecentlyViewedProducts = lazy(() => import('@/components/products/RecentlyViewedProducts'));

const SITE_URL = 'https://www.graphicwala.com';

/**
 * Trims a meta string to `max` characters on a word boundary so titles and
 * descriptions never end mid-word. Falls back to `short` when provided.
 */
const clampText = (text: string, max: number, short?: string) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  if (short && short.length <= max) return short;
  return `${clean.slice(0, max - 1).replace(/[\s,–—-]+\S*$/, '')}…`;
};
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-square.png`;
const SHARE_BASE_URL = `${SITE_URL}/share/product`;

const ProductDetail = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const { viewedIds, addProduct: addToRecentlyViewed } = useRecentlyViewed();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<(Product & { 
    delivery_charge?: number | null; 
    image_urls?: string[];
    weight_kg?: number;
    cutoff_time?: string | null;
    delivery_days?: number | null;
    sale_price?: number | null;
    sale_start?: string | null;
    sale_end?: string | null;
  }) | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});
  const [reviewStats, setReviewStats] = useState<{ avg: number; count: number; reviews: any[] }>({ avg: 0, count: 0, reviews: [] });
  
  // Get delivery charge from product-level setting only
  const deliveryCharge = product?.delivery_charge ?? 0;

  useEffect(() => {
    const fetchProduct = async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId || '');
      const query = supabase.from('products').select('*, categories(*)');
      const { data } = isUuid
        ? await query.eq('id', slugOrId).maybeSingle()
        : await query.eq('slug', slugOrId).maybeSingle();
      if (data) {
        // Redirect UUID URLs to slug URLs for SEO
        if (isUuid && (data as any).slug && (data as any).slug !== slugOrId) {
          navigate(`/product/${(data as any).slug}`, { replace: true });
          return;
        }
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
    if (slugOrId) fetchProduct();
  }, [slugOrId, navigate]);

  // Track recently viewed
  useEffect(() => {
    if (product?.id) addToRecentlyViewed(product.id);
  }, [product?.id, addToRecentlyViewed]);

  // Conversion tracking: product view
  useEffect(() => {
    if (!product?.id) return;
    trackEvent('view_product', {
      item_id: product.id,
      item_name: product.name,
      value: product.price,
    });
  }, [product?.id, product?.name, product?.price]);

  // Fetch review stats for JSON-LD
  useEffect(() => {
    if (!product?.id) return;
    const fetchReviewStats = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating, user_name, comment, created_at')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data && data.length > 0) {
        const avg = Math.round((data.reduce((s, r) => s + r.rating, 0) / data.length) * 10) / 10;
        setReviewStats({ avg, count: data.length, reviews: data });
      }
    };
    fetchReviewStats();
  }, [product?.id]);

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
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      quantity,
      value: product.price * quantity,
    });
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

  const productSlug = (product as any).slug || product.id;
  const productUrl = `${SITE_URL}/product/${productSlug}`;
  const shareUrl = `${SHARE_BASE_URL}/${productSlug}`;
  const allImages = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url ? [product.image_url] : [DEFAULT_OG_IMAGE];
  const productImage = allImages[0];
  const categoryName = product.categories?.name || 'Custom Products';
  const categoryHref = product.categories ? `/category/${categorySlug(categoryName)}` : '/products';

  // Generate SEO-friendly meta data (keyword-rich, unique per product)
  const onSale = !!(product.sale_price && product.sale_end && new Date(product.sale_end) > new Date());
  const effectivePrice = onSale ? product.sale_price! : product.price;
  const productTitle = clampText(
    `${product.name} — Custom ${categoryName} Online | ${BUSINESS_NAME}`,
    60,
    `${product.name} | ${BUSINESS_NAME}`,
  );
  const productDescription = clampText(
    product.description
      ? `${product.description.replace(/\s+/g, ' ').trim()} Personalised and printed to order, with All India delivery.`
      : `Order a personalised ${product.name.toLowerCase()} from ${BUSINESS_NAME}. Upload your photo or details, we print it to order and deliver across India.`,
    155,
  );
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0];

  // Generate JSON-LD structured data for the product
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Custom ${product.name} from Graphic Wala - Buy Online`,
    "image": allImages,
    "url": productUrl,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": BUSINESS_NAME
    },
    "category": categoryName,
    "offers": {
      "@type": "Offer",
      "price": product.sale_price && product.sale_end && new Date(product.sale_end) > new Date() ? product.sale_price : product.price,
      "priceCurrency": "INR",
      "priceValidUntil": priceValidUntil,
      "itemCondition": "https://schema.org/NewCondition",
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
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 2,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "url": productUrl
    },
    ...(reviewStats.count > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": reviewStats.avg.toString(),
        "reviewCount": reviewStats.count.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviewStats.reviews.map(r => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.user_name },
        "datePublished": r.created_at.split('T')[0],
        "reviewRating": { "@type": "Rating", "ratingValue": r.rating.toString(), "bestRating": "5", "worstRating": "1" },
        "reviewBody": r.comment
      }))
    } : {})
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": `${SITE_URL}/products` },
      ...(product.categories ? [{ "@type": "ListItem", "position": 3, "name": categoryName, "item": `${SITE_URL}${categoryHref}` }] : []),
      { "@type": "ListItem", "position": product.categories ? 4 : 3, "name": product.name, "item": productUrl }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{productTitle}</title>
        <meta name="title" content={productTitle} />
        <meta name="description" content={productDescription} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
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
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
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

          <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images Gallery */}
            <ProductImageGallery 
              images={product.image_urls || (product.image_url ? [product.image_url] : [])} 
              productName={product.name} 
            />

            {/* Product Details */}
            <div className="w-full min-w-0 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                  <div className="flex shrink-0 items-center gap-2">
                    <WishlistButton
                      isWishlisted={isWishlisted(product.id)}
                      onClick={() => toggleWishlist(product.id)}
                      size="md"
                    />
                    <ShareButton productId={product.id} productName={product.name} />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 break-words">{product.name}</h1>
                <p className="text-muted-foreground mb-4 break-words">
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

              {/* Flash Sale Banner */}
              {product.sale_price && product.sale_end && new Date(product.sale_end) > new Date() && (
                (!product.sale_start || new Date(product.sale_start) <= new Date()) && (
                  <FlashSaleBadge
                    salePrice={product.sale_price}
                    originalPrice={product.price}
                    saleEnd={product.sale_end}
                    variant="detail"
                  />
                )
              )}

              {/* Delivery Countdown & Estimate */}
              <DeliveryCountdown 
                cutoffTime={product.cutoff_time || "17:00"}
                deliveryDays={product.delivery_days || 7}
              />

              {/* Price Breakdown */}
              <Card>
                <CardContent className="pt-6">
                  <PriceBreakdown
                    productTotal={(() => {
                      const now = new Date();
                      const saleActive = product.sale_price != null && product.sale_start && product.sale_end &&
                        new Date(product.sale_start) <= now && new Date(product.sale_end) >= now;
                      return (saleActive ? product.sale_price! : product.price) * quantity;
                    })()}
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

                <SecurePaymentBadge />

                <PincodeChecker
                  weight={(product.weight_kg || 0.5) * quantity}
                  length={(product as any).length_cm || undefined}
                  breadth={(product as any).breadth_cm || undefined}
                  height={((product as any).height_cm || 0) * quantity || undefined}
                />

                {uploadConfig.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    💡 You can upload photos now or add to cart and upload before checkout
                  </p>
                )}
              </div>

              {/* Delivery Info */}
              <DeliveryInfoBanner variant="compact" />

              {/* Why Buy From Graphic Wala */}
              <WhyBuyFromProduct />

              {/* Return Policy */}
              <ReturnPolicy variant="compact" />

              {/* Help Section */}
              <SupportContact 
                variant="compact" 
                message={`Hi, I'm interested in ${product.name} (₹${product.price}). Can you help me?`}
              />
            </div>
          </div>

          {/* FAQ Section */}
          <LazySection minHeight={320}>
            <ProductFAQ
              productName={product.name}
              deliveryDays={product.delivery_days}
              deliveryCharge={deliveryCharge}
              customizable={uploadConfig.length > 0}
            />
          </LazySection>

          {/* Reviews Section */}
          <Separator className="my-12" />
          <LazySection minHeight={400}>
            <ProductReviews productId={product.id} productName={product.name} />
          </LazySection>
        </div>

        {/* Similar Products */}
        <LazySection minHeight={360}>
          <SimilarProducts currentProductId={product.id} categoryId={product.category_id} />
        </LazySection>

        {/* Recently Viewed Products */}
        {viewedIds.length > 1 && (
          <LazySection minHeight={320}>
            <RecentlyViewedProducts viewedIds={viewedIds} excludeId={product.id} />
          </LazySection>
        )}

        {/* Unique SEO text block for search engines */}
        <section className="sr-only" aria-label={`About ${product.name}`}>
          <h2>Buy {product.name} Online in India</h2>
          <p>
            {product.name} is available online at Graphic Wala for ₹{effectivePrice}. This {categoryName.toLowerCase()} is
            custom printed on premium material and delivered across all of India. Order {product.name} online with
            prepaid payment, fast dispatch and secure packaging. Looking for {categoryName.toLowerCase()} online in India?
            Graphic Wala offers personalized photo frames, PVC cards, ID cards, visiting cards, keychains and custom gifts.
          </p>
          <h3>{product.name} Price and Delivery</h3>
          <p>
            {product.name} price starts at ₹{effectivePrice}. Delivery across India usually takes {product.delivery_days || 5}–7 days.
            You can customize {product.name} with your own photo or text before placing the order.
          </p>
        </section>
      </main>
      <Footer />
      
      {/* Sticky Add to Cart - Mobile */}
      <StickyAddToCart product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />


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


import { useEffect, useState, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Image,
  Zap,
} from 'lucide-react';

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

const ProductReviews = lazy(() => import('@/components/reviews/ProductReviews'));
const ProductFAQ = lazy(() => import('@/components/products/ProductFAQ'));
const SimilarProducts = lazy(() => import('@/components/products/SimilarProducts'));
const RecentlyViewedProducts = lazy(() => import('@/components/products/RecentlyViewedProducts'));

const SITE_URL = 'https://www.graphicwala.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-square.png`;
const SHARE_BASE_URL = `${SITE_URL}/share/product`;

type ProductDetailData = Product & {
  delivery_charge?: number | null;
  image_urls?: string[];
  weight_kg?: number;
  cutoff_time?: string | null;
  delivery_days?: number | null;
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  length_cm?: number | null;
  breadth_cm?: number | null;
  height_cm?: number | null;
};

const clampText = (text: string, max: number, short?: string) => {
  const clean = text.replace(/\s+/g, ' ').trim();

  if (clean.length <= max) return clean;

  if (short) {
    const shortClean = short.replace(/\s+/g, ' ').trim();

    if (shortClean.length <= max) return shortClean;

    return shortClean.slice(0, max).replace(/[\s,–—|-]+\S*$/, '');
  }

  return clean.slice(0, max).replace(/[\s,–—|-]+\S*$/, '');
};

const formatDescription = (description?: string | null): string[] => {
  if (!description) return ['No description available.'];

  return description
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(
      /[ \t]*(?=[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}\u{3030}\u{303D}\u{3297}\u{3299}](?!\u{FE0F}?\u{200D}))/gu,
      '\n'
    )
    .replace(/[ \t]*[•▪◦‣][ \t]*/g, '\n')
    .replace(/[ \t]+\|[ \t]+/g, '\n')
    .replace(
      /(?<=[.!?।])\s+(?=[A-Z₹0-9\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}])/gu,
      '\n'
    )
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const ProductDetail = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const { viewedIds, addProduct: addToRecentlyViewed } = useRecentlyViewed();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const deliveryCharge = product?.delivery_charge ?? 0;

  // Fetch product by slug or legacy UUID.
  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      setLoading(true);
      setFetchError(false);
      setProduct(null);

      try {
        if (!slugOrId) {
          setLoading(false);
          return;
        }

        const query = supabase
          .from('products')
          .select('*, categories(*)').eq('is_active', true);

        const { data, error } = isUuid(slugOrId)
          ? await query.eq('id', slugOrId).maybeSingle()
          : await query.eq('slug', slugOrId).maybeSingle();

        if (error) throw error;
        if (!active) return;

        if (!data) {
          setProduct(null);
          return;
        }

        // Redirect legacy UUID URLs to the canonical slug URL.
        if (isUuid(slugOrId) && data.slug && data.slug !== slugOrId) {
          navigate(`/product/${data.slug}`, { replace: true });
          return;
        }

        const uploadConfig = Array.isArray(data.upload_config)
          ? (data.upload_config as unknown as UploadField[])
          : [];

        const imageUrls = Array.isArray(data.image_urls)
          ? (data.image_urls as string[])
          : data.image_url
            ? [data.image_url]
            : [];

        setProduct({
          ...data,
          upload_config: uploadConfig,
          delivery_charge: data.delivery_charge,
          image_urls: imageUrls,
          weight_kg: data.weight_kg ?? 0.5,
        } as ProductDetailData);

      } catch (error) {
        console.error('Product loading error:', error);

        if (active) {
          setFetchError(true);
          setProduct(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [slugOrId, navigate]);

  // Track recently viewed products.
  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id, addToRecentlyViewed]);

  // Product view analytics.
  useEffect(() => {
    if (!product?.id) return;

    trackEvent('view_product', {
      item_id: product.id,
      item_name: product.name,
      value: product.price,
    });

    try {
      let sessionId = sessionStorage.getItem('bi_session_id');

      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('bi_session_id', sessionId);
      }

      supabase.from('product_views').insert({
        product_id: product.id,
        user_id: user?.id || null,
        session_id: sessionId,
      }).then(({ error }) => {
        if (error) {
          console.warn('BI view tracking failed:', error.message);
        }
      });
    } catch {
      // Analytics failures must not break the product page.
    }
  }, [product?.id, product?.name, product?.price, user?.id]);

  // Load existing designs from session storage.
  useEffect(() => {
    if (!product) return;

    try {
      const savedDesigns = sessionStorage.getItem('productDesigns');

      if (savedDesigns) {
        const designs = JSON.parse(savedDesigns);

        if (designs[product.id]) {
          setDesignUrls(designs[product.id]);
        }
      }
    } catch (error) {
      console.warn('Unable to restore saved product designs:', error);
    }
  }, [product]);

  const getUploadConfig = (): UploadField[] => {
    if (product?.upload_config && product.upload_config.length > 0) {
      return product.upload_config;
    }

    if (!product?.customization_enabled) return [];

    const legacyConfig: UploadField[] = [];

    if (product.front_upload_required) {
      legacyConfig.push({
        id: 'front',
        label: 'Front Design',
        required: true,
      });
    }

    if (product.back_upload_enabled) {
      legacyConfig.push({
        id: 'back',
        label: 'Back Design',
        required: false,
      });
    }

    return legacyConfig;
  };

  const uploadConfig = getUploadConfig();
  const requiredFields = uploadConfig.filter((field) => field.required);
  const allRequiredUploaded = requiredFields.every((field) => designUrls[field.id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (requiredFields.length > 0 && !allRequiredUploaded) {
      toast.error('Please upload all required photos before adding to cart');
      return;
    }

    try {
      if (Object.keys(designUrls).length > 0) {
        const designs = JSON.parse(
          sessionStorage.getItem('productDesigns') || '{}'
        );

        designs[product.id] = designUrls;
        sessionStorage.setItem('productDesigns', JSON.stringify(designs));
      }
    } catch (error) {
      console.error('Unable to save product designs:', error);
      toast.error('Unable to save your uploaded designs. Please try again.');
      return;
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
      setShowLoginDialog(true);
      return;
    }

    if (requiredFields.length > 0 && !allRequiredUploaded) {
      toast.error('Please upload all required photos before proceeding');
      return;
    }

    try {
      if (Object.keys(designUrls).length > 0) {
        const designs = JSON.parse(
          sessionStorage.getItem('productDesigns') || '{}'
        );

        designs[product.id] = designUrls;
        sessionStorage.setItem('productDesigns', JSON.stringify(designs));
      }
    } catch (error) {
      console.error('Unable to save product designs:', error);
      toast.error('Unable to save your uploaded designs. Please try again.');
      return;
    }

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

  // Missing product or fetch failure: prevent indexing.
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>
            {fetchError
              ? `Unable to Load Product | ${BUSINESS_NAME}`
              : `Product Not Found | ${BUSINESS_NAME}`}
          </title>

          <meta
            name="description"
            content="This product could not be found. Explore other products at Graphic Wala."
          />

          <meta name="robots" content="noindex, follow" />
        </Helmet>

        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold">
            {fetchError ? 'Unable to Load Product' : 'Product Not Found'}
          </h1>

          <p className="mt-3 text-muted-foreground">
            {fetchError
              ? 'Please check your connection and try again.'
              : 'This product may have been removed or the URL may be incorrect.'}
          </p>

          <Link
            to="/products"
            className="mt-6 rounded-lg bg-primary px-6 py-3 text-white font-semibold"
          >
            Browse All Products
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const productSlug = product.slug || product.id;
  const productUrl = `${SITE_URL}/product/${encodeURIComponent(productSlug)}`;
  const shareUrl = `${SHARE_BASE_URL}/${encodeURIComponent(productSlug)}`;

  const allImages =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : [DEFAULT_OG_IMAGE];

  const productImage = allImages[0];
  const categoryName = product.categories?.name || 'Custom Products';

  const categoryHref = product.categories
    ? `/category/${categorySlug(categoryName)}`
    : '/products';

  // Use one consistent sale-price condition everywhere.
  const now = Date.now();

  const saleActive =
    product.sale_price != null &&
    Number(product.sale_price) > 0 &&
    (!product.sale_start || new Date(product.sale_start).getTime() <= now) &&
    (!product.sale_end || new Date(product.sale_end).getTime() >= now);

  const effectivePrice = saleActive
    ? Number(product.sale_price)
    : Number(product.price);

  const productTitle =
    `${product.name} — Custom ${categoryName} Online | ${BUSINESS_NAME}`.length <= 65
      ? `${product.name} — Custom ${categoryName} Online | ${BUSINESS_NAME}`
      : `${product.name} | ${BUSINESS_NAME}`;

  const productDescription = clampText(
    product.description
      ? `${product.description.replace(/\s+/g, ' ').trim()} Personalised and printed to order, with All India delivery.`
      : `Order a personalised ${product.name.toLowerCase()} from ${BUSINESS_NAME}. Upload your photo or details, we print it to order and deliver across India.`,
    155
  );

  // Product structured data.
  // Shipping and return policy are intentionally omitted until verified.
  // AggregateRating is also omitted because only a limited review sample is fetched.
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ||
      `Custom ${product.name} from Graphic Wala - Buy Online`,
    image: allImages,
    url: productUrl,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: BUSINESS_NAME,
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'INR',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock_quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_NAME,
      },
      url: productUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${SITE_URL}/products`,
      },
      ...(product.categories
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: categoryName,
              item: `${SITE_URL}${categoryHref}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: product.categories ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{productTitle}</title>

        <meta name="title" content={productTitle} />
        <meta name="description" content={productDescription} />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />

        <link rel="canonical" href={productUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={productTitle} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:secure_url" content={productImage} />
        <meta property="og:image:alt" content={`${product.name} - ${BUSINESS_NAME}`} />
        <meta property="og:site_name" content={BUSINESS_NAME} />
        <meta property="og:locale" content="en_IN" />

        {/* Product Open Graph */}
        <meta property="product:price:amount" content={String(effectivePrice)} />
        <meta property="product:price:currency" content="INR" />
        <meta
          property="product:availability"
          content={product.stock_quantity > 0 ? 'in stock' : 'out of stock'}
        />
        <meta property="product:category" content={categoryName} />
        <meta property="product:brand" content={BUSINESS_NAME} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={productUrl} />
        <meta name="twitter:title" content={productTitle} />
        <meta name="twitter:description" content={productDescription} />
        <meta name="twitter:image" content={productImage} />
        <meta name="twitter:image:alt" content={`${product.name} - ${BUSINESS_NAME}`} />

        {/* Structured data */}
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
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary">
              Home
            </Link>

            <span className="mx-2">/</span>

            <Link to="/products" className="hover:text-primary">
              Products
            </Link>

            {product.categories && (
              <>
                <span className="mx-2">/</span>
                <Link to={categoryHref} className="hover:text-primary">
                  {categoryName}
                </Link>
              </>
            )}

            <span className="mx-2">/</span>

            <span className="text-foreground font-medium break-words">
              {product.name}
            </span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <ProductImageGallery
              images={
                product.image_urls ||
                (product.image_url ? [product.image_url] : [])
              }
              productName={product.name}
            />

            {/* Product Details */}
            <div className="w-full min-w-0 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {product.categories && (
                      <Link
                        to={categoryHref}
                        aria-label={`Browse all ${categoryName}`}
                      >
                        <Badge
                          variant="secondary"
                          className="hover:bg-secondary/80"
                        >
                          {product.categories.name}
                        </Badge>
                      </Link>
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

                    <ShareButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-4 break-words">
                  {product.name}
                </h1>

                <div className="text-muted-foreground mb-4 break-words space-y-1.5">
                  {formatDescription(product.description).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">
                      {product.stock_quantity} in stock
                    </span>
                  ) : (
                    <span className="text-destructive">
                      Out of stock
                    </span>
                  )}
                </p>
              </div>

              {/* Flash Sale */}
              {saleActive && product.sale_end && (
                <FlashSaleBadge
                  salePrice={Number(product.sale_price)}
                  originalPrice={product.price}
                  saleEnd={product.sale_end}
                  variant="detail"
                />
              )}

              {/* Delivery Countdown */}
              <DeliveryCountdown
                cutoffTime={product.cutoff_time || '17:00'}
                deliveryDays={product.delivery_days || 7}
              />

              {/* Price */}
              <Card>
                <CardContent className="pt-6">
                  <PriceBreakdown
                    productTotal={effectivePrice * quantity}
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

              {/* Customization */}
              {uploadConfig.length > 0 && (
                <DesignUpload
                  productId={product.id}
                  productName={product.name}
                  uploadConfig={uploadConfig}
                  onUploadComplete={(urls) => setDesignUrls(urls)}
                  existingDesigns={designUrls}
                />
              )}

              {/* Quantity and Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>

                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="w-12 text-center font-semibold">
                      {quantity}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity((current) => current + 1)
                      }
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
                  length={product.length_cm || undefined}
                  breadth={product.breadth_cm || undefined}
                  height={
                    ((product.height_cm || 0) * quantity) || undefined
                  }
                />

                {uploadConfig.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    💡 You can upload photos now or add to cart and upload before checkout
                  </p>
                )}
              </div>

              {/* Delivery Information */}
              <DeliveryInfoBanner variant="compact" />

              <WhyBuyFromProduct />

              <ReturnPolicy variant="compact" />

              <SupportContact
                variant="compact"
                message={`Hi, I'm interested in ${product.name} (₹${product.price}). Can you help me?`}
              />
            </div>
          </div>

          {/* Product FAQ */}
          <LazySection minHeight={320}>
            <ProductFAQ
              productName={product.name}
              deliveryDays={product.delivery_days}
              deliveryCharge={deliveryCharge}
              customizable={uploadConfig.length > 0}
            />
          </LazySection>

          {/* Reviews */}
          <Separator className="my-12" />

          <LazySection minHeight={400}>
            <ProductReviews
              productId={product.id}
              productName={product.name}
            />
          </LazySection>
        </div>

        {/* Similar Products */}
        <LazySection minHeight={360}>
          <SimilarProducts
            currentProductId={product.id}
            categoryId={product.category_id}
          />
        </LazySection>

        {/* Recently Viewed */}
        {viewedIds.length > 1 && (
          <LazySection minHeight={320}>
            <RecentlyViewedProducts
              viewedIds={viewedIds}
              excludeId={product.id}
            />
          </LazySection>
        )}

        {/* Product Summary */}
        <section
          className="container pb-12"
          aria-labelledby="product-summary-heading"
        >
          <div className="max-w-3xl border-t border-border pt-8">
            <h2
              id="product-summary-heading"
              className="text-xl md:text-2xl font-bold mb-3"
            >
              About this {categoryName.toLowerCase()}
            </h2>

            <p className="text-muted-foreground leading-relaxed break-words">
              {product.description
                ? product.description
                : `This ${product.name.toLowerCase()} is made to order at our Katihar workshop.`}{' '}

              {uploadConfig.length > 0
                ? 'Upload your photo or details on this page and we print exactly what you approve.'
                : 'Each piece is printed and quality-checked before dispatch.'}{' '}

              Orders are prepaid and shipped with tracked courier delivery across India, usually arriving in{' '}
              {product.delivery_days || 5}–7 days depending on your pincode.
            </p>

            <p className="mt-4 text-sm">
              <Link
                to={categoryHref}
                className="font-semibold text-primary hover:underline"
              >
                See more {categoryName.toLowerCase()}
              </Link>

              <span className="mx-2 text-muted-foreground">·</span>

              <Link
                to="/products"
                className="font-semibold text-primary hover:underline"
              >
                Browse all products
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Mobile Sticky Cart */}
      <StickyAddToCart
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Login Dialog */}
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

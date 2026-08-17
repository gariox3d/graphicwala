import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/HeroSection';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import RecentlyViewedProducts from '@/components/products/RecentlyViewedProducts';
import FlashSaleBanner from '@/components/products/FlashSaleBanner';
import AdBanner from '@/components/ads/AdBanner';
import StatsCounter from '@/components/StatsCounter';
import LazySection from '@/components/LazySection';
import TrustStrip from '@/components/home/TrustStrip';
import Bestsellers from '@/components/home/Bestsellers';
import CategoryGrid from '@/components/home/CategoryGrid';
import HowItWorks from '@/components/home/HowItWorks';
import WhyBuyFromUs from '@/components/home/WhyBuyFromUs';
import TrustPanel from '@/components/home/TrustPanel';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { PRODUCT_CARD_FIELDS } from '@/lib/productFields';

const SocialProofNotifications = lazy(() => import('@/components/SocialProofNotifications'));
const CustomerGallery = lazy(() => import('@/components/CustomerGallery'));
const BeforeAfterShowcase = lazy(() => import('@/components/BeforeAfterShowcase'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const TrendingProducts = lazy(() => import('@/components/products/TrendingProducts'));

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();
  const { viewedIds } = useRecentlyViewed();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, catImgRes] = await Promise.allSettled([
          supabase
            .from('products')
            .select(PRODUCT_CARD_FIELDS)
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .limit(8),
          supabase.from('categories').select('id, name, description, image_url').eq('is_active', true),
          supabase
            .from('products')
            .select('category_id, image_url')
            .eq('is_active', true)
            .not('image_url', 'is', null)
            .order('display_order', { ascending: true })
            .limit(60),
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value.data) {
          setProducts(productsRes.value.data as unknown as Product[]);
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
          setCategories(categoriesRes.value.data as Category[]);
        }
        if (catImgRes.status === 'fulfilled' && catImgRes.value.data) {
          const map: Record<string, string> = {};
          for (const row of catImgRes.value.data as Array<{ category_id: string; image_url: string }>) {
            if (row.category_id && row.image_url && !map[row.category_id]) {
              map[row.category_id] = row.image_url;
            }
          }
          setCategoryImages(map);
        }

        if (productsRes.status === 'rejected') {
          console.error('Failed to load products:', productsRes.reason);
        }
        if (categoriesRes.status === 'rejected') {
          console.error('Failed to load categories:', categoriesRes.reason);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get a product image for each category as fallback
  const getCategoryImage = (categoryName: string, categoryImage: string | null) => {
    if (categoryImage) return categoryImage;
    const cat = categories.find(c => c.name === categoryName);
    if (cat && categoryImages[cat.id]) return categoryImages[cat.id];
    const categoryProduct = products.find(p => {
      const c = categories.find(cc => cc.id === p.category_id);
      return c?.name === categoryName;
    });
    return categoryProduct?.image_url || null;
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${BUSINESS_NAME}, I need help.`)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Graphic Wala (Graphicwala) | Custom Photo Frames &amp; Gifts</title>
        <meta name="description" content="Graphic Wala (Graphicwala) — official store for custom photo frames, PVC & ID cards, keychains and personalized gifts. Prepaid, All India delivery." />
        <link rel="canonical" href="https://www.graphicwala.com/" />
        <meta property="og:title" content="Graphic Wala (Graphicwala) | Custom Photo Frames & Gifts" />
        <meta property="og:description" content="Buy custom photo frames, PVC cards, keychains & personalized gifts online. Premium quality with All India home delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.graphicwala.com/" />
        <meta property="og:image" content="https://www.graphicwala.com/og-square.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Graphic Wala (Graphicwala) | Custom Photo Frames & Gifts" />
        <meta name="twitter:description" content="Buy custom photo frames, PVC cards, keychains online. All India delivery." />
        <meta name="twitter:image" content="https://www.graphicwala.com/og-square.png" />
      </Helmet>
      {/* Announcement Banner - Top of page */}
      <AnnouncementBanner />
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Trust strip — conversion proof above the fold */}
        <TrustStrip />

        {/* Flash Sale Banner — shown only when active sales exist */}
        <FlashSaleBanner />

        {/* Bestsellers */}
        <Bestsellers products={products} loading={loading} />

        {/* Ad Slot */}
        <section className="py-4 bg-background">
          <div className="container">
            <AdBanner slotId="homepage_after_products" />
          </div>
        </section>

        {/* Categories */}
        <CategoryGrid categories={categories} getImage={getCategoryImage} />

        {/* 3-step custom order flow */}
        <HowItWorks />

        {/* Why buy from us */}
        <WhyBuyFromUs />

        {/* Stats Counter */}
        <StatsCounter />

        {/* Trending — lazy, loads on scroll */}
        <LazySection minHeight={400}>
          <TrendingProducts />
        </LazySection>

        {/* Testimonials — lazy, loads on scroll */}
        <LazySection minHeight={400}>
          <TestimonialsSection />
        </LazySection>

        {/* Before/After Showcase — lazy, loads on scroll */}
        <LazySection minHeight={400}>
          <BeforeAfterShowcase />
        </LazySection>

        {/* Customer Gallery / Wall of Fame — lazy, loads on scroll */}
        <LazySection minHeight={400}>
          <CustomerGallery />
        </LazySection>

        {/* Delivery, payment & policy trust panel */}
        <TrustPanel />

        {/* Recently Viewed Products */}
        {viewedIds.length > 0 && <RecentlyViewedProducts viewedIds={viewedIds} />}


        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground" aria-labelledby="cta-heading">
          <div className="container text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">Ready to Get Started?</h2>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 font-medium">
              Order personalized photo frames, PVC cards, keychains and more. Prepaid orders with home delivery across India.
            </p>
            <nav className="flex flex-wrap justify-center gap-4" aria-label="Get started actions">
              <Link to="/products" aria-label="Browse all products">
                <Button variant="cta-secondary" size="xl">
                  Browse Products
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-2 border-primary-foreground/80 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold backdrop-blur-sm"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Chat on WhatsApp
                </Button>
              </a>
            </nav>
          </div>
        </section>

      </main>

      <Footer />
      <Suspense fallback={null}>
        <SocialProofNotifications />
      </Suspense>
    </div>
  );
};

export default Index;

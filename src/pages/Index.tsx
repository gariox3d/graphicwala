import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/HeroSection';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import RecentlyViewedProducts from '@/components/products/RecentlyViewedProducts';
import CustomerGallery from '@/components/CustomerGallery';
import BeforeAfterShowcase from '@/components/BeforeAfterShowcase';
import FlashSaleBanner from '@/components/products/FlashSaleBanner';
import AdBanner from '@/components/ads/AdBanner';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsCounter from '@/components/StatsCounter';
import TrustStrip from '@/components/home/TrustStrip';
import Bestsellers from '@/components/home/Bestsellers';
import CategoryGrid from '@/components/home/CategoryGrid';
import HowItWorks from '@/components/home/HowItWorks';
import WhyBuyFromUs from '@/components/home/WhyBuyFromUs';
import TrustPanel from '@/components/home/TrustPanel';
import SocialProofNotifications from '@/components/SocialProofNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

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
          supabase.from('products').select('*').order('display_order', { ascending: true }).limit(8),
          supabase.from('categories').select('*'),
          supabase
            .from('products')
            .select('category_id, image_url')
            .eq('is_active', true)
            .not('image_url', 'is', null)
            .order('display_order', { ascending: true }),
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
        <title>Graphic Wala | Custom Photo Frames, PVC Cards, Keychains Online India</title>
        <meta name="description" content="Buy custom photo frames, PVC cards, ID cards, visiting cards, keychains & personalized gifts online from Graphic Wala. Premium quality printing with All India home delivery." />
        <link rel="canonical" href="https://graphicwala.com/" />
        <meta property="og:title" content="Graphic Wala | Custom Photo Frames & Personalized Gifts Online India" />
        <meta property="og:description" content="Buy custom photo frames, PVC cards, keychains & personalized gifts online. Premium quality with All India home delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://graphicwala.com/" />
        <meta property="og:image" content="https://graphicwala.com/og-square.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Graphic Wala | Custom Photo Frames Online India" />
        <meta name="twitter:description" content="Buy custom photo frames, PVC cards, keychains online. All India delivery." />
        <meta name="twitter:image" content="https://graphicwala.com/og-square.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': 'https://graphicwala.com/#localbusiness',
            name: 'Graphic Wala',
            image: 'https://graphicwala.com/og-square.png',
            url: 'https://graphicwala.com/',
            telephone: '+91-6207142994',
            email: 'graphicwalaktr@gmail.com',
            priceRange: '₹₹',
            description:
              'Graphic Wala is a custom printing store in Katihar, Bihar offering photo frames, PVC cards, ID cards, visiting cards, keychains and personalized gifts with All India delivery.',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Katihar',
              addressRegion: 'Bihar',
              addressCountry: 'IN',
            },
            areaServed: { '@type': 'Country', name: 'India' },
            openingHours: 'Mo-Su 09:00-21:00',
            paymentAccepted: 'UPI, Credit Card, Debit Card, Netbanking',
            currenciesAccepted: 'INR',
            sameAs: ['https://wa.me/916207142994'],
          })}
        </script>
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

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Before/After Showcase */}
        <BeforeAfterShowcase />

        {/* Customer Gallery / Wall of Fame */}
        <CustomerGallery />

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

        {/* SEO Footer Content */}
        <section className="sr-only" aria-label="About Graphic Wala Store">
          <h2>Graphic Wala (Graphicwala) - Custom Photo Frames, PVC Cards & Personalized Gifts Online India</h2>
          <p>
            Graphic Wala (also known as Graphicwala or GraphicWala) is India's most trusted online store at graphicwala.com 
            for custom printing and personalized gifts. We specialize in custom photo frame printing, acrylic photo frames, 
            wooden photo frames, couple photo frames, family photo frames, birthday gift photo frames, anniversary photo frames, 
            PVC card printing, ID card printing, visiting card printing, name keychain printing, photo keychain printing 
            with premium quality materials. All orders are prepaid with home delivery available across India. 
            Buy photo frames online at best prices from Graphic Wala. Contact us on WhatsApp at +91 6207142994 for support.
            Graphic Wala is NOT GraphicsWale or graphicswale — we are the original Graphic Wala since 2020 at graphicwala.com.
          </p>
          <h3>Why Choose Graphic Wala (graphicwala.com)?</h3>
          <p>
            Graphic Wala offers premium quality custom printed products at affordable prices. 
            We are based in Katihar, Bihar and deliver across all of India. 
            Visit graphicwala.com to order custom photo frames, PVC cards, keychains and personalized gifts online.
          </p>
          <h3>Popular Products at Graphic Wala</h3>
          <ul>
            <li>Custom Photo Frames by Graphic Wala - Personalized with your photos</li>
            <li>Acrylic Photo Frames - Premium quality acrylic prints from Graphicwala</li>
            <li>Wooden Photo Frames - Classic wooden frames with photo print</li>
            <li>PVC Cards by Graphic Wala - Custom printed ID cards, membership cards</li>
            <li>Visiting Cards - Professional business cards from graphicwala.com</li>
            <li>Keychains - Name keychains, photo keychains, custom keychains</li>
            <li>Couple Photo Frames - Perfect gift for couples by Graphic Wala</li>
            <li>Birthday Gift Photo Frames - Personalized birthday gifts</li>
          </ul>
        </section>
      </main>

      <Footer />
      <SocialProofNotifications />
    </div>
  );
};

export default Index;

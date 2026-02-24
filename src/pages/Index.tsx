import { Link } from 'react-router-dom';
import { ArrowRight, Printer, CreditCard, Palette, Truck, Shield, Clock, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';
import SupportContact from '@/components/SupportContact';
import HeroSection from '@/components/HeroSection';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import RecentlyViewedProducts from '@/components/products/RecentlyViewedProducts';
import TrendingProducts from '@/components/products/TrendingProducts';
import CustomerGallery from '@/components/CustomerGallery';
import ProductMarquee from '@/components/products/ProductMarquee';
import FlashSaleBanner from '@/components/products/FlashSaleBanner';
import AdBanner from '@/components/ads/AdBanner';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsCounter from '@/components/StatsCounter';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();
  const { viewedIds } = useRecentlyViewed();

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('display_order', { ascending: true }).limit(8),
        supabase.from('categories').select('*'),
      ]);

      if (productsRes.data) setProducts(productsRes.data as unknown as Product[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Get a product image for each category as fallback
  const getCategoryImage = (categoryName: string, categoryImage: string | null) => {
    if (categoryImage) return categoryImage;
    // Find a product from this category to use its image
    const categoryProduct = products.find(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return cat?.name === categoryName;
    });
    return categoryProduct?.image_url || null;
  };

  const services = [
    {
      icon: Printer,
      title: 'Premium Printing',
      description: 'High-quality prints with vibrant colors and sharp details',
    },
    {
      icon: CreditCard,
      title: 'Custom Cards',
      description: 'Professional ID cards, visiting cards, and PVC cards',
    },
    {
      icon: Palette,
      title: 'Creative Designs',
      description: 'Unique designs tailored to your brand identity',
    },
    {
      icon: Truck,
      title: 'Home Delivery',
      description: 'Custom-made products delivered to your doorstep',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: '100% satisfaction guaranteed on all products',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Call or WhatsApp us anytime for assistance',
    },
  ];

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${BUSINESS_NAME}, I need help.`)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Banner - Top of page */}
      <AnnouncementBanner />
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Product Marquee / Auto-scroll strip */}
        <ProductMarquee />

        {/* Flash Sale Banner — shown only when active sales exist */}
        <FlashSaleBanner />

        {/* Ad Slot: After Hero */}
        <section className="py-4 bg-background">
          <div className="container"><AdBanner slotId="homepage_after_hero" /></div>
        </section>

        {/* Trust Notice Banner */}
        <section className="py-4 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-900">
          <div className="container">
            <p className="text-center text-sm font-medium text-amber-800 dark:text-amber-200">
              ⚠️ All products are custom-made and prepaid only. No Cash on Delivery available.
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24" aria-labelledby="categories-heading">
          <div className="container">
            <header className="flex items-center justify-between mb-12">
              <div>
                <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">Custom Photo Frames, PVC Cards, ID Cards, Keychains & Visiting Cards — All India Delivery</p>
              </div>
              <Link to="/products" className="hidden md:block" aria-label="View all product categories">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" role="list">
              {categories.map((category, index) => {
                const categoryImage = getCategoryImage(category.name, category.image_url);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    aria-label={`Shop ${category.name} - All India Delivery`}
                    role="listitem"
                  >
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={`${category.name} - Custom Printing India`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-foreground" />
                    )}
                    <div className="absolute inset-0 bg-foreground/60 group-hover:bg-foreground/50 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <h3 className="text-background font-bold text-center text-sm md:text-base group-hover:scale-105 transition-transform duration-300 drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Ad Slot: After Categories */}
        <section className="py-4 bg-background">
          <div className="container"><AdBanner slotId="homepage_after_categories" /></div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-secondary" aria-labelledby="products-heading">
          <div className="container">
            <header className="flex items-center justify-between mb-12">
              <div>
                <h2 id="products-heading" className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Personalized gifts and custom printed products with All India delivery</p>
              </div>
              <Link to="/products" className="hidden md:block" aria-label="View all products">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </header>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center mt-8 md:hidden">
              <Link to="/products" aria-label="View all products">
                <Button variant="outline" size="lg">
                  View All Products
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ad Slot: After Products */}
        <section className="py-4 bg-background">
          <div className="container"><AdBanner slotId="homepage_after_products" /></div>
        </section>

        {/* Delivery Info Banner */}
        <section className="py-8 bg-background" aria-label="Delivery information">
          <div className="container">
            <DeliveryInfoBanner />
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24 bg-secondary" aria-labelledby="services-heading">
          <div className="container">
            <header className="text-center mb-12">
              <h2 id="services-heading" className="text-3xl md:text-4xl font-bold mb-4">Why Choose Graphic Wala?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium custom printing services across India. We deliver excellence in every print with home delivery nationwide.
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {services.map((service, index) => (
                <article
                  key={service.title}
                  className="bg-card rounded-xl p-6 shadow-soft hover:shadow-brand transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  role="listitem"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Slot: Mid Page */}
        <section className="py-4 bg-background">
          <div className="container"><AdBanner slotId="homepage_mid_page" /></div>
        </section>

        {/* Stats Counter */}
        <StatsCounter />

        {/* Trending Products */}
        <TrendingProducts />

        {/* Customer Gallery / Wall of Fame */}
        <CustomerGallery />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Recently Viewed Products */}
        {viewedIds.length > 0 && <RecentlyViewedProducts viewedIds={viewedIds} />}

        {/* Support Section */}
        <section className="py-12 bg-background" aria-label="Customer support">
          <div className="container">
            <SupportContact />
          </div>
        </section>

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
          <h2>Graphic Wala Store - Custom Printing Services Across India</h2>
          <p>
            Graphic Wala Store is India's trusted online store for custom printing and personalized gifts. 
            We specialize in photo frame printing, PVC card printing, ID card printing, visiting card printing, 
            and keychain printing with premium quality materials. All orders are prepaid with home delivery 
            available across India. Contact us on WhatsApp at +91 6207142994 for support.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

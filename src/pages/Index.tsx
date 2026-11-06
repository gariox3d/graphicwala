import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  MessageCircle,
  Phone,
  Sparkles,
  Printer,
  Gift,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
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
import CategoryShowcase from '@/components/home/CategoryShowcase';

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

const CMYK_SERVICE_PILLARS = [
  {
    id: 'sublimation-gifts',
    badge: 'Sublimation & Personalized Gifts',
    title: 'Photo Frames, Mugs, T-Shirts & Keychains',
    description:
      'High-definition custom Photo Frames, Magic & White Mugs, Printed T-Shirts, Keychains, Cushions, Mouse Pads & PVC ID Cards.',
    items: ['Custom Photo Frames', 'Sublimation Mugs', 'Printed T-Shirts', 'Keychains & PVC Cards'],
    accentColor: '#00AEEF',
    badgeBg: 'bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]/30',
    borderTop: 'border-t-4 border-t-[#00AEEF]',
    icon: Gift,
  },
  {
    id: 'commercial-printing',
    badge: 'Commercial & Office Printing',
    title: 'Billbooks, Letterpads, Handbills & Posters',
    description:
      'Complete business printing solutions including GST Billbooks, Cash Memos, Doctor/Company Letterpads, Promotional Handbills & Posters.',
    items: ['Billbook & Invoice Pads', 'Official Letterpads', 'Handbills & Pamphlets', 'Posters & Visiting Cards'],
    accentColor: '#E6007E',
    badgeBg: 'bg-[#E6007E]/10 text-[#E6007E] border-[#E6007E]/30',
    borderTop: 'border-t-4 border-t-[#E6007E]',
    icon: Printer,
  },
  {
    id: 'wedding-invites',
    badge: 'Wedding & Event Invitations',
    title: 'Wedding Cards & Digital Web Invites',
    description:
      'Designer Shadi Cards, traditional & modern Wedding Invitations, and interactive Digital Invites with live proof on WhatsApp before printing.',
    items: ['Hindu & Muslim Wedding Cards', 'Reception & Event Cards', 'Digital Web Invitations', 'WhatsApp Matter Proofing'],
    accentColor: '#EAB308',
    badgeBg: 'bg-[#FFED00]/30 text-[#0F172A] border-[#EAB308]/40',
    borderTop: 'border-t-4 border-t-[#FFED00]',
    icon: HeartHandshake,
  },
];

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

  const cleanPhone = WHATSAPP_NUMBER.replace(/[^0-9]/g, '') || '916207142994';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME || 'GraphicWala'}, I want to order / enquire about custom printing & gifts.`
  )}`;
  const callUrl = `tel:+${cleanPhone}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'PrintShop', '@id': 'https://www.graphicwala.com/#business',
    name: 'GraphicWala',
    alternateName: ['Graphic Wala', 'GraphicWala.com', 'Graphic Wala Printing & Gifts'],
    url: 'https://www.graphicwala.com/',
    logo: 'https://www.graphicwala.com/og-square.png',
    image: 'https://www.graphicwala.com/og-square.png',
    description:
      'Official GraphicWala (Graphic Wala) Studio — Printing, Design, Branding, Custom Sublimation Photo Frames, Mugs, T-Shirts, Keychains, PVC Cards, Billbooks, Letterpads, Handbills, Posters & Wedding Cards.',
    telephone: `+${cleanPhone}`,
    priceRange: '₹₹',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'GraphicWala Printing & Sublimation Catalog',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Photo Frames & Sublimation Mugs' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Printed T-Shirts & Keychains' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Billbook, Letterpad, Handbill & Poster Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wedding Cards & Digital Web Invitations' } },
      ],
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      <Helmet>
        <title>GraphicWala (Graphic Wala) | Printing • Design • Branding, Custom Gifts &amp; Photo Frames</title>
        <meta
          name="description"
          content="Official GraphicWala (Graphic Wala) store for Custom Photo Frames, Sublimation Mugs, T-Shirts, Keychains, PVC ID Cards, Billbooks, Letterpads, Handbills, Posters & Wedding Cards. Live design preview on WhatsApp!"
        />
        <meta
          name="keywords"
          content="GraphicWala, Graphic Wala, graphicwala.com, custom photo frames, sublimation mugs, printed t-shirts, keychains, billbook printing, letterpad printing, handbill printing, posters, wedding cards, digital wedding invitations"
        />
        <link rel="canonical" href="https://www.graphicwala.com/" />
        <meta
          property="og:title"
          content="GraphicWala (Graphic Wala) | Printing • Design • Branding & Custom Gifts"
        />
        <meta
          property="og:description"
          content="Order Custom Photo Frames, Mugs, T-Shirts, Keychains, Billbooks, Letterpads, Handbills, Posters & Wedding Cards directly on WhatsApp with live design preview!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.graphicwala.com/" />
        <meta property="og:image" content="https://www.graphicwala.com/og-square.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="GraphicWala (Graphic Wala) | Custom Printing, Sublimation Gifts & Wedding Cards"
        />
        <meta
          name="twitter:description"
          content="Custom Photo Frames, Mugs, T-Shirts, Billbooks, Letterpads & Wedding Cards. Direct WhatsApp design preview & All India delivery."
        />
        <meta name="twitter:image" content="https://www.graphicwala.com/og-square.png" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <AnnouncementBanner />

      <Header />

      <main className="flex-1 bg-white">
        <HeroSection />

        <TrustStrip />

        <FlashSaleBanner />

        <Bestsellers products={products} loading={loading} />

        <CategoryShowcase categories={categories} getImage={getCategoryImage} />

        <section className="py-14 md:py-20 bg-slate-50/70 border-y border-slate-200/80" aria-labelledby="cmyk-services-heading">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-extrabold uppercase tracking-wider text-[#0F172A] mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00AEEF]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6007E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFED00] border border-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                <span>Printing • Design • Branding</span>
              </div>
              <h2 id="cmyk-services-heading" className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Complete <span className="text-[#00AEEF]">Sublimation Gifts</span> &amp;{' '}
                <span className="text-[#E6007E]">Commercial Printing</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base mt-3 font-medium">
                Send your photos or printing matter directly on WhatsApp or Call. Check your live design preview for any spelling or photo changes before we print!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CMYK_SERVICE_PILLARS.map(pillar => {
                const IconComponent = pillar.icon;
                const itemWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hello GraphicWala! I want to order / enquire about *${pillar.title}*. Please share design samples and price.`
                )}`;
                return (
                  <div
                    key={pillar.id}
                    className={`bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 ${pillar.borderTop} shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pillar.badgeBg}`}>
                          {pillar.badge}
                        </span>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200/80"
                          style={{ color: pillar.accentColor }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#0F172A] leading-snug">{pillar.title}</h3>
                      <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">{pillar.description}</p>

                      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        {pillar.items.map(subItem => (
                          <li key={subItem} className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-800">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00AEEF]" />
                            <span>{subItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                      <a
                        href={itemWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs md:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Order on WhatsApp</span>
                      </a>
                      <a
                        href={callUrl}
                        title="Call Directly"
                        className="bg-slate-100 hover:bg-[#0F172A] hover:text-white text-[#0F172A] font-bold text-xs md:text-sm py-3 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-4 h-4 text-[#E6007E]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-4 bg-white">
          <div className="container">
            <AdBanner slotId="homepage_after_products" />
          </div>
        </section>

        <HowItWorks />

        <WhyBuyFromUs />

        <StatsCounter />

        <LazySection minHeight={400}>
          <TrendingProducts />
        </LazySection>

        <LazySection minHeight={400}>
          <TestimonialsSection />
        </LazySection>

        <LazySection minHeight={400}>
          <BeforeAfterShowcase />
        </LazySection>

        <LazySection minHeight={400}>
          <CustomerGallery />
        </LazySection>

        <TrustPanel />

        {viewedIds.length > 0 && <RecentlyViewedProducts viewedIds={viewedIds} />}

        <section className="py-16 md:py-20 bg-white border-t border-slate-200" aria-labelledby="cta-heading">
          <div className="container">
            <div className="relative rounded-3xl bg-gradient-to-r from-[#00AEEF]/10 via-white to-[#E6007E]/10 border-2 border-slate-200 p-8 md:p-12 text-center shadow-sm overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background:
                    'linear-gradient(90deg, #00AEEF 0% 25%, #E6007E 25% 50%, #FFED00 50% 75%, #0F172A 75% 100%)',
                }}
              />

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFED00]/40 text-[#0F172A] text-xs font-extrabold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
                <span>Live Design Verification on WhatsApp</span>
              </div>

              <h2 id="cta-heading" className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4">
                Ready to Order Custom Gifts or Printing?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-8 font-medium text-sm md:text-base">
                Order personalized Photo Frames, Mugs, T-Shirts, Keychains, PVC ID Cards, Billbooks, Letterpads, Handbills, Posters &amp; Wedding Cards. Share your photos on WhatsApp and approve the design before printing!
              </p>

              <nav className="flex flex-wrap justify-center gap-3.5" aria-label="Get started actions">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
                  <Button
                    size="xl"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 border-0"
                  >
                    <MessageCircle className="h-5 w-5 mr-1.5" aria-hidden="true" />
                    Order on WhatsApp
                  </Button>
                </a>

                <a href={callUrl} aria-label="Call GraphicWala directly">
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-2 border-[#0F172A] bg-white text-[#0F172A] hover:bg-[#0F172A] hover:text-white font-bold"
                  >
                    <Phone className="h-5 w-5 mr-1.5 text-[#E6007E]" aria-hidden="true" />
                    Call Now
                  </Button>
                </a>

                <a href="/products" aria-label="Browse all products">
                  <Button
                    size="xl"
                    className="bg-[#00AEEF] hover:bg-[#0095CC] text-white font-bold shadow-md shadow-[#00AEEF]/20 border-0"
                  >
                    Browse All Products
                    <ArrowRight className="h-5 w-5 ml-1.5" aria-hidden="true" />
                  </Button>
                </a>
              </nav>
            </div>
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

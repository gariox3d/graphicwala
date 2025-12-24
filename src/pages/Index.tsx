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
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useStoreSettings();

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').limit(8),
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
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Delivery Info Banner */}
        <section className="py-8 bg-background">
          <div className="container">
            <DeliveryInfoBanner />
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Graphic Wala?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We deliver excellence in every print, ensuring your satisfaction with our premium services.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="bg-card rounded-xl p-6 shadow-soft hover:shadow-brand transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">Find the perfect product for your needs</p>
              </div>
              <Link to="/products" className="hidden md:block">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category, index) => {
                const categoryImage = getCategoryImage(category.name, category.image_url);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Background Image or Gradient */}
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-foreground" />
                    )}
                    {/* Dark Overlay for text readability */}
                    <div className="absolute inset-0 bg-foreground/60 group-hover:bg-foreground/50 transition-colors duration-300" />
                    {/* Category Name */}
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

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Discover our best-selling items</p>
              </div>
              <Link to="/products" className="hidden md:block">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center mt-8 md:hidden">
              <Link to="/products">
                <Button variant="outline" size="lg">
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-12 bg-background">
          <div className="container">
            <SupportContact />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">Ready to Get Started?</h2>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 font-medium">
              Join thousands of satisfied customers who trust Graphic Wala for their printing needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products">
                <Button variant="cta-secondary" size="xl">
                  Browse Products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-2 border-primary-foreground/80 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold backdrop-blur-sm"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

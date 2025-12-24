import { Link } from 'react-router-dom';
import { ArrowRight, Printer, CreditCard, Palette, Truck, Shield, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      title: 'Fast Delivery',
      description: 'Quick turnaround and reliable shipping across India',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: '100% satisfaction guaranteed on all products',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service for your queries',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-foreground text-background overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)),transparent_50%)]" />
          </div>
          <div className="container relative py-20 md:py-32">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-6 animate-fade-in">
                #1 Printing Service in India
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-slide-up">
                Premium Prints for
                <span className="text-primary block">Every Occasion</span>
              </h1>
              <p className="text-lg md:text-xl text-background/70 mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                From photo frames to visiting cards, we bring your ideas to life with exceptional quality and unmatched service.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/products">
                  <Button variant="hero" size="xl">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="hero-outline" size="xl">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
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
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-foreground to-foreground/80 shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3 className="text-background font-semibold text-center text-sm md:text-base group-hover:scale-105 transition-transform duration-300">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
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

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers who trust Graphic Wala for their printing needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products">
                <Button variant="secondary" size="xl">
                  Browse Products
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

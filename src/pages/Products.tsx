import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getCategoryCopy } from '@/components/home/CategoryGrid';
import { Link } from 'react-router-dom';
import { categorySlug } from '@/lib/categorySeo';
import { PRODUCT_CARD_FIELDS_WITH_CATEGORY } from '@/lib/productFields';

/** Cards rendered per "page" — keeps the first paint light on slow connections. */
const PAGE_SIZE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const selectedCategory = searchParams.get('category');
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          supabase
            .from('products')
            .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY)
            .order('display_order', { ascending: true })
            .limit(60),
          supabase.from('categories').select('id, name, description, image_url'),
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value.data) {
          setProducts(productsRes.value.data as unknown as Product[]);
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
          setCategories(categoriesRes.value.data as Category[]);
        }

        if (productsRes.status === 'rejected') {
          console.error('Failed to load products page data:', productsRes.reason);
        }
        if (categoriesRes.status === 'rejected') {
          console.error('Failed to load category filters:', categoriesRes.reason);
        }
      } catch (error) {
        console.error('Error fetching products page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to top of products section when category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  const handleCategoryChange = (category?: string) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
    // Also scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categories?.name === selectedCategory)
    : products;
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const pageTitle = selectedCategory
    ? `Custom ${selectedCategory} Online in India | Graphic Wala`
    : 'Custom Photo Frames, PVC Cards, Keychains & More | Graphic Wala';
  const pageDescription = selectedCategory
    ? `${getCategoryCopy(selectedCategory)} Order custom ${selectedCategory.toLowerCase()} from Graphic Wala — premium printing, fast dispatch and All India delivery.`
    : 'Buy custom photo frames, PVC cards, ID cards, visiting cards, keychains & personalized gifts online. Premium quality with All India home delivery.';
  const heading = selectedCategory
    ? `Custom ${selectedCategory} Online in India`
    : 'Custom Printed Products & Personalized Gifts';
  const intro = selectedCategory
    ? `${getCategoryCopy(selectedCategory)} Printed in 24-48 hours and delivered to every pincode in India. All orders are prepaid — pay securely by UPI, card or netbanking.`
    : 'Photo frames, PVC cards, ID cards, visiting cards and keychains — personalised with your photo or details and shipped across India.';
  // Filtered views are duplicates of the richer /category/... landing pages,
  // so they point their canonical (and og:url) there.
  const canonicalUrl = selectedCategory
    ? `https://www.graphicwala.com/category/${categorySlug(selectedCategory)}`
    : 'https://www.graphicwala.com/products';

  // ItemList JSON-LD for product listing
  const itemListJsonLd = !loading && filteredProducts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": selectedCategory || "All Products",
    "numberOfItems": filteredProducts.length,
    "itemListElement": filteredProducts.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://www.graphicwala.com/product/${(p as any).slug || p.id}`,
      "name": p.name,
      "image": p.image_url || undefined
    }))
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.graphicwala.com/og-square.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {itemListJsonLd && (
          <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        )}
      </Helmet>
      <Header />
      <main className="flex-1 py-8" ref={productsRef}>
        <div className="container">
          <header className="mb-8 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{heading}</h1>
            <p className="text-muted-foreground">{intro}</p>
          </header>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              variant={!selectedCategory ? 'hero' : 'outline'} 
              size="sm" 
              className="shrink-0 rounded-full transition-all duration-200"
              onClick={() => handleCategoryChange()}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button 
                key={cat.id} 
                variant={selectedCategory === cat.name ? 'hero' : 'outline'} 
                size="sm" 
                className="shrink-0 rounded-full transition-all duration-200"
                onClick={() => handleCategoryChange(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
              {[...Array(8)].map((_, i) => (<div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse"><div className="aspect-square bg-muted" /><div className="p-4 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
              {visibleProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
          )}
          {!loading && visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load more products
              </Button>
            </div>
          )}
          {!loading && filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No products found.</p>}
          {categories.length > 0 && (
            <nav aria-label="Category landing pages" className="mt-14 border-t border-border pt-8">
              <h2 className="text-lg font-bold mb-3">Shop by category</h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${categorySlug(cat.name)}`} className="text-muted-foreground hover:text-primary font-medium">
                      Custom {cat.name} Online in India
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </main>
      <Footer />
      
    </div>
  );
};

export default Products;

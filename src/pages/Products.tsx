import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedCategory = searchParams.get('category');
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, categories(*)').order('display_order', { ascending: true }),
        supabase.from('categories').select('*'),
      ]);
      if (productsRes.data) setProducts(productsRes.data as unknown as Product[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Scroll to top of products section when category changes
  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8" ref={productsRef}>
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Our Products</h1>
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant={!selectedCategory ? 'hero' : 'outline'} size="sm" onClick={() => handleCategoryChange()}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.name ? 'hero' : 'outline'} size="sm" onClick={() => handleCategoryChange(cat.name)}>{cat.name}</Button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (<div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse"><div className="aspect-square bg-muted" /><div className="p-4 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
          )}
          {!loading && filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No products found.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;


import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import {
  Search,
  PackageSearch,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getCategoryCopy } from '@/components/home/CategoryGrid';
import { categorySlug } from '@/lib/categorySeo';
import { PRODUCT_CARD_FIELDS_WITH_CATEGORY } from '@/lib/productFields';

const PAGE_SIZE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = searchParams.get('category');

  const productsRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     FETCH PRODUCTS & CATEGORIES
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          supabase
            .from('products')
            .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY).eq('is_active', true)
            .order('display_order', { ascending: true })
            .limit(60),

          supabase
            .from('categories')
            .select('id, name, description, image_url').eq('is_active', true),
        ]);

        if (!isMounted) return;

        if (productsRes.status === 'fulfilled') {
          if (productsRes.value.error) {
            throw productsRes.value.error;
          }

          setProducts(
            (productsRes.value.data || []) as unknown as Product[]
          );
        } else {
          throw productsRes.reason;
        }

        if (categoriesRes.status === 'fulfilled') {
          if (categoriesRes.value.error) {
            console.error(
              'Category fetch error:',
              categoriesRes.value.error
            );
          } else {
            setCategories(
              (categoriesRes.value.data || []) as Category[]
            );
          }
        } else {
          console.error(
            'Category fetch error:',
            categoriesRes.reason
          );
        }

      } catch (err) {
        console.error('Products loading error:', err);

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =====================================================
     CATEGORY CHANGE
  ===================================================== */

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  const handleCategoryChange = (category?: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category) {
      nextParams.set('category', category);
    } else {
      nextParams.delete('category');
    }

    setSearchParams(nextParams);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(
        (product) => product.categories?.name === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter((product) =>
        product.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  /* =====================================================
     SEO
  ===================================================== */

  const pageTitle = selectedCategory
    ? `Custom ${selectedCategory} Online in India | Graphic Wala`
    : 'Custom Photo Frames, PVC Cards, Keychains & More | Graphic Wala';

  const pageDescription = selectedCategory
    ? `${getCategoryCopy(selectedCategory)} Order custom ${selectedCategory.toLowerCase()} from Graphic Wala — premium printing and All India delivery.`
    : 'Buy custom photo frames, PVC cards, ID cards, visiting cards, keychains and personalized gifts online. Premium quality with All India delivery.';

  const heading = selectedCategory
    ? `Custom ${selectedCategory}`
    : 'Discover Our Products';

  const intro = selectedCategory
    ? `${getCategoryCopy(selectedCategory)} Explore our collection of customized ${selectedCategory.toLowerCase()} with premium printing and All India delivery.`
    : 'Explore our collection of personalized gifts and professional printing products. Made with creativity, printed with quality and delivered across India.';

  const canonicalUrl = selectedCategory
    ? `https://www.graphicwala.com/category/${categorySlug(selectedCategory)}`
    : 'https://www.graphicwala.com/products';

  /* =====================================================
     PRODUCT STRUCTURED DATA
  ===================================================== */

  const itemListJsonLd = useMemo(() => {
    if (loading || filteredProducts.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: selectedCategory || 'All Products',
      numberOfItems: filteredProducts.length,

      itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.graphicwala.com/product/${(product as any).slug || product.id}`,
        name: product.name,
        image: product.image_url || undefined,
      })),
    };
  }, [loading, filteredProducts, selectedCategory]);

  /* =====================================================
     PRODUCT LOADING SKELETON
  ===================================================== */

  const ProductSkeleton = () => (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm animate-pulse">

      <div className="aspect-square bg-slate-100" />

      <div className="space-y-3 p-4 sm:p-5">

        <div className="h-3 w-1/3 rounded-full bg-slate-100" />

        <div className="h-4 w-4/5 rounded-full bg-slate-100" />

        <div className="h-4 w-2/5 rounded-full bg-slate-100" />

        <div className="flex items-center justify-between pt-2">

          <div className="h-6 w-20 rounded-lg bg-slate-100" />

          <div className="h-9 w-24 rounded-xl bg-slate-100" />

        </div>

      </div>

    </div>
  );

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* SEO */}
      <Helmet>

        <title>{pageTitle}</title>

        <meta
          name="description"
          content={pageDescription}
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />

        <meta
          property="og:image"
          content="https://www.graphicwala.com/og-square.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {itemListJsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(itemListJsonLd)}
          </script>
        )}

      </Helmet>

      <Header />

      <main className="relative flex-1 overflow-hidden">

        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">

          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#00AEEF]/[0.05] blur-[100px]" />

          <div className="absolute -left-40 top-80 h-96 w-96 rounded-full bg-[#E6007E]/[0.04] blur-[100px]" />

        </div>

        <div className="container py-10 sm:py-14 lg:py-16">

          {/* PAGE INTRO */}
          <section className="mb-10 sm:mb-14">

            <div className="mx-auto max-w-3xl text-center">

              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00AEEF]/[0.08] px-4 py-2">

                <Sparkles className="h-4 w-4 text-[#00AEEF]" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-700 sm:text-xs">
                  Graphic Wala Collection
                </span>

              </div>

              {/* Heading */}
              <h1 className="font-outfit text-3xl font-extrabold leading-tight tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">

                {heading}

                {!selectedCategory && (
                  <span className="block bg-gradient-to-r from-[#00AEEF] via-[#E6007E] to-[#111111] bg-clip-text text-transparent">
                    Made Just For You.
                  </span>
                )}

              </h1>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">

                {intro}

              </p>

              {/* Product Count */}
              {!loading && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">

                  <span className="h-2 w-2 rounded-full bg-[#00AEEF]" />

                  {filteredProducts.length} Products Available

                </div>
              )}

            </div>

          </section>


          {/* CATEGORY FILTERS */}
          <section className="mb-8">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="font-outfit text-lg font-bold text-slate-900 sm:text-xl">
                Explore Categories
              </h2>

              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange()}
                  className="text-xs font-bold text-[#00AEEF] transition hover:text-[#E6007E]"
                >
                  Clear Filter
                </button>
              )}

            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">

              <button
                onClick={() => handleCategoryChange()}
                aria-pressed={!selectedCategory}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
                  !selectedCategory
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Products
              </button>

              {categories.map((category) => (

                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.name)}
                  aria-pressed={selectedCategory === category.name}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
                    selectedCategory === category.name
                      ? 'bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.name}
                </button>

              ))}

            </div>

          </section>


          {/* SEARCH & RESULTS */}
          <section ref={productsRef}>

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-outfit text-xl font-bold text-slate-900 sm:text-2xl">
                  {selectedCategory || 'All Products'}
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Find something perfect for you.
                </p>

              </div>

              {/* Search */}
              <div className="relative w-full sm:max-w-xs">

                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm focus-visible:ring-[#00AEEF]"
                />

              </div>

            </div>


            {/* PRODUCT GRID */}
            {loading ? (

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">

                {Array.from({ length: 10 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}

              </div>

            ) : error ? (

              <div className="rounded-2xl bg-slate-50 px-5 py-16 text-center">

                <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />

                <h3 className="mt-4 font-outfit text-xl font-bold text-slate-900">
                  Unable to Load Products
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Please check your connection and try again.
                </p>

                <Button
                  className="mt-5 rounded-xl bg-[#00AEEF] hover:bg-[#0095CC]"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>

              </div>

            ) : visibleProducts.length > 0 ? (

              <>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">

                  {visibleProducts.map((product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                    />

                  ))}

                </div>

                {/* Load More */}
                {visibleCount < filteredProducts.length && (

                  <div className="mt-12 flex flex-col items-center">

                    <p className="mb-4 text-xs font-medium text-slate-500">
                      Showing {visibleProducts.length} of {filteredProducts.length} products
                    </p>

                    <Button
                      variant="outline"
                      size="lg"
                      className="group h-12 rounded-full border-slate-200 bg-white px-7 font-bold text-slate-800 transition hover:border-[#00AEEF] hover:bg-[#00AEEF]/5"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                    >

                      Load More Products

                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

                    </Button>

                  </div>

                )}

              </>

            ) : (

              /* EMPTY STATE */
              <div className="rounded-2xl bg-slate-50 px-5 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">

                  <PackageSearch className="h-8 w-8 text-[#00AEEF]" />

                </div>

                <h3 className="mt-5 font-outfit text-xl font-bold text-slate-900">
                  No Products Found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or explore all our products.
                </p>

                <Button
                  className="mt-5 rounded-xl bg-[#111111] text-white hover:bg-slate-800"
                  onClick={() => {
                    setSearchQuery('');
                    handleCategoryChange();
                  }}
                >
                  View All Products
                </Button>

              </div>

            )}

          </section>


          {/* CATEGORY SEO LINKS */}
          {categories.length > 0 && (

            <section className="mt-20">

              <div className="mb-6">

                <span className="text-xs font-bold uppercase tracking-widest text-[#00AEEF]">
                  Explore More
                </span>

                <h2 className="mt-2 font-outfit text-2xl font-extrabold text-slate-900">
                  Shop By Category
                </h2>

              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

                {categories.map((category) => (

                  <Link
                    key={category.id}
                    to={`/category/${categorySlug(category.name)}`}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-4 transition-all duration-200 hover:bg-[#00AEEF]/[0.07]"
                  >

                    <span className="text-xs font-bold text-slate-700 transition group-hover:text-[#0095CC] sm:text-sm">
                      Custom {category.name}
                    </span>

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#00AEEF]" />

                  </Link>

                ))}

              </div>

            </section>

          )}

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default Products;

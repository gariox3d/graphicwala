
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';
import { categorySlug, getCategorySeo } from '@/lib/categorySeo';
import { PRODUCT_CARD_FIELDS_WITH_CATEGORY } from '@/lib/productFields';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SITE = 'https://www.graphicwala.com';

const CategoryLanding = () => {
  const { slug = '' } = useParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setFetchError(false);
      setCategory(null);
      setProducts([]);

      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name, description, image_url');

        if (catError) throw catError;
        if (!active) return;

        const cats = (catData || []) as Category[];

        const matched =
          cats.find((c) => categorySlug(c.name) === slug) || null;

        setCategories(cats);
        setCategory(matched);

        if (!matched) {
          setLoading(false);
          return;
        }

        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY)
          .eq('category_id', matched.id)
          .order('display_order', { ascending: true })
          .limit(48);

        if (prodError) throw prodError;
        if (!active) return;

        setProducts((prodData || []) as unknown as Product[]);
      } catch (error) {
        console.error('Category page loading error:', error);

        if (active) {
          setFetchError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  const isValidCategory = Boolean(category);

  const name = category?.name || 'Category';

  const seo = useMemo(
    () => getCategorySeo(name),
    [name]
  );

  const canonical = isValidCategory
    ? `${SITE}/category/${categorySlug(category!.name)}`
    : null;

  const jsonLd = useMemo(() => {
    if (!isValidCategory || !canonical) return [];

    const schemas: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: `${SITE}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: canonical,
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seo.h1,
        description: seo.description,
        url: canonical,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Graphic Wala',
          url: SITE,
        },
      },
    ];

    if (products.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: seo.h1,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE}/product/${(product as any).slug || product.id}`,
          name: product.name,
        })),
      });
    }

    return schemas;
  }, [isValidCategory, canonical, name, seo, products]);

  const pageTitle = isValidCategory
    ? seo.title
    : 'Category Not Found | Graphic Wala';

  const pageDescription = isValidCategory
    ? seo.description
    : 'The requested product category could not be found. Explore all products at Graphic Wala.';

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>

        <meta
          name="description"
          content={pageDescription}
        />

        <meta
          name="robots"
          content={
            isValidCategory
              ? 'index, follow, max-image-preview:large'
              : 'noindex, follow'
          }
        />

        {canonical && (
          <link rel="canonical" href={canonical} />
        )}

        <meta property="og:site_name" content="Graphic Wala" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />

        {canonical && (
          <meta property="og:url" content={canonical} />
        )}

        {isValidCategory && category?.image_url && (
          <meta property="og:image" content={category.image_url} />
        )}

        <meta name="twitter:card" content="summary_large_image" />

        {jsonLd.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
          >
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <Header />

      <main className="flex-1">
        <div className="container py-8">

          {!loading && !isValidCategory ? (
            <section className="mx-auto max-w-xl py-20 text-center">
              <h1 className="text-3xl font-black tracking-tight">
                {fetchError
                  ? 'Unable to Load Category'
                  : 'Category Not Found'}
              </h1>

              <p className="mt-3 text-muted-foreground">
                {fetchError
                  ? 'Please check your connection and try again.'
                  : 'This category may have been removed or the URL may be incorrect.'}
              </p>

              <Link
                to="/products"
                className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                Browse All Products
              </Link>
            </section>
          ) : (
            <>
              <nav
                aria-label="Breadcrumb"
                className="text-sm text-muted-foreground mb-4"
              >
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>

                <span className="mx-2">/</span>

                <Link to="/products" className="hover:text-primary">
                  Products
                </Link>

                <span className="mx-2">/</span>

                <span className="text-foreground font-medium">
                  {name}
                </span>
              </nav>

              <header className="max-w-3xl mb-8">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  {loading ? 'Loading Category...' : seo.h1}
                </h1>

                <p className="text-muted-foreground">
                  {category?.description || seo.intro}
                </p>
              </header>

              {categories.length > 0 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  <Link
                    to="/products"
                    className="shrink-0 rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                  >
                    All Products
                  </Link>

                  {categories.map((c) => {
                    const s = categorySlug(c.name);
                    const active = s === slug;

                    return (
                      <Link
                        key={c.id}
                        to={`/category/${s}`}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary hover:text-primary'
                        }`}
                      >
                        {c.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : fetchError ? (
                <p className="text-muted-foreground py-8">
                  Unable to load products. Please try again later.
                </p>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8">
                  New designs for {name.toLowerCase()} are being added.{' '}
                  <Link
                    to="/products"
                    className="text-primary font-semibold"
                  >
                    Browse all products
                  </Link>.
                </p>
              )}

              <section
                className="border-t border-border bg-muted/30 py-12 mt-12"
                aria-labelledby="about-category"
              >
                <div className="container max-w-3xl">
                  <h2
                    id="about-category"
                    className="sr-only"
                  >
                    About {name}
                  </h2>

                  <div className="space-y-8">
                    {seo.sections.map((section) => (
                      <article key={section.h2}>
                        <h2 className="text-xl md:text-2xl font-bold mb-2">
                          {section.h2}
                        </h2>

                        <p className="text-muted-foreground leading-relaxed">
                          {section.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section
                className="py-12"
                aria-labelledby="category-faq"
              >
                <div className="container max-w-3xl">
                  <h2 className="text-2xl font-black tracking-tight mb-4">
                    {name} — Frequently Asked Questions
                  </h2>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    {seo.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`faq-${index}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>

                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryLanding;

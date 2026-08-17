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

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      // 1. Categories only (small payload) — used for the filter chips + slug match.
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, description, image_url');
      if (!active) return;
      const cats = (catData || []) as Category[];
      const matched = cats.find((c) => categorySlug(c.name) === slug) || null;
      setCategories(cats);
      setCategory(matched);

      // 2. Only this category's products are fetched — never the whole catalogue.
      if (!matched) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data: prodData } = await supabase
        .from('products')
        .select(PRODUCT_CARD_FIELDS_WITH_CATEGORY)
        .eq('category_id', matched.id)
        .order('display_order', { ascending: true })
        .limit(48);
      if (!active) return;
      setProducts((prodData || []) as unknown as Product[]);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const name = category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const seo = useMemo(() => getCategorySeo(name), [name]);
  const list = products;
  const canonical = `${SITE}/category/${slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/products` },
        { '@type': 'ListItem', position: 3, name, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seo.h1,
      description: seo.description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'Graphic Wala', url: SITE },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  if (list.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: seo.h1,
      numberOfItems: list.length,
      itemListElement: list.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/product/${(p as any).slug || p.id}`,
        name: p.name,
      })),
    } as any);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords.join(', ')} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        {category?.image_url && <meta property="og:image" content={category.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{name}</span>
          </nav>

          <header className="max-w-3xl mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{seo.h1}</h1>
            <p className="text-muted-foreground">{category?.description || seo.intro}</p>
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
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">
              New designs for {name.toLowerCase()} are being added.{' '}
              <Link to="/products" className="text-primary font-semibold">Browse all products</Link>.
            </p>
          )}
        </div>

        <section className="border-t border-border bg-muted/30 py-12" aria-labelledby="about-category">
          <div className="container max-w-3xl">
            <h2 id="about-category" className="sr-only">
              About {name}
            </h2>
            <div className="space-y-8">
              {seo.sections.map((s) => (
                <article key={s.h2}>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{s.h2}</h2>
                  <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12" aria-labelledby="category-faq">
          <div className="container max-w-3xl">
            <h2 id="category-faq" className="text-2xl font-black tracking-tight mb-4">
              {name} — Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {seo.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryLanding;
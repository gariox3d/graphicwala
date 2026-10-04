import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell, ServiceCard } from '@/components/services/ServiceBlocks';
import ProductGridCard from '@/components/products/ProductGridCard';
import { HOMEPAGE_SERVICE_GROUPS } from '@/data/homepageServices';
import { GRAPHIC_DESIGN } from '@/data/services';
import { getHomepageProductGroup, getHomepageServiceDescription } from '@/lib/homepageCategoryFilter';
import { PRODUCT_CARD_FIELDS } from '@/lib/productFields';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/types';
import NotFound from './NotFound';

async function loadCategoryCatalogue() {
  const products: Product[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('products').select(PRODUCT_CARD_FIELDS)
      .eq('is_active', true).order('display_order', { ascending: true }).order('id')
      .range(offset, offset + 999);
    if (error) throw error;
    products.push(...(data as unknown as Product[]));
    if (data.length < 1000) break;
  }
  const { data: categories, error } = await supabase.from('categories').select('id, name');
  if (error) throw error;
  return { products, categories: Object.fromEntries(categories.map((c) => [c.id, c.name])) };
}

const HomepageCategory = () => {
  const { group: slug } = useParams();
  const group = HOMEPAGE_SERVICE_GROUPS.find((g) => g.title.toLowerCase() === slug);
  const catalogue = useQuery({ queryKey: ['homepage-category-catalogue'], queryFn: loadCategoryCatalogue, enabled: Boolean(group) });
  const images = useQuery({
    queryKey: ['homepage-service-images'],
    enabled: Boolean(group),
    queryFn: async () => {
      const { data, error } = await supabase.from('homepage_service_images').select('service_key, image_url');
      if (error) throw error;
      return Object.fromEntries(data.map((image) => [image.service_key, image.image_url]));
    },
  });
  if (!group) return <NotFound />;
  const products = catalogue.data?.products.filter((p) =>
    getHomepageProductGroup(p, catalogue.data?.categories[p.category_id ?? ''] ?? '') === group.title
  ) ?? [];
  const lead = group.items.map((item) => item.label).join(' • ');

  return (
    <PageShell title={`${group.title} Services & Products | Graphic Wala`} description={lead}
      path={group.to} eyebrow="GRAPHIC WALA" h1={group.title} lead={lead}
      actions={<Button asChild variant="outline" className="rounded-full"><Link to="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link></Button>}
    >
      <section className="py-12 md:py-16" aria-labelledby="category-services">
        <div className="container">
          <h2 id="category-services" className="mb-8 text-2xl md:text-3xl font-black">Services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((item) => <ServiceCard key={item.key}
              s={{ name: item.label, description: getHomepageServiceDescription(item), icon: GRAPHIC_DESIGN.items[0].icon }}
              thumbnail={{ url: images.data?.[item.key] }} />)}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16 bg-secondary" aria-labelledby="category-products">
        <div className="container">
          <h2 id="category-products" className="mb-6 text-2xl md:text-3xl font-black">Products</h2>
          {catalogue.isPending ? <p role="status" className="text-muted-foreground">Loading products…</p>
            : catalogue.isError ? <div role="alert"><p className="text-muted-foreground">Products could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => catalogue.refetch()}>Try again</Button></div>
            : products.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">{products.map((p) => <ProductGridCard key={p.id} product={p} />)}</div>
            : <p className="text-muted-foreground">No online products in this category yet.</p>}
        </div>
      </section>
    </PageShell>
  );
};

export default HomepageCategory;
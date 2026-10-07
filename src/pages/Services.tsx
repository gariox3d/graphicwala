import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { PageShell, waLink } from '@/components/services/ServiceBlocks';
import { Button } from '@/components/ui/button';
import SmartImage from '@/components/SmartImage';
import { HOMEPAGE_SERVICE_GROUPS } from '@/data/homepageServices';
import { getHomepageProductGroup } from '@/lib/homepageCategoryFilter';
import { PRODUCT_CARD_FIELDS } from '@/lib/productFields';
import { BUSINESS_NAME, getEffectivePrice, type Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

const filters = ['All', 'Design', 'Print', 'Customize'] as const;

async function loadServices() {
  const products: Product[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('products').select(PRODUCT_CARD_FIELDS)
      .eq('is_active', true).order('display_order').order('id').range(offset, offset + 999);
    if (error) throw error;
    products.push(...(data as unknown as Product[]));
    if (data.length < 1000) break;
  }
  const { data, error } = await supabase.from('categories').select('id, name');
  if (error) throw error;
  const categories = Object.fromEntries(data.map((category) => [category.id, category.name]));
  return products.map((product) => {
    const category = categories[product.category_id ?? ''] ?? '';
    const group = product.service_group || (['DESIGN', 'PRINT', 'CUSTOMIZE'].includes(category.toUpperCase())
      ? category.toUpperCase() : getHomepageProductGroup(product, category));
    return { product, group };
  });
}

const Services = () => {
  const [params, setParams] = useSearchParams();
  const filter = filters.find((value) => value.toLowerCase() === params.get('category')?.toLowerCase()) ?? 'All';
  const catalogue = useQuery({
    queryKey: ['services-catalogue'], queryFn: loadServices,
    staleTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true, refetchInterval: 15000,
  });

  return (
    <PageShell title="Services | Graphic Wala — Design, Print & Customize"
      description="Explore Graphic Wala design, printing and customized products with images, prices and WhatsApp ordering."
      path="/services" eyebrow="GRAPHIC WALA" h1="Services" lead="DESIGN • PRINT • CUSTOMIZE">
      <div className="container py-8 md:py-12">
        <nav aria-label="Service category filters" className="mb-10 flex flex-wrap gap-2">
          {filters.map((value) => <Button key={value} variant={filter === value ? 'default' : 'outline'}
            aria-pressed={filter === value} onClick={() => setParams(value === 'All' ? {} : { category: value.toLowerCase() }, { preventScrollReset: true })}>
            {value}
          </Button>)}
        </nav>
        {catalogue.isPending ? <p role="status" className="text-muted-foreground">Loading services…</p>
          : catalogue.isError ? <div role="alert"><p>Services could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => catalogue.refetch()}>Try again</Button></div>
          : HOMEPAGE_SERVICE_GROUPS.filter((group) => filter === 'All' || group.title === filter.toUpperCase()).map((group) => {
            const products = catalogue.data?.filter((entry) => entry.group === group.title).map((entry) => entry.product) ?? [];
            return <section key={group.title} aria-labelledby={`services-${group.title}`} className="mb-12 last:mb-0">
              <h2 id={`services-${group.title}`} className="mb-6 text-2xl font-black md:text-3xl">{group.title}</h2>
              {products.length === 0 ? <p className="text-muted-foreground">No services available in this category yet.</p>
                : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const href = `/product/${product.slug || product.id}`;
                    const price = getEffectivePrice(product);
                    const image = product.image_url || product.image_urls?.[0];
                    return <article key={product.id} data-service-id={product.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
                      <Link to={href} className="block aspect-square border-b border-border bg-background" aria-label={`View ${product.name}`}>
                        <SmartImage key={image} src={image || '/placeholder.svg'} alt={product.name} className="h-full w-full object-contain"
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px" width={600} height={600} />
                      </Link>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="text-lg font-bold leading-snug break-words"><Link to={href}>{product.name}</Link></h3>
                        {(product.short_description || product.description) && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{product.short_description || product.description}</p>}
                        {price > 0 && <p className="mt-3 text-sm font-semibold">Starting from <span className="text-primary">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>}
                        <div className="mt-auto flex flex-col gap-2 pt-5">
                          <Button asChild variant="outline"><Link to={href}>View Details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
                          <Button asChild><a href={waLink(`Hello ${BUSINESS_NAME}, I want to order: ${product.name}`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp Order</a></Button>
                        </div>
                      </div>
                    </article>;
                  })}
                </div>}
            </section>;
          })}
      </div>
    </PageShell>
  );
};

export default Services;
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageShell, GroupSection } from '@/components/services/ServiceBlocks';
import ProductGridCard from '@/components/products/ProductGridCard';
import { PHOTO_PRODUCTS, SUBLIMATION, PVC_ID, PRODUCT_FILTERS } from '@/data/services';
import { PRODUCT_CARD_FIELDS } from '@/lib/productFields';
import type { Product } from '@/lib/types';

const CustomProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([
        supabase.from('products').select(PRODUCT_CARD_FIELDS).eq('is_active', true).order('display_order', { ascending: true }).limit(60),
        supabase.from('categories').select('id, name'),
      ]);
      if (p.data) setProducts(p.data as unknown as Product[]);
      if (c.data) setCats(Object.fromEntries(c.data.map((x) => [x.id, x.name])));
    })();
  }, []);

  const shown = useMemo(() => {
    const kw = PRODUCT_FILTERS.find((x) => x.label === filter)?.keywords ?? [];
    if (!kw.length) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${cats[p.category_id ?? ''] ?? ''}`.toLowerCase();
      return kw.some((k) => hay.includes(k));
    });
  }, [products, cats, filter]);

  return (
    <PageShell
      title="Customized Gifts, Mug & T-Shirt Printing, Photo Frames in Katihar | Graphic Wala"
      description="Photo frames, sublimation mugs, t-shirts, keychains, heart cushions, PVC and ID cards — personalised and delivered across India."
      path="/custom-products"
      eyebrow="Custom Products"
      h1="Personalised Products & Gifts"
      lead="Photo frames, sublimation products and PVC / ID cards — customised with your photo, name or logo."
    >
      <section className="py-12 md:py-16" aria-labelledby="shop-h">
        <div className="container">
          <h2 id="shop-h" className="text-2xl md:text-3xl font-black tracking-tight">Shop Products</h2>
          <div className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="tablist">
            {PRODUCT_FILTERS.map((x) => (
              <button
                key={x.label}
                role="tab"
                aria-selected={filter === x.label}
                onClick={() => setFilter(x.label)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  filter === x.label ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {shown.map((p) => <ProductGridCard key={p.id} product={p} />)}
          </div>
          {shown.length === 0 && (
            <p className="mt-6 text-muted-foreground">No products in this filter yet — ask us on WhatsApp, we make it to order.</p>
          )}
        </div>
      </section>
      <GroupSection g={PHOTO_PRODUCTS} alt />
      <GroupSection g={SUBLIMATION} />
      <GroupSection g={PVC_ID} alt />
    </PageShell>
  );
};

export default CustomProducts;

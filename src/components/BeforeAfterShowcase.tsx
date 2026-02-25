import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ShowcaseItem {
  id: string;
  product_name: string;
  customer_name: string;
  before_image_url: string;
  after_image_url: string;
  caption: string | null;
}

const BeforeAfterShowcase = () => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcase = async () => {
      const { data } = await supabase
        .from('before_after_showcase')
        .select('id, product_name, customer_name, before_image_url, after_image_url, caption')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);
      if (data) setItems(data);
      setLoading(false);
    };
    fetchShowcase();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-secondary" aria-labelledby="before-after-heading">
      <div className="container">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 id="before-after-heading" className="text-3xl md:text-4xl font-bold">
              Design → Reality
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See how your design transforms into a premium product! Customer uploaded design vs final printed product.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Before/After Images */}
              <div className="relative flex">
                {/* Before */}
                <div className="w-1/2 relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.before_image_url}
                      alt={`${item.product_name} - Customer Design`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <span className="absolute top-2 left-2 bg-foreground/70 text-background text-xs font-bold px-2 py-1 rounded-full">
                    DESIGN
                  </span>
                </div>

                {/* Arrow Divider */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                  <ArrowRight className="h-4 w-4" />
                </div>

                {/* After */}
                <div className="w-1/2 relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.after_image_url}
                      alt={`${item.product_name} - Final Product`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    PRODUCT
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm">{item.product_name}</h3>
                <p className="text-xs text-muted-foreground mt-1">by {item.customer_name}</p>
                {item.caption && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterShowcase;

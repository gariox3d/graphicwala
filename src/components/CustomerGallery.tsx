import { useEffect, useState } from 'react';
import { Camera, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  customer_name: string;
  created_at: string;
}

const CustomerGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('customer_gallery')
        .select('id, image_url, caption, customer_name, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      if (data) setItems(data);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="gallery-heading">
      <div className="container">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Camera className="h-6 w-6 text-primary" />
            <h2 id="gallery-heading" className="text-3xl md:text-4xl font-bold">
              Wall of Fame
            </h2>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real photos from our happy customers! See how they love their custom products.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img
                src={item.image_url}
                alt={item.caption || `Photo by ${item.customer_name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-semibold text-sm">{item.customer_name}</p>
                {item.caption && (
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerGallery;

import { useEffect, useRef, useState } from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  rating: number;
  comment: string;
  user_name: string;
  product_name: string;
}

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating, comment, user_name, product_id')
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!data || data.length === 0) return;

      // Fetch product names
      const productIds = [...new Set(data.map(r => r.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      const productMap = new Map(products?.map(p => [p.id, p.name]) || []);

      setReviews(
        data.map(r => ({
          rating: r.rating,
          comment: r.comment,
          user_name: r.user_name,
          product_name: productMap.get(r.product_id) || 'Product',
        }))
      );
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl opacity-60" aria-hidden="true" />

      <div className="container relative">
        <header
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 mb-4 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Loved by Customers
          </div>
          <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold mb-4">
            What Our <span className="text-gradient">Customers</span> Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Real reviews from real customers who love our products ❤️
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <article
              key={index}
              className={`group relative bg-card rounded-2xl p-6 border border-border/60 shadow-soft hover:shadow-brand-red hover:-translate-y-2 hover:border-primary/40 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: visible ? `${index * 120}ms` : '0ms' }}
            >
              {/* Gradient top accent */}
              <div
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <Quote
                className="absolute top-4 right-4 h-10 w-10 text-primary/15 group-hover:text-primary/30 group-hover:scale-110 transition-all duration-500"
                aria-hidden="true"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label={`${review.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                      i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'
                    }`}
                    style={{ transitionDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-[15px] text-foreground/90 mb-5 line-clamp-4 leading-relaxed">
                "{review.comment}"
              </p>

              {/* User info */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center font-bold text-primary-foreground text-sm shadow-brand-red">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{review.user_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{review.product_name}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

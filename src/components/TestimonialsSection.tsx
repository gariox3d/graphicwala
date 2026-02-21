import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  rating: number;
  comment: string;
  user_name: string;
  product_name: string;
}

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

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

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="testimonials-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real reviews from real customers who love our products
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <article
              key={index}
              className="relative bg-card rounded-xl p-6 shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/15" aria-hidden="true" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3" aria-label={`${review.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-foreground/90 mb-4 line-clamp-3 leading-relaxed">
                "{review.comment}"
              </p>

              {/* User info */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{review.user_name}</p>
                  <p className="text-xs text-muted-foreground">{review.product_name}</p>
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

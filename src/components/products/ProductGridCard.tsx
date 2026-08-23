import SmartImage from '@/components/SmartImage';
import { CARD_WIDTHS } from '@/lib/imageUrl';
import { Link } from 'react-router-dom';
import { Product, getEffectivePrice } from '@/lib/types';

const isNew = (p: Product) =>
  p.created_at ? Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 21 : false;

interface Props {
  product: Product;
  /** Optional ribbon shown at the top-left, e.g. "Best Seller" or "Trending". */
  badge?: string;
  /** Whether to show the estimated delivery line. Defaults to true. */
  showDelivery?: boolean;
}

/**
 * Single, shared product card used by every product grid on the site so the
 * layout, information hierarchy and primary action stay consistent.
 */
const ProductGridCard = ({ product: p, badge, showDelivery = true }: Props) => {
  const href = `/product/${(p as any).slug || p.id}`;
  const price = getEffectivePrice(p);
  const days = p.delivery_days || 7;
  const onSale = price < p.price;
  const off = onSale ? Math.round(((p.price - price) / p.price) * 100) : 0;

  return (
    <article className="group flex h-full flex-col">
      {/* Badge strip above the image so the product photo stays clean */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 min-h-[22px]">
        {badge && (
          <span className="bg-primary px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
            {badge}
          </span>
        )}
        {onSale && (
          <span className="bg-foreground px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-background">
            -{off}%
          </span>
        )}
        {!onSale && isNew(p) && (
          <span className="bg-foreground px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-background">
            New
          </span>
        )}
      </div>

      <Link to={href} className="relative block aspect-square bg-white overflow-hidden border border-border">
        {p.image_url ? (
          <SmartImage
            src={p.image_url}
            alt={`${p.name}${p.categories?.name ? ` — ${p.categories.name}` : ''}`}
            className="h-full w-full object-contain bg-white transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            widths={CARD_WIDTHS}
            fallbackWidth={480}
            quality={68}
            resize="contain"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
            width={600}
            height={600}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
        )}

        {!p.stock_quantity && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="bg-destructive px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-destructive-foreground">
              Sold Out
            </span>
          </div>
        )}

        {/* Smooth slide-up action bar */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-foreground/90 py-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-background transition-transform duration-500 ease-out group-hover:translate-y-0">
          View Product
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-4 text-center">
        <Link to={href}>
          <h3 className="text-sm font-semibold tracking-normal text-foreground leading-snug line-clamp-2 transition-colors group-hover:text-primary">
            {p.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-base font-bold text-foreground">₹{price.toFixed(0)}</span>
          {onSale && (
            <span className="text-xs font-light text-muted-foreground line-through">₹{p.price.toFixed(0)}</span>
          )}
        </div>

        {showDelivery && (
          <p className="mt-2 text-xs tracking-[0.02em] text-muted-foreground">
            Delivery in {days} days
          </p>
        )}
      </div>
    </article>
  );
};

export default ProductGridCard;

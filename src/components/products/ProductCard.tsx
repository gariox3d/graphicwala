import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, UploadField } from '@/lib/types';
import FlashSaleBadge from './FlashSaleBadge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import WishlistButton from './WishlistButton';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product & { image_urls?: string[]; sale_price?: number | null; sale_start?: string | null; sale_end?: string | null };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { settings } = useStoreSettings();
  const [isHovered, setIsHovered] = useState(false);

  const uploadConfig = Array.isArray(product.upload_config) 
    ? product.upload_config as UploadField[] 
    : [];
  const hasCustomization = uploadConfig.length > 0;
  const requiredUploads = uploadConfig.filter(f => f.required);

  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url ? [product.image_url] : [];
  const primaryImage = images[0];
  const secondaryImage = images[1];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }
    addToCart(product.id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }
    if (hasCustomization && requiredUploads.length > 0) {
      toast.info('Please upload required photos before checkout');
      navigate(`/product/${(product as any).slug || product.id}`);
      return;
    }
    addToCart(product.id);
    navigate('/checkout');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save items');
      navigate('/auth');
      return;
    }
    toggleWishlist(product.id);
  };

  const isOutOfStock = !product.stock_quantity;

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in"
      style={isOutOfStock ? { filter: 'grayscale(100%)', opacity: 0.65 } : undefined}
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block relative aspect-square overflow-hidden bg-muted"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={`${product.name} - Buy Online from Graphic Wala | Custom Printing India`}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 absolute inset-0",
                isHovered && secondaryImage ? "opacity-0 scale-105" : "opacity-100"
              )}
              loading="lazy"
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} - Alternate View | Graphic Wala`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 absolute inset-0",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Wishlist Heart Button */}
        <WishlistButton
          isWishlisted={isWishlisted(product.id)}
          onClick={handleWishlistClick}
          className="absolute bottom-3 right-3"
        />

        {/* Flash Sale Badge */}
        {product.sale_price && product.sale_end && new Date(product.sale_end) > new Date() && (
          (!product.sale_start || new Date(product.sale_start) <= new Date()) && (
            <FlashSaleBadge
              salePrice={product.sale_price}
              originalPrice={product.price}
              saleEnd={product.sale_end}
            />
          )
        )}
        
        {!product.sale_price && (product.stock_quantity ?? 0) <= 5 && (product.stock_quantity ?? 0) > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md z-10">
            Low Stock
          </span>
        )}
        {isOutOfStock && (
          <>
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <span className="text-white text-xl font-extrabold tracking-wider uppercase bg-destructive/90 px-5 py-2 rounded-lg shadow-lg rotate-[-8deg]">
                Sold Out
              </span>
            </div>
          </>
        )}
        {hasCustomization && (
          <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md z-10">
            Customizable
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {product.sale_price && product.sale_end && new Date(product.sale_end) > new Date() ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-destructive">₹{product.sale_price.toFixed(2)}</span>
              <span className="text-sm line-through text-muted-foreground">₹{product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary block">
              ₹{product.price.toFixed(2)}
            </span>
          )}
          {settings?.bulk_discount_enabled && (
            <p className="text-xs text-green-600 font-medium">
              🎉 Buy {settings.bulk_discount_min_qty}+ & get {settings.bulk_discount_percent}% off!
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.stock_quantity}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart
            </Button>
            <Button
              variant="hero"
              size="sm"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={!product.stock_quantity}
            >
              <Zap className="h-4 w-4 mr-1" />
              Buy
            </Button>
          </div>
          <a
            href={`https://wa.me/916207142994?text=${encodeURIComponent(`Hi, I want to get "${product.name}" photo edited/designed professionally. Please help!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg py-1.5 px-2 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            ✨ Need Photo Editing? Chat with Us!
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

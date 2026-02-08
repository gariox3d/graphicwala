import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, UploadField } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import WishlistButton from './WishlistButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product & { image_urls?: string[] };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
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
      navigate(`/product/${product.id}`);
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

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 animate-scale-in">
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
              alt={product.name}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 absolute inset-0",
                isHovered && secondaryImage ? "opacity-0 scale-105" : "opacity-100"
              )}
              loading="lazy"
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} - alternate view`}
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

        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md z-10">
            Low Stock
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-xs font-semibold px-2 py-1 rounded-md z-10">
            Out of Stock
          </span>
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
          <span className="text-lg font-bold text-primary block">
            ₹{product.price.toFixed(2)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart
            </Button>
            <Button
              variant="hero"
              size="sm"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
            >
              <Zap className="h-4 w-4 mr-1" />
              Buy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

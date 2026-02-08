import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  isWishlisted: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md';
}

const WishlistButton = ({ isWishlisted, onClick, className, size = 'sm' }: WishlistButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110 active:scale-95 z-20",
        size === 'sm' ? 'p-2' : 'p-2.5',
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          isWishlisted
            ? "fill-red-500 text-red-500 animate-[heartBeat_0.3s_ease-in-out]"
            : "text-muted-foreground hover:text-red-400"
        )}
      />
      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
};

export default WishlistButton;

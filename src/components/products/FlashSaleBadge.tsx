import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface FlashSaleBadgeProps {
  salePrice: number;
  originalPrice: number;
  saleEnd: string;
  variant?: 'card' | 'detail';
}

const FlashSaleBadge = ({ salePrice, originalPrice, saleEnd, variant = 'card' }: FlashSaleBadgeProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(saleEnd).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [saleEnd]);

  if (isExpired) return null;

  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

  if (variant === 'detail') {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 animate-pulse" />
          <span className="font-bold text-lg">Flash Sale — {discount}% OFF</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold">₹{salePrice.toLocaleString()}</span>
          <span className="line-through text-white/70 text-lg">₹{originalPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">{timeLeft}</span>
          <span className="text-white/80">remaining</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Flame className="h-3 w-3 animate-pulse" />
          <span>{discount}% OFF</span>
        </span>
        <span className="bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-md">
          {timeLeft}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
        <Flame className="h-3 w-3 animate-pulse" />
        <span>{discount}% OFF</span>
      </div>
      <div className="bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-b-md text-center">
        {timeLeft}
      </div>
    </div>
  );
};

export default FlashSaleBadge;

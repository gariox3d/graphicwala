import { useState, useEffect } from 'react';
import { Clock, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeliveryCountdownProps {
  cutoffTime: string; // Format: "HH:MM:SS" or "HH:MM"
  enableDelivery: boolean;
  deliveryDays?: number;
  className?: string;
}

const DeliveryCountdown = ({ 
  cutoffTime, 
  enableDelivery, 
  deliveryDays = 7,
  className = '' 
}: DeliveryCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isPastCutoff, setIsPastCutoff] = useState(false);

  useEffect(() => {
    if (!enableDelivery || !cutoffTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = cutoffTime.split(':').map(Number);
      
      const cutoffDate = new Date();
      cutoffDate.setHours(hours, minutes, 0, 0);

      // If cutoff time has passed, show next day countdown
      if (now > cutoffDate) {
        setIsPastCutoff(true);
        // Calculate time until next day's cutoff
        cutoffDate.setDate(cutoffDate.getDate() + 1);
      } else {
        setIsPastCutoff(false);
      }

      const diff = cutoffDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours: hoursLeft, minutes: minutesLeft, seconds: secondsLeft };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [cutoffTime, enableDelivery]);

  if (!enableDelivery) {
    return null;
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Calculate estimated delivery date
  const getEstimatedDeliveryDate = () => {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(':').map(Number);
    const cutoffDate = new Date();
    cutoffDate.setHours(hours, minutes, 0, 0);

    // If past cutoff, start from tomorrow
    const startDate = now > cutoffDate ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : now;
    const deliveryDate = new Date(startDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">
            {isPastCutoff ? 'Order tomorrow before cutoff for delivery in' : 'Order within'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-2xl font-bold font-mono text-primary">
          <span className="bg-primary/10 px-2 py-1 rounded">{formatTime(timeLeft.hours)}</span>
          <span className="text-primary/60">:</span>
          <span className="bg-primary/10 px-2 py-1 rounded">{formatTime(timeLeft.minutes)}</span>
          <span className="text-primary/60">:</span>
          <span className="bg-primary/10 px-2 py-1 rounded">{formatTime(timeLeft.seconds)}</span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {isPastCutoff 
            ? `Cutoff time passed. Order now for delivery starting tomorrow + ${deliveryDays} days`
            : `to get delivery in ${deliveryDays} days`
          }
        </p>
      </div>

      {/* Delivery Info Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          {deliveryDays}-Day Delivery
        </Badge>
        <span className="text-sm text-muted-foreground">
          Est. Delivery: <strong>{getEstimatedDeliveryDate()}</strong>
        </span>
      </div>
    </div>
  );
};

export default DeliveryCountdown;
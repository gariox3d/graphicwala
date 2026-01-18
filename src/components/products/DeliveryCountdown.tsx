import { useState, useEffect } from 'react';
import { Clock, Truck, Package, Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeliveryCountdownProps {
  cutoffTime?: string; // Format: "HH:MM:SS" or "HH:MM" - defaults to "17:00"
  deliveryDays?: number;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showDisclaimer?: boolean;
}

// Calculate working days (excluding Sundays)
const addWorkingDays = (startDate: Date, days: number): Date => {
  const result = new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Skip Sundays (0 = Sunday)
    if (result.getDay() !== 0) {
      addedDays++;
    }
  }
  
  return result;
};

const DeliveryCountdown = ({ 
  cutoffTime = "17:00", 
  deliveryDays = 7,
  className = '',
  variant = 'full',
  showDisclaimer = true
}: DeliveryCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isPastCutoff, setIsPastCutoff] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = cutoffTime.split(':').map(Number);
      
      const cutoffDate = new Date();
      cutoffDate.setHours(hours, minutes, 0, 0);

      // If cutoff time has passed, show next day countdown
      if (now > cutoffDate) {
        setIsPastCutoff(true);
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

    const calculateDeliveryDate = () => {
      const now = new Date();
      const [hours, minutes] = cutoffTime.split(':').map(Number);
      const cutoffDate = new Date();
      cutoffDate.setHours(hours, minutes, 0, 0);

      // Start date is tomorrow if past cutoff, else today
      const startDate = now > cutoffDate 
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000) 
        : now;
      
      const deliveryDate = addWorkingDays(startDate, deliveryDays);
      
      return deliveryDate.toLocaleDateString('en-IN', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    };

    setTimeLeft(calculateTimeLeft());
    setEstimatedDeliveryDate(calculateDeliveryDate());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setEstimatedDeliveryDate(calculateDeliveryDate());
    }, 1000);

    return () => clearInterval(interval);
  }, [cutoffTime, deliveryDays]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Minimal variant - just the date
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Calendar className="h-4 w-4 text-primary" />
        <span>
          Est. Delivery: <strong>{estimatedDeliveryDate}</strong>
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-primary/5 border border-primary/20 rounded-lg p-3 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm">
              Order in{' '}
              <span className="font-mono font-bold text-primary">
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </span>
              {' '}for {isPastCutoff ? "tomorrow's" : "today's"} batch
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              📅 Expected by: <strong className="text-green-700">{estimatedDeliveryDate}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">
            {isPastCutoff ? 'Order now for tomorrow\'s processing batch' : '⏳ Order within'}
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
            ? `to include in tomorrow's processing batch`
            : `to include in today's processing batch`
          }
        </p>
      </div>

      {/* Delivery Date Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              🚚 Estimated Delivery: 5–7 working days
            </p>
            <p className="text-sm text-green-700 mt-1">
              📅 Expected by: <strong>{estimatedDeliveryDate}</strong>
            </p>
            {showDisclaimer && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Delivery may take slightly longer in rare cases
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
          <Truck className="h-3 w-3" />
          {deliveryDays}-Day Delivery
        </Badge>
      </div>
    </div>
  );
};

// Helper function to calculate delivery date for order creation
export const calculateEstimatedDeliveryDate = (cutoffTime: string = "17:00", deliveryDays: number = 7): string => {
  const now = new Date();
  const [hours, minutes] = cutoffTime.split(':').map(Number);
  const cutoffDate = new Date();
  cutoffDate.setHours(hours, minutes, 0, 0);

  const startDate = now > cutoffDate 
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000) 
    : now;
  
  const deliveryDate = addWorkingDays(startDate, deliveryDays);
  
  return deliveryDate.toISOString().split('T')[0];
};

export default DeliveryCountdown;
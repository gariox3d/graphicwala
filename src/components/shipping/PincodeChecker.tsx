import { useState } from 'react';
import { Truck, Loader2, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useShippingRate, formatDeliveryDate } from '@/hooks/useShippingRate';

interface PincodeCheckerProps {
  weight?: number;
  className?: string;
  defaultPincode?: string;
  length?: number;
  breadth?: number;
  height?: number;
}

const PincodeChecker = ({ weight = 0.5, className = '', defaultPincode = '', length, breadth, height }: PincodeCheckerProps) => {
  const [pincode, setPincode] = useState(defaultPincode);
  const { rate, loading, check } = useShippingRate(undefined, weight, false, { length, breadth, height });

  return (
    <div className={`rounded-lg border border-border p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Truck className="h-4 w-4 text-primary" />
        Check delivery time & charge
      </div>

      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => { if (e.key === 'Enter') check(pincode); }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pincode.length !== 6 || loading}
          onClick={() => check(pincode)}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
        </Button>
      </div>

      {rate?.serviceable && (
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Delivery available to {pincode}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Expected by <strong>{formatDeliveryDate(rate.estimated_days || 6)}</strong>
            <span className="text-muted-foreground">({rate.estimated_days} days)</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Shipped via {rate.courier_name} • Shipping ₹{Math.ceil(rate.rate || 0)}
          </p>
        </div>
      )}

      {rate && !rate.serviceable && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          {rate.error}
        </p>
      )}
    </div>
  );
};

export default PincodeChecker;

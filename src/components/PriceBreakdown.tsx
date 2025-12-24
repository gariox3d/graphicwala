import { Separator } from '@/components/ui/separator';
import { Truck, Package } from 'lucide-react';

interface PriceBreakdownProps {
  productTotal: number;
  deliveryCharge: number;
  deliveryMethod?: 'home_delivery' | 'store_pickup';
  className?: string;
  showDetails?: boolean;
}

const PriceBreakdown = ({ 
  productTotal, 
  deliveryCharge, 
  deliveryMethod = 'home_delivery',
  className = '',
  showDetails = true
}: PriceBreakdownProps) => {
  const isPickup = deliveryMethod === 'store_pickup';
  const finalDeliveryCharge = isPickup ? 0 : deliveryCharge;
  const total = productTotal + finalDeliveryCharge;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          Product Total
        </span>
        <span>₹{productTotal.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Delivery Charge
          {isPickup && <span className="text-xs text-green-600">(Pickup)</span>}
        </span>
        {isPickup ? (
          <span className="text-green-600">Free</span>
        ) : finalDeliveryCharge > 0 ? (
          <span>₹{finalDeliveryCharge.toLocaleString()}</span>
        ) : (
          <span className="text-green-600">Free</span>
        )}
      </div>
      
      <Separator />
      
      <div className="flex justify-between font-semibold text-lg">
        <span>Total Payable</span>
        <span className="text-primary">₹{total.toLocaleString()}</span>
      </div>

      {showDetails && (
        <p className="text-xs text-muted-foreground text-center">
          💳 Cash on Delivery is not available. All orders must be prepaid.
        </p>
      )}
    </div>
  );
};

export default PriceBreakdown;

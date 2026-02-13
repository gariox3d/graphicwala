import { Separator } from '@/components/ui/separator';
import { Truck, Package, Ticket, Percent } from 'lucide-react';

interface PriceBreakdownProps {
  productTotal: number;
  deliveryCharge: number;
  deliveryMethod?: 'home_delivery' | 'store_pickup';
  className?: string;
  showDetails?: boolean;
  couponDiscount?: number;
  couponCode?: string;
  bulkDiscount?: number;
}

const PriceBreakdown = ({ 
  productTotal, 
  deliveryCharge, 
  deliveryMethod = 'home_delivery',
  className = '',
  showDetails = true,
  couponDiscount = 0,
  couponCode,
  bulkDiscount = 0,
}: PriceBreakdownProps) => {
  const isPickup = deliveryMethod === 'store_pickup';
  const finalDeliveryCharge = isPickup ? 0 : deliveryCharge;
  const total = productTotal + finalDeliveryCharge - couponDiscount - bulkDiscount;

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

      {bulkDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-green-600 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Bulk Discount
          </span>
          <span className="text-green-600">-₹{bulkDiscount.toLocaleString()}</span>
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-green-600 flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Coupon {couponCode && <span className="font-mono text-xs">({couponCode})</span>}
          </span>
          <span className="text-green-600">-₹{couponDiscount.toLocaleString()}</span>
        </div>
      )}
      
      <Separator />
      
      <div className="flex justify-between font-semibold text-lg">
        <span>Total Payable</span>
        <span className="text-primary">₹{Math.max(0, total).toLocaleString()}</span>
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

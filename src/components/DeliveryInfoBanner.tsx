import { Truck, Store, CreditCard, Package } from 'lucide-react';

interface DeliveryInfoBannerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const DeliveryInfoBanner = ({ variant = 'full', className = '' }: DeliveryInfoBannerProps) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg ${className}`}>
        <Package className="h-4 w-4 text-primary" />
        <span>7-Day Delivery • All orders prepaid only</span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary/5 to-orange-500/5 border border-primary/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <Truck className="h-6 w-6 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold text-lg">7-Day Delivery</h3>
          <p className="text-sm text-muted-foreground">
            All orders are delivered within 7 days from order confirmation
          </p>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
          <Store className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-sm">Store Pickup Available</p>
            <p className="text-xs text-muted-foreground">Free pickup from store</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-sm">Prepaid Only</p>
            <p className="text-xs text-muted-foreground">Secure online payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfoBanner;

import { Truck, Store, CreditCard } from 'lucide-react';

interface DeliveryInfoBannerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const DeliveryInfoBanner = ({ variant = 'full', className = '' }: DeliveryInfoBannerProps) => {
  if (variant === 'compact') {
    return (
      <div className={`bg-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Online Delivery Service</p>
            <p className="text-muted-foreground">
              All products are custom-made and delivered to your address. Store pickup available at checkout.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary/10 to-secondary border border-primary/20 rounded-xl p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-primary" />
            Delivery-Based Printing Service
          </h3>
          <p className="text-muted-foreground">
            All products are custom-made and delivered to your address. 
            This is an online delivery-based service. Store pickup is available only if selected during checkout.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-sm bg-background/80 rounded-lg px-3 py-2">
            <Store className="h-4 w-4 text-primary" />
            <span>Pickup Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-background/80 rounded-lg px-3 py-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>Prepaid Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfoBanner;

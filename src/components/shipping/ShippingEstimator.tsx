import { Truck, Package, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useAuth } from '@/contexts/AuthContext';

interface ShippingEstimatorProps {
  productWeight?: number;
  quantity: number;
  onShippingCalculated?: (charge: number, estimatedDays: number, deliveryDate: string) => void;
  className?: string;
}

const ShippingEstimator = ({
  quantity,
  onShippingCalculated,
  className = ''
}: ShippingEstimatorProps) => {
  const { profile } = useAuth();
  const { settings, loading } = useStoreSettings();

  // Calculate delivery date (5-7 days from now)
  const calculateDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Use 7 days as default
    return date.toISOString().split('T')[0];
  };

  // Notify parent of shipping info when settings load
  if (settings && onShippingCalculated) {
    const charge = settings.default_delivery_charge || 0;
    onShippingCalculated(charge, 7, calculateDeliveryDate());
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Loading delivery info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deliveryTimeText = settings?.delivery_time_text || '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.';
  const showDisclaimer = settings?.delivery_disclaimer_enabled ?? true;

  // Split the delivery text to show first line prominently
  const lines = deliveryTimeText.split('\n').filter(line => line.trim());
  const mainDeliveryText = lines[0] || '🚚 Estimated Delivery: 5–7 working days';
  const disclaimerLines = lines.slice(1);

  const userPincode = profile?.pincode;

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardContent className="pt-6 space-y-4">
        {/* Pincode confirmation if user has one */}
        {userPincode && userPincode.length === 6 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              ✅ Delivery available to {userPincode}
            </span>
          </div>
        )}

        {/* Main delivery info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Truck className="h-5 w-5" />
            <span className="font-semibold">{mainDeliveryText}</span>
          </div>

          {/* Delivery charge info */}
          {settings?.default_delivery_charge !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>
                Shipping: {settings.default_delivery_charge > 0 
                  ? `₹${settings.default_delivery_charge}` 
                  : 'Free'}
              </span>
            </div>
          )}

          {/* Disclaimer text */}
          {showDisclaimer && disclaimerLines.length > 0 && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-green-500/20">
              {disclaimerLines.map((line, idx) => (
                <p key={idx} className="mt-1">{line}</p>
              ))}
            </div>
          )}

          <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
            <Truck className="h-3 w-3 mr-1" />
            Home Delivery Available
          </Badge>
        </div>

        {/* No pincode prompt */}
        {(!userPincode || userPincode.length < 6) && (
          <p className="text-xs text-muted-foreground">
            Add your address in your profile to see delivery confirmation
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingEstimator;

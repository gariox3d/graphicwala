import { Truck, Package, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface DeliveryEstimateProps {
  pincode?: string;
  showPincodeConfirmation?: boolean;
  className?: string;
}

const DeliveryEstimate = ({
  pincode,
  showPincodeConfirmation = true,
  className = ''
}: DeliveryEstimateProps) => {
  const { settings, loading } = useStoreSettings();

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

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardContent className="pt-6 space-y-4">
        {/* Pincode confirmation if provided */}
        {showPincodeConfirmation && pincode && pincode.length === 6 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              ✅ Delivery available to {pincode}
            </span>
          </div>
        )}

        {/* Main delivery info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Truck className="h-5 w-5" />
            <span className="font-semibold">{mainDeliveryText}</span>
          </div>

          {/* Delivery charge shown at product level */}

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
        {showPincodeConfirmation && (!pincode || pincode.length < 6) && (
          <p className="text-xs text-muted-foreground">
            Enter your pincode to confirm delivery availability
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryEstimate;

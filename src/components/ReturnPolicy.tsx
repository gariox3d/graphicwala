import { Shield, MessageCircle, Video, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { WHATSAPP_NUMBER } from '@/lib/types';

interface ReturnPolicyProps {
  orderId?: string;
  variant?: 'full' | 'compact' | 'email';
  className?: string;
}

const ReturnPolicy = ({ orderId, variant = 'full', className = '' }: ReturnPolicyProps) => {
  const { settings } = useStoreSettings();
  
  // Check if return policy is enabled (default true if not set)
  const isEnabled = settings?.return_policy_enabled !== false;
  const returnWindowHours = settings?.return_window_hours ?? 48;
  const whatsappNumber = settings?.whatsapp_support_number || WHATSAPP_NUMBER;

  if (!isEnabled) return null;

  const whatsappMessage = orderId
    ? `Hello Graphic Wala, I received a damaged product.

Order ID: ${orderId}

I am sharing the video as requested.`
    : `Hello Graphic Wala, I received a damaged product.

I am sharing the video as requested.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-muted/50 rounded-lg border ${className}`}>
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Damaged Product?</p>
            <p className="text-muted-foreground text-xs mt-1">
              Contact us on WhatsApp within {returnWindowHours} hours with video proof.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                🔁 Damaged or Wrong Product?
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                If your product arrives damaged or defective, please contact us on WhatsApp within {returnWindowHours} hours.
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Video className="h-4 w-4" />
                📹 Send a clear unedited video showing:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  The damaged product
                </li>
                <li className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Outer packaging
                </li>
                <li className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Order ID
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Our team will verify and assist you with replacement or resolution.
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Report Issue on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReturnPolicy;
import { Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { PHONE_NUMBER, WHATSAPP_NUMBER } from '@/lib/types';
import WhatsAppButton from './WhatsAppButton';
import CallButton from './CallButton';

interface SupportContactProps {
  variant?: 'full' | 'compact' | 'inline';
  message?: string;
  className?: string;
}

const SupportContact = ({ variant = 'full', message, className = '' }: SupportContactProps) => {
  const defaultMessage = message || "Hi, I need help with my order.";

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Need help?</span>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(defaultMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline font-medium"
        >
          WhatsApp
        </a>
        <span className="text-muted-foreground">or</span>
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="text-primary hover:underline font-medium"
        >
          Call {PHONE_NUMBER}
        </a>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <WhatsAppButton
          message={defaultMessage}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white"
        />
        <CallButton size="sm" variant="outline" />
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl p-5 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            If you face any issue related to your order or customization, 
            you can call or WhatsApp us for support.
          </p>
          <p className="text-sm font-medium mt-2">
            Contact: {PHONE_NUMBER}
          </p>
        </div>
        <div className="flex gap-3">
          <WhatsAppButton
            message={defaultMessage}
            className="bg-green-500 hover:bg-green-600 text-white"
          />
          <CallButton variant="outline" />
        </div>
      </div>
    </div>
  );
};

export default SupportContact;

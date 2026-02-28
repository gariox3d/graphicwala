import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  message?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'floating';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

const WhatsAppButton = ({
  message = `Hello ${BUSINESS_NAME}, I need help with my order.`,
  variant = 'default',
  size = 'default',
  className = '',
  showText = true,
}: WhatsAppButtonProps) => {
  const whatsappUrl = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105",
          className
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {showText && <span className="font-medium hidden sm:inline">Chat on WhatsApp</span>}
      </a>
    );
  }

  return (
    <Button
      asChild
      variant={variant === 'default' ? 'default' : variant}
      size={size}
      className={cn("bg-green-500 hover:bg-green-600 text-white", className)}
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        {showText && <span className="ml-2">WhatsApp</span>}
      </a>
    </Button>
  );
};

export default WhatsAppButton;


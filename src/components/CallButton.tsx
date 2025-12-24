import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PHONE_NUMBER } from '@/lib/types';

interface CallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

const CallButton = ({
  variant = 'outline',
  size = 'default',
  className = '',
  showText = true,
}: CallButtonProps) => {
  const phoneUrl = `tel:${PHONE_NUMBER}`;

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <a href={phoneUrl}>
        <Phone className="h-4 w-4" />
        {showText && <span className="ml-2">Call Us</span>}
      </a>
    </Button>
  );
};

export default CallButton;

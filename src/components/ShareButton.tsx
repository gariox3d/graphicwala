import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useState } from 'react';

interface ShareButtonProps {
  productId: string;
  productName: string;
  variant?: 'default' | 'icon';
}

const SITE_URL = 'https://store.graphicwala.com';

const ShareButton = ({ productId, productName, variant = 'default' }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  // Use share URL that goes through the edge function for proper OG meta
  const shareUrl = `${SITE_URL}/share/product/${productId}`;
  const directUrl = `${SITE_URL}/product/${productId}`;
  const shareText = `Check out ${productName} on Graphic Wala Store!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied! Share it on WhatsApp for best preview.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={shareNative}
        title="Share this product"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <span className="mr-2">📱</span>
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook}>
          <span className="mr-2">📘</span>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;

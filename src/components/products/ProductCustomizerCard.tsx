import { useEffect, useState } from 'react';
import { MessageCircle, PenLine, Sparkles } from 'lucide-react';
import DesignUpload from '@/components/DesignUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadField, BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

interface ProductCustomizerCardProps {
  productId: string;
  productName: string;
  uploadConfig: UploadField[];
  designUrls: Record<string, string>;
  onUploadComplete: (urls: Record<string, string>) => void;
}

const ProductCustomizerCard = ({
  productId,
  productName,
  uploadConfig,
  designUrls,
  onUploadComplete,
}: ProductCustomizerCardProps) => {
  const storageKey = `productCustomText:${productId}`;
  const [customText, setCustomText] = useState(() => sessionStorage.getItem(storageKey) || '');

  useEffect(() => {
    if (customText.trim()) sessionStorage.setItem(storageKey, customText);
    else sessionStorage.removeItem(storageKey);
  }, [customText, storageKey]);

  const uploadedCount = Object.keys(designUrls).length;
  const message = [
    `Hello ${BUSINESS_NAME}, I want to order a customized ${productName}.`,
    customText.trim() ? `Custom text: ${customText.trim()}` : '',
    uploadedCount ? `${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded on the product page.` : '',
    'Please help me complete this order.',
  ].filter(Boolean).join('\n');
  const whatsappUrl = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;

  return (
    <Card className="overflow-hidden border-primary/25 shadow-brand">
      <CardHeader className="border-b border-border bg-secondary/60 pb-5">
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Make it uniquely yours</CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Add your photo and wording. We will check the design before printing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <DesignUpload
          productId={productId}
          productName={productName}
          uploadConfig={uploadConfig}
          onUploadComplete={onUploadComplete}
          existingDesigns={designUrls}
          embedded
        />

        <div className="space-y-2">
          <Label htmlFor={`custom-text-${productId}`} className="flex items-center gap-2 font-semibold">
            <PenLine className="h-4 w-4 text-primary" aria-hidden="true" />
            Custom text
          </Label>
          <Textarea
            id={`custom-text-${productId}`}
            value={customText}
            onChange={(event) => setCustomText(event.target.value.slice(0, 160))}
            placeholder="Enter a name, date, short message, or printing instructions"
            rows={3}
            className="resize-none bg-background"
          />
          <p className="text-right text-xs text-muted-foreground">{customText.length}/160</p>
        </div>

        <Button asChild size="lg" className="w-full gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Order customization on WhatsApp
          </a>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Your uploaded photo stays linked to your signed-in account.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductCustomizerCard;
import { useState, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadField {
  id: string;
  label: string;
  required: boolean;
}

interface DesignUploadProps {
  productId: string;
  productName: string;
  uploadConfig: UploadField[];
  onUploadComplete: (designUrls: Record<string, string>) => void;
  existingDesigns?: Record<string, string>;
  isCartMode?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const DesignUpload = ({
  productId,
  productName,
  uploadConfig,
  onUploadComplete,
  existingDesigns = {},
  isCartMode = false,
}: DesignUploadProps) => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>(existingDesigns);

  useEffect(() => {
    setUploadedUrls(existingDesigns);
    const newPreviews: Record<string, string> = {};
    Object.entries(existingDesigns).forEach(([key, url]) => {
      if (url && !url.endsWith('.pdf')) {
        newPreviews[key] = url;
      }
    });
    setPreviews(newPreviews);
  }, [existingDesigns]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Please upload JPG, PNG, or PDF files only';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 10MB';
    return null;
  };

  const handleUpload = async (fieldId: string, file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }

    setUploading((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${productId}/${fieldId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('customer-designs')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('customer-designs').getPublicUrl(fileName);
      const newUrls = { ...uploadedUrls, [fieldId]: data.publicUrl };
      setUploadedUrls(newUrls);
      onUploadComplete(newUrls);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews((prev) => ({ ...prev, [fieldId]: reader.result as string }));
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => ({ ...prev, [fieldId]: 'pdf' }));
      }
      toast.success('Design uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Failed to upload. Please try again.');
    } finally {
      setUploading((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleRemove = async (fieldId: string) => {
    const url = uploadedUrls[fieldId];
    if (url) {
      try {
        const path = url.split('customer-designs/')[1];
        if (path) await supabase.storage.from('customer-designs').remove([path]);
      } catch (err) { console.error('Delete error:', err); }
    }
    const newUrls = { ...uploadedUrls };
    delete newUrls[fieldId];
    setUploadedUrls(newUrls);
    onUploadComplete(newUrls);
    const newPreviews = { ...previews };
    delete newPreviews[fieldId];
    setPreviews(newPreviews);
  };

  if (!uploadConfig || uploadConfig.length === 0) return null;

  const requiredFields = uploadConfig.filter(f => f.required);
  const allRequiredUploaded = requiredFields.every(f => uploadedUrls[f.id]);

  return (
    <Card className={isCartMode ? 'border-primary/30' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="h-5 w-5 text-primary" />
          {isCartMode ? `Upload Designs - ${productName}` : 'Customize Your Product'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isCartMode ? 'Complete uploads before checkout' : 'Upload now or add to cart and upload later'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadConfig.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {uploadedUrls[field.id] && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />Uploaded
                </span>
              )}
            </div>

            {uploadedUrls[field.id] ? (
              <div className="relative border rounded-lg overflow-hidden">
                {previews[field.id] === 'pdf' ? (
                  <div className="h-32 bg-muted flex items-center justify-center">PDF uploaded</div>
                ) : (
                  <img src={previews[field.id] || uploadedUrls[field.id]} alt={field.label} className="w-full h-32 object-contain bg-muted" />
                )}
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemove(field.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input type="file" id={`upload-${field.id}`} accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(field.id, file); }}
                  disabled={uploading[field.id]} />
                <label htmlFor={`upload-${field.id}`}
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${field.required && !uploadedUrls[field.id] ? 'border-destructive/50 bg-destructive/5' : 'border-muted-foreground/30 hover:border-primary/50'}
                  `}>
                  {uploading[field.id] ? (
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG, PDF (max 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        ))}

        {isCartMode && requiredFields.length > 0 && !allRequiredUploaded && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-destructive">Please upload all required designs before checkout</p>
          </div>
        )}

        {allRequiredUploaded && requiredFields.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700">
            <Check className="h-4 w-4" />All required designs uploaded!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignUpload;

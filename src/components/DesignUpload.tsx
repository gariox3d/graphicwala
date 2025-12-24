import { useState, useRef } from 'react';
import { Upload, X, Image, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DesignUploadProps {
  productId: string;
  productName: string;
  frontRequired?: boolean;
  backEnabled?: boolean;
  onUploadComplete: (frontUrl: string | null, backUrl: string | null) => void;
  existingFrontUrl?: string | null;
  existingBackUrl?: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const DesignUpload = ({
  productId,
  productName,
  frontRequired = true,
  backEnabled = false,
  onUploadComplete,
  existingFrontUrl,
  existingBackUrl,
}: DesignUploadProps) => {
  const { user } = useAuth();
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(existingFrontUrl || null);
  const [backPreview, setBackPreview] = useState<string | null>(existingBackUrl || null);
  const [uploading, setUploading] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or PDF.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File, side: 'front' | 'back') => {
    if (!validateFile(file)) return;

    if (side === 'front') {
      setFrontFile(file);
      if (file.type.startsWith('image/')) {
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setFrontPreview('pdf');
      }
    } else {
      setBackFile(file);
      if (file.type.startsWith('image/')) {
        setBackPreview(URL.createObjectURL(file));
      } else {
        setBackPreview('pdf');
      }
    }
  };

  const clearFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontFile(null);
      setFrontPreview(existingFrontUrl || null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackFile(null);
      setBackPreview(existingBackUrl || null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const uploadFiles = async (): Promise<{ frontUrl: string | null; backUrl: string | null }> => {
    if (!user) {
      toast.error('Please login to upload designs');
      throw new Error('Not authenticated');
    }

    setUploading(true);
    let frontUrl = existingFrontUrl || null;
    let backUrl = existingBackUrl || null;

    try {
      const timestamp = Date.now();

      if (frontFile) {
        const frontPath = `${user.id}/${productId}/${timestamp}_front_${frontFile.name}`;
        const { error: frontError } = await supabase.storage
          .from('customer-designs')
          .upload(frontPath, frontFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (frontError) {
          console.error('Front upload error:', frontError);
          throw new Error('Failed to upload front design');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('customer-designs')
          .getPublicUrl(frontPath);
        frontUrl = publicUrl;
      }

      if (backFile && backEnabled) {
        const backPath = `${user.id}/${productId}/${timestamp}_back_${backFile.name}`;
        const { error: backError } = await supabase.storage
          .from('customer-designs')
          .upload(backPath, backFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (backError) {
          console.error('Back upload error:', backError);
          throw new Error('Failed to upload back design');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('customer-designs')
          .getPublicUrl(backPath);
        backUrl = publicUrl;
      }

      onUploadComplete(frontUrl, backUrl);
      toast.success('Designs uploaded successfully!');
      return { frontUrl, backUrl };
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const isValid = () => {
    if (frontRequired && !frontFile && !existingFrontUrl) return false;
    return true;
  };

  const renderPreview = (preview: string | null, side: 'front' | 'back') => {
    if (!preview) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Upload className="h-8 w-8 mb-2" />
          <span className="text-sm">Click to upload {side} design</span>
          <span className="text-xs mt-1">JPG, PNG, PDF (max 10MB)</span>
        </div>
      );
    }

    if (preview === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText className="h-12 w-12 text-primary mb-2" />
          <span className="text-sm font-medium">PDF Uploaded</span>
        </div>
      );
    }

    return (
      <img
        src={preview}
        alt={`${side} design preview`}
        className="w-full h-full object-contain"
      />
    );
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="h-5 w-5 text-primary" />
          Customize Your Product
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your design for <strong>{productName}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Upload Tips:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use high-resolution images for best print quality</li>
              <li>Accepted formats: JPG, PNG, PDF</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Front Design Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Front Design {frontRequired && <span className="text-destructive">*</span>}
            </Label>
            <div
              className="relative aspect-[3/2] border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors bg-background"
              onClick={() => frontInputRef.current?.click()}
            >
              {renderPreview(frontPreview, 'front')}
              {(frontFile || (frontPreview && frontPreview !== existingFrontUrl)) && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile('front');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={frontInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file, 'front');
              }}
            />
          </div>

          {/* Back Design Upload (if enabled) */}
          {backEnabled && (
            <div className="space-y-2">
              <Label>Back Design (Optional)</Label>
              <div
                className="relative aspect-[3/2] border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors bg-background"
                onClick={() => backInputRef.current?.click()}
              >
                {renderPreview(backPreview, 'back')}
                {(backFile || (backPreview && backPreview !== existingBackUrl)) && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile('back');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={backInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'back');
                }}
              />
            </div>
          )}
        </div>

        {(frontFile || backFile) && (
          <Button
            onClick={uploadFiles}
            disabled={!isValid() || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Designs
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignUpload;

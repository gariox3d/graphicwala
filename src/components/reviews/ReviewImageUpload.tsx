import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewImageUploadProps {
  userId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ReviewImageUpload = ({ userId, images, onImagesChange, maxImages = 3 }: ReviewImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Compress image (max 800px, quality 0.7)
        const compressed = await compressImage(file);
        
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, compressed, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      onImagesChange([...images, ...uploadedUrls]);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Photos (Optional, max {maxImages})
      </label>
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Compressing...</>
            ) : (
              <><ImagePlus className="h-4 w-4 mr-1" /> Add Photos</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Images auto-compressed for fast loading
          </p>
        </>
      )}
    </div>
  );
};

export default ReviewImageUpload;

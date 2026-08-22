import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ACCEPT_ATTR,
  formatBytes,
  prepareImageForUpload,
  sanitizeFileName,
  validateImageFile,
} from '@/lib/imageOptimizer';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadReport {
  name: string;
  dimensions: string;
  size: string;
  format: string;
  outFormat: string;
  outSize: string;
}

const MultiImageUpload = ({ images, onChange, maxImages = 10 }: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<UploadReport[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (original: File): Promise<string | null> => {
    // 1. Validate (real content sniffing, size, dimensions)
    const check = await validateImageFile(original);
    if (!check.ok || !check.meta) {
      toast.error(`${original.name}: ${check.error}`);
      return null;
    }
    if (check.warning) toast.warning(`${original.name}: ${check.warning}`);

    try {
      // 2. Single-pass optimization, full resolution preserved (max 2560px)
      const prepared = await prepareImageForUpload(original, check.meta);

      setReports((prev) => [
        ...prev,
        {
          name: check.meta!.name,
          dimensions: `${check.meta!.width} × ${check.meta!.height} px`,
          size: formatBytes(check.meta!.size),
          format: check.meta!.type.replace('image/', '').toUpperCase(),
          outFormat: prepared.output.type.replace('image/', '').toUpperCase(),
          outSize: formatBytes(prepared.output.size),
        },
      ]);

      const ext = prepared.file.type === 'image/webp' ? 'webp' : sanitizeFileName(prepared.file.name).split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, prepared.file, {
          cacheControl: '31536000',
          contentType: prepared.file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${original.name}`);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s)`);
      return;
    }

    setUploading(true);
    setReports([]);
    const newUrls: string[] = [];

    for (const file of files) {
      const url = await uploadImage(file);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Try to extract path and delete from storage
    if (imageUrl.includes('product-images')) {
      const pathMatch = imageUrl.match(/product-images\/(.+)$/);
      if (pathMatch) {
        try {
          await supabase.storage.from('product-images').remove([pathMatch[1]]);
        } catch (error) {
          console.error('Failed to delete image from storage:', error);
        }
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };


  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [removed] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, removed);
      onChange(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload requirements */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="h-3.5 w-3.5" /> Image Upload Requirements
        </p>
        <p>Supported file types: JPG / JPEG / PNG / WEBP • Maximum file size: 10MB</p>
        <p>Minimum width 1200px • Recommended 1600–2000px for banners/hero • Keep the original aspect ratio</p>
        <p>For best quality, upload the original high-resolution image. The website will automatically optimize it for fast loading.</p>
        <p>JPG/JPEG: best for photos • PNG: best for transparent images/graphics • WEBP: best for modern web images</p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && draggedIndex !== index && "border-primary",
                index === 0 ? "border-primary ring-2 ring-primary/20" : "border-border"
              )}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <GripVertical className="h-5 w-5 text-white" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            uploading 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Click to upload images</p>
                <p className="text-sm text-muted-foreground">
                  {images.length}/{maxImages} images • JPG / PNG / WEBP • Max 10MB each
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optimization report */}
      {reports.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-xs space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="flex flex-wrap gap-x-4 gap-y-0.5">
              <span className="font-medium text-foreground">{r.name}</span>
              <span className="text-muted-foreground">Dimensions: {r.dimensions}</span>
              <span className="text-muted-foreground">Size: {r.size}</span>
              <span className="text-muted-foreground">Format: {r.format}</span>
              <span className="text-primary font-medium">Optimized: {r.outFormat} {r.outSize}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        💡 Drag images to reorder. First image is the primary thumbnail shown in listings.
      </p>
    </div>
  );
};

export default MultiImageUpload;

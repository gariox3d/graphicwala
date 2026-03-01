import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Filter out empty URLs and ensure we have valid images
  const validImages = images.filter(url => url && url.trim() !== '');
  

  const handleImageChange = (index: number) => {
    if (index === selectedIndex || isTransitioning) return;
    setIsTransitioning(true);
    setSelectedIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (validImages.length <= 1) return;
    const newIndex = selectedIndex === 0 ? validImages.length - 1 : selectedIndex - 1;
    handleImageChange(newIndex);
  };

  const goToNext = () => {
    if (validImages.length <= 1) return;
    const newIndex = selectedIndex === validImages.length - 1 ? 0 : selectedIndex + 1;
    handleImageChange(newIndex);
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  useEffect(() => {
    if (selectedIndex > validImages.length - 1) {
      setSelectedIndex(0);
    }
  }, [selectedIndex, validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (validImages.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, validImages.length]);

  // If no images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-6xl font-bold text-muted-foreground/30">
          {productName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full h-full bg-white flex items-center justify-center">
          <img
            src={validImages[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              isTransitioning ? "opacity-70" : "opacity-100"
            )}
            loading="lazy"
          />
        </div>
        
        {/* Navigation arrows (only show if more than 1 image) */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Image counter */}
            <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip (only show if more than 1 image) */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((url, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                selectedIndex === index 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-transparent hover:border-muted-foreground/30"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <div className="w-full h-full bg-white flex items-center justify-center">
                <img
                  src={url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

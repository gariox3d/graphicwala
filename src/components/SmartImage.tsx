import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { imageSrcSet, optimizedImage, canTransform, CARD_WIDTHS } from '@/lib/imageUrl';

type BaseProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'>;

interface SmartImageProps extends BaseProps {
  src: string | null | undefined;
  alt: string;
  /** Candidate widths offered to the browser via srcset. */
  widths?: number[];
  /** Width requested for the plain `src` fallback. */
  fallbackWidth?: number;
  quality?: number;
  resize?: 'contain' | 'cover';
  /** Critical above-the-fold image: eager + high fetch priority. */
  priority?: boolean;
}

/**
 * Responsive, CDN-optimized <img>.
 *
 * - Serves AVIF/WebP at the size the layout actually needs (srcset + sizes)
 * - Lazy by default; only explicit `priority` images load eagerly
 * - Lightweight skeleton tint while loading (no extra bytes, no layout shift)
 * - Falls back to the original file once, then to a static placeholder —
 *   never retries in a loop
 */
const SmartImage = ({
  src,
  alt,
  widths = CARD_WIDTHS,
  fallbackWidth,
  quality = 92,
  resize = 'contain',
  priority = false,
  sizes,
  className,
  style,
  ...rest
}: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);
  // 0 = optimized, 1 = original file, 2 = static placeholder
  const [stage, setStage] = useState(0);

  // Account for high-DPR screens on the non-srcset fallback so the bitmap is
  // never upscaled by the browser. A 1.5x floor keeps standard desktop
  // monitors (dpr = 1) crisp instead of pixel-exact and soft.
  const dpr =
    typeof window !== 'undefined'
      ? Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2.5)
      : 1.5;
  const baseWidth = fallbackWidth ?? widths[widths.length - 1];
  const requestWidth = Math.min(Math.round(baseWidth * dpr), widths[widths.length - 1] * 2);
  const optimized = optimizedImage(src, { width: requestWidth, quality, resize });

  let finalSrc = optimized;
  let finalSrcSet = imageSrcSet(src, widths, { quality, resize });
  if (stage === 1) {
    finalSrc = src || '';
    finalSrcSet = undefined;
  } else if (stage === 2) {
    finalSrc = '/placeholder.svg';
    finalSrcSet = undefined;
  }

  return (
    <img
      {...rest}
      src={finalSrc}
      srcSet={finalSrcSet}
      sizes={finalSrcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={{
        backgroundColor: loaded ? undefined : 'hsl(var(--muted))',
        ...style,
      }}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setStage((current) => {
          if (current === 0 && canTransform(src || '')) return 1;
          return current >= 1 ? 2 : 2;
        });
      }}
    />
  );
};

export default SmartImage;

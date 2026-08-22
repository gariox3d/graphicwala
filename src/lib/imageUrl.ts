/**
 * Image delivery helpers.
 *
 * Product/banner images live in Supabase Storage, which exposes an on-the-fly
 * image transformation endpoint (`/storage/v1/render/image/public/...`).
 * It resizes, re-compresses and automatically negotiates AVIF/WebP based on the
 * browser's `Accept` header, and the result is CDN-cached — so a 300px product
 * card never has to download the 2000px original.
 */

const OBJECT_PATH = '/storage/v1/object/public/';
const RENDER_PATH = '/storage/v1/render/image/public/';

/** Widths we ever request. Keeping the list short maximises CDN cache hits. */
export const CARD_WIDTHS = [320, 480, 768, 1024];
export const DETAIL_WIDTHS = [480, 768, 1024, 1440, 1920];
export const THUMB_WIDTHS = [120, 240, 320];
export const BANNER_WIDTHS = [480, 768, 1024, 1440, 1920];

/**
 * Minimum encode quality. Anything lower starts showing visible artefacts on
 * photographs, which is what made uploaded images look "blurry".
 */
export const MIN_QUALITY = 80;

export interface ImageTransform {
  width: number;
  /** 20-100. Thumbnails can go lower, product detail stays high. */
  quality?: number;
  /** `contain` preserves the whole image (our product images are letterboxed). */
  resize?: 'contain' | 'cover';
}

const isTransformable = (url: string) =>
  typeof url === 'string' && url.includes(OBJECT_PATH) && !url.includes('/object/sign/');

/** Returns a resized + auto-format URL, or the original when not transformable. */
export const optimizedImage = (
  url: string | null | undefined,
  { width, quality = 72, resize = 'contain' }: ImageTransform,
): string => {
  if (!url) return '';
  if (!isTransformable(url)) return url;
  const base = url.split('?')[0].replace(OBJECT_PATH, RENDER_PATH);
  return `${base}?width=${Math.round(width)}&resize=${resize}&quality=${quality}`;
};

/** Builds a `srcset` string so the browser picks the right size per device. */
export const imageSrcSet = (
  url: string | null | undefined,
  widths: number[],
  { quality = 72, resize = 'contain' }: Omit<ImageTransform, 'width'> = {},
): string | undefined => {
  if (!url || !isTransformable(url)) return undefined;
  return widths
    .map((w) => `${optimizedImage(url, { width: w, quality, resize })} ${w}w`)
    .join(', ');
};

export const canTransform = isTransformable;

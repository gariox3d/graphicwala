/**
 * Admin image pipeline helpers.
 *
 * Goals:
 * - Never downgrade a good original: full resolution is preserved up to a
 *   sane web ceiling (2560px), no upscaling ever.
 * - One single re-encode (never multiple JPEG rounds) into WebP at high
 *   quality, so photos stay sharp while files stay small.
 * - Transparency-bearing PNGs are uploaded untouched (lossless).
 * - Real content sniffing (magic bytes), not just the file extension.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const MIN_RECOMMENDED_WIDTH = 1200;
/** Web ceiling: anything wider is downscaled (still very high-res). */
export const MASTER_MAX_WIDTH = 2560;
/** Single-pass WebP quality — sharp, professional, still compact. */
export const WEBP_QUALITY = 0.86;

export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPT_ATTR = 'image/jpeg,image/jpg,image/png,image/webp';

export interface ImageMeta {
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

export interface PreparedImage {
  file: File;
  original: ImageMeta;
  output: { size: number; type: string; width: number; height: number };
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/** Strips path separators/odd characters from a user-supplied file name. */
export const sanitizeFileName = (name: string) =>
  name
    .replace(/[/\\]/g, '-')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);

/** Reads the first bytes of the file to verify it really is an image. */
export const sniffMimeType = async (file: File): Promise<string | null> => {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const is = (...sig: number[]) => sig.every((b, i) => buf[i] === b);
  if (is(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (is(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (is(0x52, 0x49, 0x46, 0x46) && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50)
    return 'image/webp';
  return null;
};

export const readDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image could not be read'));
    };
    img.src = url;
  });

export interface ValidationResult {
  ok: boolean;
  error?: string;
  warning?: string;
  meta?: ImageMeta;
  mime?: string;
}

export const validateImageFile = async (
  file: File,
  { minWidth = MIN_RECOMMENDED_WIDTH }: { minWidth?: number } = {},
): Promise<ValidationResult> => {
  const mime = await sniffMimeType(file);
  if (!mime || !(ACCEPTED_MIME as readonly string[]).includes(mime)) {
    return { ok: false, error: 'Invalid file type. Please upload JPG, PNG, or WEBP.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `File too large (${formatBytes(file.size)}). Maximum allowed size is 10MB.` };
  }

  let dims: { width: number; height: number };
  try {
    dims = await readDimensions(file);
  } catch {
    return { ok: false, error: 'This file is not a readable image.' };
  }

  const meta: ImageMeta = { name: file.name, width: dims.width, height: dims.height, size: file.size, type: mime };

  if (dims.width < 600) {
    return { ok: false, error: 'Image resolution is too low. Please upload a higher-resolution image.', meta, mime };
  }

  return {
    ok: true,
    meta,
    mime,
    warning:
      dims.width < minWidth
        ? `Low resolution (${dims.width}px wide). Recommended minimum is ${minWidth}px for a sharp result.`
        : undefined,
  };
};

const hasAlpha = async (file: File) => {
  if (!file.type.includes('png')) return false;
  try {
    const { width, height } = await readDimensions(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const w = Math.min(width, 200);
    const h = Math.max(1, Math.round((height * w) / width));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
    return false;
  } catch {
    return true; // when unsure, keep PNG lossless
  }
};

/**
 * Produces the file we actually upload:
 * - PNG with transparency  -> untouched (lossless master)
 * - already-small WebP     -> untouched (no double compression)
 * - everything else        -> single-pass WebP at full (capped) resolution
 */
export const prepareImageForUpload = async (file: File, meta: ImageMeta): Promise<PreparedImage> => {
  const keep = (): PreparedImage => ({
    file,
    original: meta,
    output: { size: file.size, type: meta.type, width: meta.width, height: meta.height },
  });

  if (meta.type === 'image/png' && (await hasAlpha(file))) return keep();
  if (meta.type === 'image/webp' && meta.width <= MASTER_MAX_WIDTH && file.size <= 900 * 1024) return keep();

  const scale = meta.width > MASTER_MAX_WIDTH ? MASTER_MAX_WIDTH / meta.width : 1; // never upscale
  const width = Math.round(meta.width * scale);
  const height = Math.round(meta.height * scale);

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('decode failed'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return keep();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/webp', WEBP_QUALITY));
    if (!blob || blob.size === 0) return keep();
    // If WebP somehow ends up bigger, keep the original bytes.
    if (blob.size >= file.size && scale === 1) return keep();

    const base = sanitizeFileName(file.name).replace(/\.\w+$/, '');
    const out = new File([blob], `${base}.webp`, { type: 'image/webp', lastModified: Date.now() });
    return { file: out, original: meta, output: { size: out.size, type: 'image/webp', width, height } };
  } catch {
    return keep();
  } finally {
    URL.revokeObjectURL(url);
  }
};

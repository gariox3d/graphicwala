import { supabase } from '@/integrations/supabase/client';

export const AVATAR_BUCKET = 'avatars';
export const MAX_AVATAR_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB before compression
const TARGET_BYTES = 150 * 1024; // ~150KB after compression
const MAX_DIMENSION = 512;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const supportsWebp = (() => {
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
})();

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return 'Only JPG, PNG or WebP images are allowed';
  }
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
    return 'Invalid file extension. Use .jpg, .png or .webp';
  }
  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    return 'Image is too large. Maximum size is 5MB';
  }
  return null;
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read this image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read this image'));
    reader.readAsDataURL(file);
  });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** Compress to square-ish 512px max, WebP when supported, target under 150KB. */
export async function compressAvatar(file: File): Promise<Blob> {
  const img = await loadImage(file);
  let { width, height } = img;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing not supported on this device');
  ctx.drawImage(img, 0, 0, width, height);

  const mime = supportsWebp ? 'image/webp' : 'image/jpeg';
  let quality = 0.85;
  let blob = await toBlob(canvas, mime, quality);
  while (blob && blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.15;
    blob = await toBlob(canvas, mime, quality);
  }
  if (!blob) throw new Error('Image compression failed');
  return blob;
}

/** Uploads a compressed avatar, replaces the old one and returns the storage path. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new Error(validationError);

  const blob = await compressAvatar(file);
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: true });
  if (error) throw error;

  await removeOldAvatarFiles(userId, path);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: path, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (profileError) throw profileError;

  return path;
}

async function removeOldAvatarFiles(userId: string, keepPath?: string) {
  const { data } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  const stale = (data || [])
    .map((f) => `${userId}/${f.name}`)
    .filter((p) => p !== keepPath);
  if (stale.length) {
    await supabase.storage.from(AVATAR_BUCKET).remove(stale);
    stale.forEach((p) => signedUrlCache.delete(p));
  }
}

export async function deleteAvatar(userId: string): Promise<void> {
  await removeOldAvatarFiles(userId);
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

/* ---------------- signed URL cache (fast repeat loads) ---------------- */

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const inflight = new Map<string, Promise<string | null>>();
const TTL_MS = 55 * 60 * 1000;

export function extractAvatarPath(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/avatars\/([^?#]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  if (/^https?:\/\//i.test(value)) return null;
  return value;
}

export async function getAvatarUrl(value?: string | null): Promise<string | null> {
  const path = extractAvatarPath(value);
  if (!path) return null;

  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const existing = inflight.get(path);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, 3600);
    inflight.delete(path);
    if (error || !data?.signedUrl) return null;
    signedUrlCache.set(path, { url: data.signedUrl, expiresAt: Date.now() + TTL_MS });
    return data.signedUrl;
  })();

  inflight.set(path, request);
  return request;
}
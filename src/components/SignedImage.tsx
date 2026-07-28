import { ImgHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  url: string;
  fallback?: ReactNode;
}

export function extractDesignPath(urlOrPath: string): string | null {
  const match = urlOrPath.match(/customer-designs\/([^?#]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  if (!/^https?:\/\//i.test(urlOrPath)) return urlOrPath.replace(/^customer-designs\//, '');
  return null;
}

export async function getSignedDesignUrl(urlOrPath: string, expiresIn = 3600) {
  const path = extractDesignPath(urlOrPath);
  if (!path) return null;
  const { data, error } = await supabase.storage.from('customer-designs').createSignedUrl(path, expiresIn);
  return error ? null : data?.signedUrl ?? null;
}

export function SignedImage({ url, fallback, ...props }: SignedImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setSignedUrl(null);
    setFailed(false);
    getSignedDesignUrl(url).then((result) => {
      if (!active) return;
      if (result) setSignedUrl(result);
      else setFailed(true);
    });
    return () => { active = false; };
  }, [url]);

  if (failed) return <>{fallback ?? null}</>;
  if (!signedUrl) return <div className={props.className} aria-label="Loading image" />;
  return <img {...props} src={signedUrl} />;
}

export async function openSignedDesign(urlOrPath: string) {
  const signedUrl = await getSignedDesignUrl(urlOrPath);
  if (signedUrl) window.open(signedUrl, '_blank', 'noopener,noreferrer');
}
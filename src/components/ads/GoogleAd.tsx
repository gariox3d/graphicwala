import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAdProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense unit. Uses auto-ads slot by default.
 * Skips rendering inside /admin and /checkout routes.
 */
const GoogleAd = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style,
}: GoogleAdProps) => {
  const location = useLocation();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  // Hide ads on admin and checkout flows
  const hide =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/order-confirmation') ||
    location.pathname.startsWith('/auth');

  useEffect(() => {
    if (hide || pushed.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      // ignore — script may not be loaded yet
    }
  }, [hide, location.pathname]);

  if (hide) return null;

  return (
    <div className={`w-full my-6 flex justify-center ${className}`} aria-label="Advertisement">
      <ins
        ref={adRef as any}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', ...style }}
        data-ad-client="ca-pub-9608758753279607"
        {...(slot ? { 'data-ad-slot': slot } : { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' })}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAd;
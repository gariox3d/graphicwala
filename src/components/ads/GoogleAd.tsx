import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  /** AdSense ad slot id (optional until you create units in AdSense) */
  slot?: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Small responsive Google AdSense unit.
 * Renders nothing visible until AdSense approves the site and fills the slot.
 */
const GoogleAd = ({ slot, format = 'auto', className = '', style }: GoogleAdProps) => {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocker or script not loaded */
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-9608758753279607"
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;

/** Lightweight conversion event tracking (GA4 / dataLayer friendly, no-op if absent). */
export type TrackEventName =
  | 'view_product'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'payment_success'
  | 'payment_failed';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const trackEvent = (name: TrackEventName, params: Record<string, any> = {}) => {
  const payload = { ...params, currency: 'INR' };
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
    window.gtag?.('event', name, payload);
    if (import.meta.env.DEV) console.debug('[track]', name, payload);
  } catch {
    /* tracking must never break the UI */
  }
};

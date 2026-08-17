import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface LazySectionProps {
  children: ReactNode;
  /** Space reserved before the section loads, avoids layout jump */
  minHeight?: number;
  /** How early (px) before entering the viewport to start loading */
  rootMargin?: string;
}

/**
 * Renders its children only once the placeholder scrolls near the viewport.
 * Combined with React.lazy this keeps below-the-fold JS + network out of
 * the initial page load.
 */
const LazySection = ({ children, minHeight = 320, rootMargin = '300px' }: LazySectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  if (visible) {
    return (
      <ErrorBoundary fallback={null}>
        <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>
      </ErrorBoundary>
    );
  }

  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};

export default LazySection;
import { useEffect, useRef, useState, ReactNode, ElementType } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  /** Rendered element, defaults to a div. */
  as?: ElementType;
  className?: string;
}

/**
 * Lightweight scroll-reveal wrapper: fades and lifts its children into place
 * once, the first time they enter the viewport. Respects reduced-motion.
 */
const Reveal = ({ children, delay = 0, as: Tag = 'div', className = '' }: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? 'reveal-in' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

export default Reveal;

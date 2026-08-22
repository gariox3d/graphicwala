import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    // Skip the very first run: the browser already positions the page on load,
    // and scrolling here (after lazy chunks mount) causes a random jump to top.
    if (lastPathname.current === null) {
      lastPathname.current = pathname;
      return;
    }

    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

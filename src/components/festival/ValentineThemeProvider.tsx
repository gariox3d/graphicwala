import { useEffect, lazy, Suspense } from 'react';
import { useValentineSettings } from '@/hooks/useValentineSettings';

// Heavy animation bundle is only downloaded while the theme is actually on.
const FallingHearts = lazy(() => import('./FallingHearts'));

const GREAT_VIBES_HREF = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';

const ensureGreatVibes = () => {
  if (document.getElementById('great-vibes-font')) return;
  const link = document.createElement('link');
  link.id = 'great-vibes-font';
  link.rel = 'stylesheet';
  link.href = GREAT_VIBES_HREF;
  document.head.appendChild(link);
};

const ValentineThemeProvider = () => {
  const { settings, isThemeActive } = useValentineSettings();
  const active = isThemeActive();

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('valentine-theme');
      ensureGreatVibes();
      // Optional: Set a specific CSS variable if needed
      if (settings?.primary_color_override) {
        root.style.setProperty('--valentine-override', settings.primary_color_override);
      }
    } else {
      root.classList.remove('valentine-theme');
      root.style.removeProperty('--valentine-override');
    }
    return () => {
      root.classList.remove('valentine-theme');
      root.style.removeProperty('--valentine-override');
    };
  }, [active, settings]);

  if (!active || !settings) return null;

  return (
    <Suspense fallback={null}>
      <FallingHearts />
    </Suspense>
  );
};

export default ValentineThemeProvider;
import { useEffect } from 'react';
import { useValentineSettings } from '@/hooks/useValentineSettings';
import FallingHearts from './FallingHearts';

const ValentineThemeProvider = () => {
  const { settings, isThemeActive } = useValentineSettings();
  const active = isThemeActive();

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('valentine-theme');
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
    <>
      <FallingHearts />
    </>
  );
};

export default ValentineThemeProvider;
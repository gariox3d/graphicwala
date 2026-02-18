import { useEffect } from 'react';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import RamadanHangingLights from './RamadanHangingLights';
import RamadanGreetingBanner from './RamadanGreetingBanner';

const RamadanThemeProvider = () => {
  const { settings, isThemeActive } = useFestivalSettings();
  const active = isThemeActive();

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('ramadan-theme');
    } else {
      root.classList.remove('ramadan-theme');
    }
    return () => {
      root.classList.remove('ramadan-theme');
    };
  }, [active]);

  if (!active || !settings) return null;

  return (
    <>
      <RamadanHangingLights />
      <RamadanGreetingBanner
        greetingText={settings.greeting_text || '🌙 Ramadan Mubarak! May this holy month bring peace and blessings.'}
      />
    </>
  );
};

export default RamadanThemeProvider;

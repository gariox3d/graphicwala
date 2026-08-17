/**
 * Tiny localStorage-backed cache for small, slow-changing settings payloads.
 *
 * Used as React Query `initialData` so returning visitors paint the correct
 * header/banner/hero on the very first frame instead of after the network
 * round-trip. This removes the layout shift caused by settings-driven UI
 * (announcement bar, hero showcase card) appearing late.
 */
const PREFIX = 'gw_cache_';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h

export function readCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { t: number; v: T };
    if (!parsed || Date.now() - parsed.t > MAX_AGE) return undefined;
    return parsed.v;
  } catch {
    return undefined;
  }
}

export function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* storage full or unavailable - caching is best-effort */
  }
}

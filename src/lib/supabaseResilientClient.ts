import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_HOST = (() => {
  try {
    return new URL(SUPABASE_URL).host;
  } catch {
    return '';
  }
})();

const isSupabaseRequest = (url: string) => {
  try {
    return new URL(url).host === SUPABASE_HOST;
  } catch {
    return false;
  }
};

const toProxyUrl = (url: string) => {
  const parsed = new URL(url);
  const pathWithQuery = `${parsed.pathname}${parsed.search}`.replace(/^\//, '');
  return `${window.location.origin}/api/supabase/${pathWithQuery}`;
};

const resilientFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);

  if (!isSupabaseRequest(request.url)) {
    return fetch(request);
  }

  try {
    return await fetch(request.clone());
  } catch (primaryError) {
    if (typeof window === 'undefined') {
      throw primaryError;
    }

    const fallbackUrl = toProxyUrl(request.url);
    return fetch(new Request(fallbackUrl, request));
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: resilientFetch,
  },
});

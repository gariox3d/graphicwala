import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const MAX_DIRECT_RETRIES = 2;
const MAX_PROXY_RETRIES = 1;

const SUPABASE_HOST = (() => {
  try {
    return new URL(SUPABASE_URL).host;
  } catch {
    return '';
  }
})();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const fetchWithRetry = async (request: Request, retries: number) => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(request.clone());
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }

  throw lastError;
};

const createProxyRequest = async (request: Request) => {
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.clone().arrayBuffer();

  return new Request(toProxyUrl(request.url), {
    method,
    headers: request.headers,
    body,
    credentials: 'same-origin',
    mode: 'same-origin',
    redirect: 'follow',
  });
};

const isHtmlResponse = (response: Response) => {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  return contentType.includes('text/html');
};

const resilientFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);

  if (!isSupabaseRequest(request.url)) {
    return fetch(request);
  }

  try {
    return await fetchWithRetry(request, MAX_DIRECT_RETRIES);
  } catch (primaryError) {
    if (typeof window === 'undefined') {
      throw primaryError;
    }

    try {
      const proxyRequest = await createProxyRequest(request);
      const proxyResponse = await fetchWithRetry(proxyRequest, MAX_PROXY_RETRIES);

      if (isHtmlResponse(proxyResponse)) {
        throw new Error('Proxy route unavailable');
      }

      return proxyResponse;
    } catch {
      throw primaryError;
    }
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

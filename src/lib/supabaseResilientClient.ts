import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const MAX_DIRECT_RETRIES = 1;
const MAX_PROXY_RETRIES = 1;
const DIRECT_TIMEOUT_MS = 3500;
const PROXY_TIMEOUT_MS = 5000;

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

const withTimeoutSignal = (request: Request, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (request.signal.aborted) {
    controller.abort();
  } else {
    request.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const timeoutRequest = new Request(request, {
    signal: controller.signal,
  });

  return {
    timeoutRequest,
    cleanup: () => clearTimeout(timeoutId),
  };
};

const fetchWithRetry = async (request: Request, retries: number, timeoutMs: number) => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { timeoutRequest, cleanup } = withTimeoutSignal(request.clone(), timeoutMs);

    try {
      return await fetch(timeoutRequest);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
      }
    } finally {
      cleanup();
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

const tryProxyFetch = async (request: Request) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const proxyRequest = await createProxyRequest(request);
    const proxyResponse = await fetchWithRetry(proxyRequest, MAX_PROXY_RETRIES, PROXY_TIMEOUT_MS);

    if (isHtmlResponse(proxyResponse)) {
      return null;
    }

    return proxyResponse;
  } catch {
    return null;
  }
};

const resilientFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);

  if (!isSupabaseRequest(request.url)) {
    return fetch(request);
  }

  const proxyFirstResponse = await tryProxyFetch(request);
  if (proxyFirstResponse) {
    return proxyFirstResponse;
  }

  try {
    const directResponse = await fetchWithRetry(request, MAX_DIRECT_RETRIES, DIRECT_TIMEOUT_MS);

    if (isHtmlResponse(directResponse)) {
      throw new Error('Unexpected HTML response from Supabase endpoint');
    }

    return directResponse;
  } catch (directError) {
    const proxyFallbackResponse = await tryProxyFetch(request);
    if (proxyFallbackResponse) {
      return proxyFallbackResponse;
    }

    throw directError;
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

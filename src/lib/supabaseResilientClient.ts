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

const toProxyStorageAssetUrl = (value: string) => {
  if (typeof window === 'undefined') return value;

  try {
    const parsed = new URL(value);
    const isStorageObjectPath = parsed.pathname.startsWith('/storage/v1/object/');

    if (parsed.host !== SUPABASE_HOST || !isStorageObjectPath) {
      return value;
    }

    return `${window.location.origin}/api/supabase${parsed.pathname}${parsed.search}`;
  } catch {
    return value;
  }
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

const rewriteStorageUrls = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return toProxyStorageAssetUrl(value);
  }

  if (Array.isArray(value)) {
    let changed = false;
    const mapped = value.map((item) => {
      const rewritten = rewriteStorageUrls(item);
      if (rewritten !== item) changed = true;
      return rewritten;
    });

    return changed ? mapped : value;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    let changed = false;
    const rewrittenRecord: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(record)) {
      const rewritten = rewriteStorageUrls(entry);
      if (rewritten !== entry) changed = true;
      rewrittenRecord[key] = rewritten;
    }

    return changed ? rewrittenRecord : value;
  }

  return value;
};

const maybeRewriteStorageUrlsInResponse = async (response: Response) => {
  if (typeof window === 'undefined') return response;

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.includes('application/json')) return response;

  if (!response.url.includes('/rest/v1/')) return response;

  try {
    const payload = await response.clone().json();
    const rewrittenPayload = rewriteStorageUrls(payload);

    if (rewrittenPayload === payload) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return new Response(JSON.stringify(rewrittenPayload), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
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

    return await maybeRewriteStorageUrlsInResponse(proxyResponse);
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

    return await maybeRewriteStorageUrlsInResponse(directResponse);
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

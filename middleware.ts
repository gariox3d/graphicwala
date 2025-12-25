export const config = {
  matcher: ['/product/:path*'],
};

const CRAWLER_USER_AGENTS = [
  'whatsapp',
  'facebookexternalhit',
  'facebookcatalog',
  'twitterbot',
  'telegrambot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'pinterest',
  'googlebot',
  'bingbot',
  'yandexbot',
  'applebot',
  'embedly',
  'quora',
  'outbrain',
  'redditbot',
  'vkshare',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => lowerUA.includes(bot));
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent');

  // Only intercept /product/:id routes for crawlers
  const productMatch = pathname.match(/^\/product\/([a-zA-Z0-9-]+)$/);
  
  if (productMatch && isCrawler(userAgent)) {
    const productId = productMatch[1];
    
    // Fetch OG meta HTML from Supabase edge function
    const ogMetaUrl = `https://haeggvlmnfapopmyuaya.supabase.co/functions/v1/og-meta?id=${productId}&path=${pathname}`;
    
    try {
      const response = await fetch(ogMetaUrl, {
        headers: {
          'User-Agent': userAgent || '',
        },
      });
      
      const html = await response.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('OG meta fetch error:', error);
      // Fall through to serve the SPA
    }
  }

  // For non-crawlers or if fetch fails, continue to the SPA
  return new Response(null, {
    status: 200,
    headers: {
      'x-middleware-next': '1',
    },
  });
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://store.graphicwala.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-square.png`;
const BUSINESS_NAME = "Graphic Wala Store";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("id");
    const path = url.searchParams.get("path") || "/";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let title = `${BUSINESS_NAME} | Personalized Gifts in Bihar`;
    let description = "Order customized photo frames, PVC cards, ID cards, visiting cards & keychains online. Premium quality with delivery across Bihar. Prepaid only.";
    let image = DEFAULT_OG_IMAGE;
    let pageUrl = SITE_URL + path;
    let type = "website";

    // If product ID is provided, fetch product details
    if (productId) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, description, image_url, price, stock_quantity, categories(name)")
        .eq("id", productId)
        .maybeSingle();

      if (product && !error) {
        title = `${product.name} | ${BUSINESS_NAME}`;
        description = product.description 
          ? `${product.description.slice(0, 140)}${product.description.length > 140 ? '...' : ''} Delivered across Bihar.`
          : `Order ${product.name} from Graphic Wala. Premium quality with home delivery across Bihar.`;
        image = product.image_url || DEFAULT_OG_IMAGE;
        pageUrl = `${SITE_URL}/product/${product.id}`;
        type = "product";
      }
    }

    // Generate HTML with meta tags for social crawlers
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:site_name" content="${BUSINESS_NAME}">
  <meta property="og:locale" content="en_IN">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("OG Meta Error:", error);
    
    // Return fallback HTML
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${BUSINESS_NAME}</title>
  <meta property="og:title" content="${BUSINESS_NAME}">
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}">
  <meta http-equiv="refresh" content="0;url=${SITE_URL}">
</head>
<body>Redirecting...</body>
</html>`;
    
    return new Response(fallbackHtml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

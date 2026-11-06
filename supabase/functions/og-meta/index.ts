
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.graphicwala.com";
const SITE_ORIGIN = new URL(SITE_URL).origin;
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-square.png`;
const BUSINESS_NAME = "Graphic Wala";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CRAWLER_USER_AGENTS = [
  "whatsapp",
  "facebookexternalhit",
  "facebookcatalog",
  "twitterbot",
  "telegrambot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "pinterest",
  "embedly",
  "quora",
  "outbrain",
  "redditbot",
  "vkshare",
  "googlebot",
  "bingbot",
  "google-inspectiontool",
  "storebot-google",
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;

  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((bot) => lowerUA.includes(bot));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        Allow: "GET, HEAD, OPTIONS",
      },
    });
  }

  try {
    const requestUrl = new URL(req.url);
    const productId = requestUrl.searchParams.get("id");
    const requestedPath = requestUrl.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent");
    const crawler = isCrawler(userAgent);

    console.log("OG Meta request:", {
      productId,
      requestedPath,
      crawler,
      userAgent,
    });

    // Validate the requested path to prevent external redirects.
    const safePath = getSafePath(requestedPath);

    // Normal visitors should reach the actual website.
    if (!crawler) {
      const redirectUrl = productId
        ? `${SITE_URL}/product/${encodeURIComponent(productId)}`
        : `${SITE_URL}${safePath}`;

      return new Response(null, {
        status: 302,
        headers: {
          ...CORS_HEADERS,
          Location: redirectUrl,
          "Cache-Control": "no-store",
          Vary: "User-Agent",
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let title = `${BUSINESS_NAME} | Custom Printing & Personalised Gifts`;
    let description =
      "Shop personalised gifts, photo frames, ID cards, PVC cards, visiting cards and custom printing products. Prepaid orders with delivery across India.";
    let image = DEFAULT_OG_IMAGE;
    let pageUrl = `${SITE_URL}${safePath}`;
    let type = "website";

    // Load admin-configured default social metadata.
    const { data: settings, error: settingsError } = await supabase
      .from("store_settings")
      .select("og_image_url, og_title, og_description")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("Store settings error:", settingsError);
    }

    if (settings?.og_title?.trim()) {
      title = settings.og_title.trim();
    }

    if (settings?.og_description?.trim()) {
      description = settings.og_description.trim();
    }

    if (isValidHttpUrl(settings?.og_image_url)) {
      image = settings.og_image_url;
    }

    // Fetch active product details.
    if (productId) {
      if (
        productId.length > 200 ||
        /[\/\\?#]/.test(productId)
      ) {
        return notFoundResponse(req.method);
      }

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          .test(productId);

      let query = supabase
        .from("products")
        .select(
          "id, slug, name, description, image_url, image_urls, is_active",
        )
        .eq("is_active", true);

      query = isUuid
        ? query.eq("id", productId)
        : query.eq("slug", productId);

      const { data: product, error } = await query.maybeSingle();

      if (error) {
        console.error("Product fetch error:", error);
        throw error;
      }

      // Never generate a product preview for missing/inactive products.
      if (!product) {
        return notFoundResponse(req.method);
      }

      title = `${product.name} | ${BUSINESS_NAME}`;

      const cleanDescription = stripHtml(product.description || "");

      description = cleanDescription
        ? `${truncate(cleanDescription, 150)} | Order online from Graphic Wala with delivery across India.`
        : `Order ${product.name} online from Graphic Wala. Custom printing and delivery across India.`;

      // Select the first valid product image.
      const imageUrls: unknown[] = Array.isArray(product.image_urls)
        ? product.image_urls
        : [];

      const validImages = imageUrls
        .map((item) => safeImageUrl(item))
        .filter((item): item is string => item !== null);

      const primaryImage =
        validImages[0] || safeImageUrl(product.image_url);

      image = primaryImage || DEFAULT_OG_IMAGE;

      // Convert WebP to JPEG for better social preview compatibility.
      if (getImageType(image) === "image/webp") {
        image = toJpegProxy(image);
      }

      const canonicalSlug = product.slug?.trim() || product.id;

      pageUrl = `${SITE_URL}/product/${encodeURIComponent(canonicalSlug)}`;
      type = "product";
    } else {
      const categoryMatch = safePath.match(/^\/category\/([^/]+)\/?$/);

      if (categoryMatch) {
        let requestedSlug = categoryMatch[1];

        try {
          requestedSlug = decodeURIComponent(requestedSlug);
        } catch {
          return notFoundResponse(req.method);
        }

        const { data: categories, error: categoryError } = await supabase
          .from("categories")
          .select("name, description, image_url")
          .eq("is_active", true);

        if (categoryError) {
          console.error("Category fetch error:", categoryError);
          throw categoryError;
        }

        const category = (categories || []).find(
          (item) => categorySlug(item.name) === requestedSlug,
        );

        if (!category) {
          return notFoundResponse(req.method);
        }

        title = `${category.name} | Custom Printing & Gifts | ${BUSINESS_NAME}`;
        description = category.description
          ? `${truncate(stripHtml(category.description), 145)} | Shop online at Graphic Wala with delivery across India.`
          : `Explore ${category.name} at Graphic Wala. Custom printing and personalised gifts with delivery across India.`;
        image = safeImageUrl(category.image_url) || image;
        pageUrl = `${SITE_URL}/category/${encodeURIComponent(categorySlug(category.name))}`;
      }
    }

    const imageType = getImageType(image);

    const html = generateHtml({
      title,
      description,
      image,
      imageType,
      pageUrl,
      type,
    });

    return new Response(req.method === "HEAD" ? null : html, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
        Vary: "User-Agent",
      },
    });
  } catch (error) {
    console.error("OG Meta Error:", error);

    const html = generateHtml({
      title: BUSINESS_NAME,
      description:
        "Custom printing, personalised gifts and online printing services from Graphic Wala. Delivery across India.",
      image: DEFAULT_OG_IMAGE,
      imageType: "image/png",
      pageUrl: SITE_URL,
      type: "website",
    });

    return new Response(req.method === "HEAD" ? null : html, {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        Vary: "User-Agent",
      },
    });
  }
});

function generateHtml(data: {
  title: string;
  description: string;
  image: string;
  imageType: string;
  pageUrl: string;
  type: string;
}): string {
  const title = escapeHtml(data.title);
  const description = escapeHtml(data.description);
  const image = escapeHtml(data.image);
  const pageUrl = escapeHtml(data.pageUrl);
  const businessName = escapeHtml(BUSINESS_NAME);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">

  <link rel="canonical" href="${pageUrl}">

  <meta property="og:type" content="${data.type}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:type" content="${data.imageType}">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:site_name" content="${businessName}">
  <meta property="og:locale" content="en_IN">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${title}">

  <meta http-equiv="refresh" content="0;url=${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${title}</a>...</p>
</body>
</html>`;
}

function notFoundResponse(method: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found | Graphic Wala</title>
  <meta name="robots" content="noindex, follow">
  <meta name="description" content="This product is unavailable.">
</head>
<body>
  <h1>Page Not Found</h1>
  <p>This page is unavailable or the requested item is no longer active.</p>
</body>
</html>`;

  return new Response(method === "HEAD" ? null : html, {
    status: 404,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, follow",
      Vary: "User-Agent",
    },
  });
}

function getSafePath(path: string): string {
  try {
    if (
      !path.startsWith("/") ||
      path.startsWith("//") ||
      path.includes("\\") ||
      /[\u0000-\u001F\u007F]/.test(path)
    ) {
      return "/";
    }

    const parsed = new URL(path, SITE_URL);

    if (parsed.origin !== SITE_ORIGIN) {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/";
  }
}

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function safeImageUrl(value: unknown): string | null {
  return isValidHttpUrl(value) ? value : null;
}

function getImageType(imageUrl: string): string {
  try {
    const pathname = new URL(imageUrl).pathname.toLowerCase();

    if (pathname.endsWith(".png")) return "image/png";
    if (pathname.endsWith(".webp")) return "image/webp";
    if (pathname.endsWith(".gif")) return "image/gif";

    return "image/jpeg";
  } catch {
    return "image/jpeg";
  }
}

function toJpegProxy(imageUrl: string): string {
  const url = new URL(imageUrl);

  const source = `${url.hostname}${url.pathname}${url.search}`;

  const params = new URLSearchParams({
    url: source,
    w: "1080",
    h: "1080",
    fit: "inside",
    output: "jpg",
    q: "88",
  });

  return `https://images.weserv.nl/?${params.toString()}`;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

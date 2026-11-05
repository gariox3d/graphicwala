
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.graphicwala.com";
const PAGE_SIZE = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [products, categories] = await Promise.all([
      fetchAllProducts(supabase),
      fetchAllCategories(supabase),
    ]);

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/sale", priority: "0.7", changefreq: "daily" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
      { url: "/shipping-policy", priority: "0.3", changefreq: "yearly" },
      { url: "/refund-policy", priority: "0.3", changefreq: "yearly" },
      { url: "/terms-and-conditions", priority: "0.3", changefreq: "yearly" },
      { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    for (const category of categories) {
      const slug = categorySlug(category.name);
      if (!slug) continue;

      const image = isValidHttpUrl(category.image_url)
        ? `    <image:image>
      <image:loc>${escapeXml(category.image_url)}</image:loc>
      <image:title>${escapeXml(category.name)} - Buy Online from Graphic Wala</image:title>
    </image:image>
`
        : "";

      xml += `  <url>
    <loc>${SITE_URL}/category/${encodeURIComponent(slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
${image}  </url>
`;
    }

    for (const product of products) {
      const productSlug = product.slug?.trim() || product.id;
      if (!productSlug) continue;

      const lastmod = validDate(product.updated_at);
      const imageUrls = Array.isArray(product.image_urls)
        ? product.image_urls.filter(isValidHttpUrl)
        : [];

      const allImages = imageUrls.length > 0
        ? imageUrls
        : isValidHttpUrl(product.image_url)
          ? [product.image_url]
          : [];

      xml += `  <url>
    <loc>${SITE_URL}/product/${encodeURIComponent(productSlug)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;

      for (const img of allImages) {
        xml += `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name)} - Graphic Wala</image:title>
    </image:image>
`;
      }

      xml += `  </url>
`;
    }

    xml += "</urlset>";

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);

    return new Response("Error generating sitemap", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
});

async function fetchAllProducts(supabase: ReturnType<typeof createClient>) {
  const results: any[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, updated_at, image_url, image_urls")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    results.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return results;
}

async function fetchAllCategories(supabase: ReturnType<typeof createClient>) {
  const results: any[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, image_url")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    results.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return results;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0];
}

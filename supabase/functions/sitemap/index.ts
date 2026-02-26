import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://graphicwala.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, updated_at, image_url, image_urls, categories(name)")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Fetch all active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, image_url, created_at")
      .eq("is_active", true);

    const now = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }


    // Add category pages
    if (categories) {
      for (const cat of categories) {
        const catImage = cat.image_url ? `    <image:image>
      <image:loc>${escapeXml(cat.image_url)}</image:loc>
      <image:title>${escapeXml(cat.name)} - Buy Online from Graphic Wala</image:title>
    </image:image>
` : '';
        xml += `  <url>
    <loc>${SITE_URL}/products?category=${encodeURIComponent(cat.name)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${catImage}  </url>
`;
      }
    }

    // Add product pages with images
    if (products) {
      for (const product of products) {
        const lastmod = product.updated_at ? product.updated_at.split("T")[0] : now;
        const imageUrls = Array.isArray(product.image_urls) ? product.image_urls as string[] : [];
        const allImages = imageUrls.length > 0 ? imageUrls : (product.image_url ? [product.image_url] : []);

        xml += `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
        for (const img of allImages) {
          xml += `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name)} - Graphic Wala</image:title>
      <image:caption>${escapeXml(product.name)}${Array.isArray(product.categories) && product.categories.length > 0 ? ` - ${product.categories[0].name}` : ""} | Buy Online from Graphic Wala</image:caption>
    </image:image>
`;
        }
        xml += `  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

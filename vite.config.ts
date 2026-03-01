import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL;

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: supabaseUrl
        ? {
            "/api/supabase": {
              target: supabaseUrl,
              changeOrigin: true,
              secure: true,
              rewrite: (requestPath) => requestPath.replace(/^\/api\/supabase/, ""),
            },
          }
        : undefined,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "logo.png", "android-chrome-192x192.png", "android-chrome-512x512.png"],
        manifest: {
          name: "Graphic Wala Store",
          short_name: "Graphic Wala",
          description: "Custom photo frames, PVC cards, keychains & personalized gifts. Delivered across India.",
          start_url: "/",
          display: "standalone",
          background_color: "#0a0a0a",
          theme_color: "#dc2626",
          orientation: "portrait-primary",
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: [
        {
          find: "@/integrations/supabase/client",
          replacement: path.resolve(__dirname, "./src/lib/supabaseResilientClient.ts"),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
  };
});

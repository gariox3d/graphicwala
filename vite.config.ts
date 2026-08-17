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
          // Admin bundles are huge and never needed by shoppers — keep them out of
          // the precache so first visit downloads only the storefront.
          // HTML is intentionally NOT precached: a precached index.html is the main
          // reason returning users keep seeing an old build after a deploy.
          globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
          globIgnores: ["**/Admin*", "**/ProductForm-*", "**/node_modules/**"],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // No app-shell fallback — every navigation goes to the network so the
          // freshly deployed HTML (and its new asset hashes) is always used.
          navigateFallback: null,
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
            {
              // Product/CDN images — fast repeat loads without blocking updates.
              urlPattern: ({ request }) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "image-cache",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
    esbuild: {
      // Strip debug noise from the production bundle (keeps warnings/errors).
      drop: mode === "production" ? ["debugger"] : [],
      pure: mode === "production" ? ["console.log", "console.debug", "console.info"] : [],
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
            query: ["@tanstack/react-query"],
          },
        },
      },
    },
  };
});

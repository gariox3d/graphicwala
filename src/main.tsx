import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Warm up the backend/CDN connection (DNS + TLS) before the first data or
// image request fires, shaving ~150-300ms off the first API/image response.
const apiOrigin = import.meta.env.VITE_SUPABASE_URL as string | undefined;
if (apiOrigin) {
  for (const rel of ["preconnect", "dns-prefetch"]) {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = apiOrigin;
    if (rel === "preconnect") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// Always serve the freshest build: activate the new service worker immediately
// and reload once so users never stay stuck on a cached old version.
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  },
});

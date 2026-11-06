
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Warm up the backend/CDN connection before the first data or image request.
const apiOrigin = import.meta.env.VITE_SUPABASE_URL as string | undefined;

if (apiOrigin) {
  try {
    const parsedUrl = new URL(apiOrigin);

    if (parsedUrl.protocol === "https:") {
      for (const rel of ["preconnect", "dns-prefetch"]) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = parsedUrl.origin;

        if (rel === "preconnect") {
          link.crossOrigin = "anonymous";
        }

        document.head.appendChild(link);
      }
    }
  } catch {
    console.warn("Invalid Supabase URL");
  }
}

// Render application with HelmetProvider.
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Always serve the freshest build.
const RELOAD_FLAG = "sw-reloaded-at";

const reloadOnce = () => {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);

  if (Date.now() - last < 30_000) return;

  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
};

const updateSW = registerSW({
  immediate: true,

  onNeedRefresh: reloadOnce,

  onRegisteredSW(_url, registration) {
    if (!registration) return;

    const check = () => registration.update().catch(() => {});

    setInterval(check, 60_000);

    window.addEventListener("focus", check);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        check();
      }
    });
  },
});

// Reload when a new service worker takes control.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (document.visibilityState === "visible") {
      reloadOnce();
    }
  });
}

void updateSW;

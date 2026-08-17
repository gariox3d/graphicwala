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
// and reload ONCE (guarded, so a bad deploy can never cause a reload loop).
const RELOAD_FLAG = "sw-reloaded-at";
const reloadOnce = () => {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
  if (Date.now() - last < 30_000) return; // already reloaded very recently
  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
};

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: reloadOnce,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    // Check for a new deployment on tab focus and every 60s, so long-lived
    // tabs pick up new versions without manual refreshes.
    const check = () => registration.update().catch(() => {});
    setInterval(check, 60_000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  },
});

// If a new worker takes control (skipWaiting), reload so the page runs the new build.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (document.visibilityState === "visible") reloadOnce();
  });
}
void updateSW;

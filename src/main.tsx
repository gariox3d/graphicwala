import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(<App />);

// Always serve the freshest build: activate the new service worker immediately
// and reload once so users never stay stuck on a cached old version.
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  },
});

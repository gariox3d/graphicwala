import { useEffect, useState } from "react";
import logoImage from "@/assets/brand/graphicwala-logo-square.png.asset.json";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 1800);
    const doneTimer = setTimeout(onFinish, 2400);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      {/* Pulsing ring */}
      <div className="relative flex items-center justify-center">
        <div
          className={`absolute w-40 h-40 rounded-full border-4 border-primary/30 ${
            phase !== "exit" ? "animate-ping" : ""
          }`}
          style={{ animationDuration: "1.5s" }}
        />
        <div
          className={`absolute w-48 h-48 rounded-full border-2 border-primary/10 ${
            phase !== "exit" ? "animate-ping" : ""
          }`}
          style={{ animationDuration: "2s", animationDelay: "0.3s" }}
        />

        {/* Logo */}
        <img
          src={logoImage.url}
          alt="Graphic Wala"
          className={`w-40 h-40 object-contain transition-all duration-700 ${
            phase === "enter"
              ? "scale-0 rotate-[-180deg] opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </div>

      {/* Tagline */}
      <p
        className={`mt-8 text-foreground/70 text-sm font-outfit tracking-[0.3em] uppercase transition-all duration-500 delay-300 ${
          phase === "enter" ? "opacity-0 translate-y-4" : phase === "exit" ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        Your Design, Our Craft
      </p>

      {/* Loading dots */}
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/80"
            style={{
              animation: phase !== "exit" ? "splash-bounce 1s ease-in-out infinite" : "none",
              animationDelay: `${i * 0.15}s`,
              opacity: phase === "exit" ? 0 : undefined,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splash-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

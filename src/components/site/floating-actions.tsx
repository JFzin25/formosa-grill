import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6">
      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          className="glass-panel grid h-11 w-11 place-items-center rounded-full text-gold transition-transform hover:-translate-y-1"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
      <a
        href={restaurant.whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.72_0.18_150)] text-black shadow-[var(--shadow-elegant)] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

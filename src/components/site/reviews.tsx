import { useEffect, useState } from "react";
import { reviews as fallbackReviews, restaurant } from "@/data/restaurant";
import { Star } from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";
import { fetchApprovedReviews } from "@/lib/api/public";
import type { Review } from "@/lib/types";

interface DisplayReview {
  name: string;
  stars: number;
  text: string;
}

export function Reviews() {
  const [reviews, setReviews] = useState<DisplayReview[]>(
    fallbackReviews.map((r) => ({ name: r.name, stars: r.stars, text: r.text }))
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchApprovedReviews();
        if (cancelled || data.length === 0) return;
        const mapped: DisplayReview[] = data.map((r) => ({
          name: r.nome,
          stars: r.stars,
          text: r.text ?? "",
        }));
        if (!cancelled) setReviews(mapped);
      } catch {
        // Mantém reviews estáticas como fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Avaliações"
          title={`${restaurant.rating} estrelas e mais de ${restaurant.reviewCount} avaliações`}
          description="Quem vem uma vez costuma voltar. Veja o que dizem nossos clientes."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <Reveal key={r.name + i} delay={i * 70}>
              <blockquote className="hover-lift flex h-full flex-col rounded-3xl border border-border bg-card/50 p-7">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={s < r.stars ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-30"}
                    />
                  ))}
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  "{r.text}"
                </p>
                <footer className="mt-6 text-sm font-semibold">{r.name}</footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

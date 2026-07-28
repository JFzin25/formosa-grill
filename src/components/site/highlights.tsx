import { highlights } from "@/data/restaurant";
import { Reveal, SectionHeading } from "./reveal";

export function Highlights() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Destaques"
          title="O que torna a experiência inesquecível"
          description="Da brasa ao atendimento, cada detalhe é pensado para você voltar mais vezes."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 70}>
              <article className="hover-lift group h-full rounded-3xl border border-border bg-card/50 p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/25 bg-accent text-2xl transition-transform duration-500 group-hover:scale-110">
                  {h.emoji}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{h.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import ambienteImg from "@/assets/ambiente.jpg";
import { Reveal } from "./reveal";

const stats = [
  { value: "4.2★", label: "Nota no Google" },
  { value: "+570", label: "Avaliações" },
  { value: "7", label: "Noites por semana" },
];

export function About() {
  return (
    <section id="sobre" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-3xl border border-gold/20">
            <img
              src={ambienteImg}
              alt="Salão aconchegante do Formosa Grill em Timon - MA"
              width={1200}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="glass-panel absolute -bottom-6 left-4 rounded-2xl px-6 py-4 sm:left-8">
            <p className="font-display text-2xl font-bold text-gradient-gold">Desde sempre</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              referência em Timon
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">
              Nossa história
            </p>
            <h2 className="mt-4 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Uma churrascaria feita para reunir gente boa
            </h2>
            <div className="gold-rule mt-6" />
          </Reveal>

          <Reveal delay={80} className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              O Formosa Grill nasceu no bairro Formosa com um propósito simples: servir carne de
              verdade, no ponto certo, para as famílias de Timon. Cada corte é escolhido a dedo,
              temperado com respeito à tradição e finalizado lentamente na brasa até ganhar aquela
              crosta dourada que só o fogo sabe fazer.
            </p>
            <p>
              Com o tempo, a casa cresceu junto com a cidade. Chegaram as pizzas artesanais de
              fermentação natural, os drinks autorais, a área infantil e as noites de música ao
              vivo. Hoje somos ponto de encontro de famílias, casais e grupos de amigos que querem
              comer bem e ser bem tratados.
            </p>
            <p>
              O que não mudou foi o essencial: ingredientes de qualidade, porções generosas e um
              atendimento que faz você se sentir em casa desde a primeira visita.
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-10 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-5 text-center">
                <p className="font-display text-2xl font-bold text-gold sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

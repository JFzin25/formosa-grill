import { Link } from "@tanstack/react-router";
import { Phone, Star, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-grill.jpg";
import { restaurant } from "@/data/restaurant";

export function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setOffset(Math.min(window.scrollY, 700) * 0.18));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Cortes nobres de carne assando na brasa no Formosa Grill"
        width={1920}
        height={1280}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.12)` }}
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            <Star className="h-3.5 w-3.5 fill-current" />
            {restaurant.rating} • +{restaurant.reviewCount} avaliações no Google
          </span>

          <h1 className="mt-7 text-balance text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            O verdadeiro sabor do <span className="text-gradient-gold">churrasco</span> em Timon.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
            Carnes selecionadas, pizzas deliciosas, ambiente familiar e uma experiência
            inesquecível.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/reservas"
              className="inline-flex items-center justify-center rounded-full px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--gradient-ember)", boxShadow: "var(--shadow-elegant)" }}
            >
              Reservar Mesa
            </Link>
            <Link
              to="/cardapio"
              className="inline-flex items-center justify-center rounded-full border border-gold/60 px-7 py-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Ver Cardápio
            </Link>
            <a
              href={restaurant.phoneHref}
              className="glass-panel inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              <Phone className="h-4 w-4" /> Ligar Agora
            </a>
          </div>

          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="glass-panel flex items-start gap-3 rounded-2xl p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Aberto</dt>
                <dd className="text-sm font-medium">Diariamente às 18:00</dd>
              </div>
            </div>
            <div className="glass-panel flex items-start gap-3 rounded-2xl p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Onde</dt>
                <dd className="truncate text-sm font-medium">Av. Pres. Médici, 2296</dd>
              </div>
            </div>
            <div className="glass-panel flex items-start gap-3 rounded-2xl p-4">
              <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Preço médio
                </dt>
                <dd className="text-sm font-medium">{restaurant.priceRange} por pessoa</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

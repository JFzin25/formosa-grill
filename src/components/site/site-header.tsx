import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X, Lock } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

const links = [
  { label: "Início", to: "/" },
  { label: "Cardápio", to: "/cardapio" },
  { label: "Reservas", to: "/reservas" },
  { label: "Delivery", to: "/delivery" },
  { label: "Contato", to: "/contato" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-panel border-x-0 border-t-0 py-2" : "py-4",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 font-display text-lg font-bold text-gradient-gold">
            FG
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-none sm:text-xl">
              Formosa Grill
            </span>
            <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Churrascaria • Pizzaria
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-gold" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/85 transition-colors hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href={restaurant.phoneHref}
            className="hidden items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {restaurant.phone}
          </a>
          <Link
            to="/admin"
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold lg:grid"
            aria-label="Acesso administrativo"
          >
            <Lock className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="glass-panel mx-4 mt-3 rounded-2xl p-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-gold" }}
              className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={restaurant.phoneHref}
            className="block rounded-xl px-4 py-3 text-base font-semibold text-gold"
          >
            Ligar {restaurant.phone}
          </a>
          <Link
            to="/admin"
            className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Lock className="h-4 w-4" />
            Área administrativa
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

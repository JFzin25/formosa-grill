import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, Instagram, Facebook } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { fetchSettings } from "@/lib/api/public";
import type { Settings } from "@/lib/types";

export function SiteFooter() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSettings();
        if (!cancelled) setSettings(data);
      } catch {
        // Mantém os dados estáticos do restaurant.ts como fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Usa settings do banco se disponíveis, senão fallback do restaurant.ts
  const telefone = settings?.telefone ?? restaurant.phone;
  const whatsapp = settings?.whatsapp ?? restaurant.whatsapp;
  // Mostra ícones de redes sociais somente se o link existir e não for string vazia
  const instagram = settings?.instagram?.trim() || null;
  const facebook = settings?.facebook?.trim() || null;
  const endereco = settings?.endereco ?? `${restaurant.address.street}, ${restaurant.address.district}, ${restaurant.address.city} ${restaurant.address.zip}`;
  const horario = settings?.horario ?? restaurant.hours;
  const mapaUrl = settings?.mapa_url ?? restaurant.mapsUrl;
  const mapsEmbed = restaurant.mapsEmbed; // Embed sempre do restaurant.ts (formato específico do Google)

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <span className="font-display text-2xl font-bold text-gradient-gold">Formosa Grill</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {restaurant.category}. O verdadeiro sabor do churrasco em Timon - MA, com pizzas
            artesanais e ambiente familiar.
          </p>
          <div className="mt-5 flex gap-3">
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram do Formosa Grill"
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}

            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook do Formosa Grill"
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Navegação</h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              { label: "Início", to: "/" },
              { label: "Cardápio", to: "/cardapio" },
              { label: "Reservas", to: "/reservas" },
              { label: "Delivery", to: "/delivery" },
              { label: "Contato e Localização", to: "/contato" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Contato</h3>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{endereco}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${telefone}`} className="transition-colors hover:text-gold">
                {telefone}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{horario}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Como chegar</h3>
          <div className="mt-5 overflow-hidden rounded-xl border border-border">
            <iframe
              title="Mapa do Formosa Grill"
              src={mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-40 w-full"
            />
          </div>
          <a
            href={mapaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-gold transition-opacity hover:opacity-80"
          >
            Abrir no Google Maps →
          </a>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Formosa Grill • Timon - MA. Todos os direitos reservados.
      </div>
    </footer>
  );
}

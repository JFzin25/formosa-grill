import { Clock, MapPin, Phone } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { Reveal, SectionHeading } from "./reveal";

export function LocationSection() {
  return (
    <section id="localizacao" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Localização"
          title="Estamos te esperando no bairro Formosa"
          description="Fácil acesso, estacionamento na região e ambiente preparado para receber toda a família."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="space-y-4">
            <div className="glass-panel flex gap-4 rounded-2xl p-6">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Endereço</p>
                <address className="mt-2 not-italic leading-relaxed">
                  {restaurant.address.street}
                  <br />
                  {restaurant.address.district}, {restaurant.address.city}
                  <br />
                  {restaurant.address.zip}
                </address>
              </div>
            </div>
            <div className="glass-panel flex gap-4 rounded-2xl p-6">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Telefone</p>
                <a href={restaurant.phoneHref} className="mt-2 block font-medium hover:text-gold">
                  {restaurant.phone}
                </a>
              </div>
            </div>
            <div className="glass-panel flex gap-4 rounded-2xl p-6">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Funcionamento
                </p>
                <p className="mt-2 font-medium">{restaurant.hours}</p>
              </div>
            </div>
            <a
              href={restaurant.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--gradient-ember)" }}
            >
              Abrir no Google Maps
            </a>
          </Reveal>

          <Reveal delay={100} className="overflow-hidden rounded-3xl border border-gold/20">
            <iframe
              title="Mapa da localização do Formosa Grill"
              src={restaurant.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full lg:h-full"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

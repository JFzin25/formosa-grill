import { Bike, MessageCircle, Phone, ShoppingBag, ShieldCheck } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { Reveal, SectionHeading } from "./reveal";

const options = [
  {
    icon: MessageCircle,
    title: "Pedir no WhatsApp",
    text: "Atendimento rápido, cardápio completo e acompanhamento do pedido.",
    href: restaurant.whatsappHref,
    cta: "Chamar no WhatsApp",
    external: true,
  },
  {
    icon: Phone,
    title: "Pedir por telefone",
    text: "Prefere falar com a gente? Ligue e faça seu pedido em minutos.",
    href: restaurant.phoneHref,
    cta: restaurant.phone,
    external: false,
  },
  {
    icon: ShoppingBag,
    title: "Retirada na porta",
    text: "Peça, chegue e retire sem sair do carro. Praticidade total.",
    href: restaurant.mapsUrl,
    cta: "Ver como chegar",
    external: true,
  },
  {
    icon: Bike,
    title: "Entrega em Timon",
    text: "Delivery quentinho até a sua casa, com opção de entrega sem contato.",
    href: restaurant.whatsappHref,
    cta: "Consultar taxa",
    external: true,
  },
];

export function Delivery() {
  return (
    <section id="delivery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Delivery"
          title="Do nosso fogo direto para a sua mesa"
          description="Refeição no local, retirada na porta, delivery e entrega sem contato. Escolha como prefere aproveitar."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o, i) => (
            <Reveal key={o.title} delay={i * 70}>
              <a
                href={o.href}
                target={o.external ? "_blank" : undefined}
                rel={o.external ? "noreferrer" : undefined}
                className="hover-lift flex h-full flex-col rounded-3xl border border-border bg-card/50 p-7"
              >
                <o.icon className="h-8 w-8 text-gold" />
                <h3 className="mt-6 text-lg font-semibold">{o.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
                <span className="mt-6 text-sm font-semibold text-gold">{o.cta} →</span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-8">
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Entrega sem contato disponível mediante solicitação no pedido.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

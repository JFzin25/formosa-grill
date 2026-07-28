import { createFileRoute } from "@tanstack/react-router";
import { LocationSection } from "@/components/site/location";
import { Faq } from "@/components/site/faq";

const title = "Contato e Localização — Formosa Grill Timon - MA";
const description =
  "Endereço, telefone, horário de funcionamento e mapa do Formosa Grill: Av. Pres. Médici, 2296, Formosa, Timon - MA.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: () => (
    <div className="pt-24">
      <LocationSection />
      <Faq />
    </div>
  ),
});

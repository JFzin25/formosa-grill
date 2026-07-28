import { createFileRoute } from "@tanstack/react-router";
import { Delivery } from "@/components/site/delivery";

const title = "Delivery e Retirada — Formosa Grill Timon - MA";
const description =
  "Peça delivery do Formosa Grill em Timon - MA pelo WhatsApp ou telefone. Retirada na porta e entrega sem contato disponíveis.";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/delivery" },
    ],
    links: [{ rel: "canonical", href: "/delivery" }],
  }),
  component: () => (
    <div className="pt-24">
      <Delivery />
    </div>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { MenuList } from "@/components/site/menu-list";
import { SectionHeading } from "@/components/site/reveal";

const title = "Cardápio — Formosa Grill | Carnes, Pizzas e Porções em Timon";
const description =
  "Confira o cardápio do Formosa Grill: carnes na brasa, pizzas artesanais, porções, massas, hambúrgueres, bebidas e sobremesas em Timon - MA.";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cardapio" },
    ],
    links: [{ rel: "canonical", href: "/cardapio" }],
  }),
  component: CardapioPage,
});

function CardapioPage() {
  return (
    <div className="pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Cardápio"
          title="Feito na brasa, servido com carinho"
          description="Preços e disponibilidade podem variar conforme a temporada. Consulte a equipe sobre sugestões do dia."
        />
        <div className="mt-16">
          <MenuList />
        </div>
      </div>
    </div>
  );
}

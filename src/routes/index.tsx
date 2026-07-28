import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Highlights } from "@/components/site/highlights";
import { Gallery } from "@/components/site/gallery";
import { Reviews } from "@/components/site/reviews";
import { Delivery } from "@/components/site/delivery";
import { LocationSection } from "@/components/site/location";
import { Faq } from "@/components/site/faq";
import { restaurant } from "@/data/restaurant";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/reveal";

const title = "Formosa Grill — Churrascaria e Pizzaria em Timon - MA";
const description =
  "Carnes na brasa, pizzas artesanais, bebidas geladas e ambiente familiar em Timon - MA. Reserve sua mesa, peça delivery ou retire na porta.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "restaurant.restaurant" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: restaurant.name,
          image: "/favicon.ico",
          servesCuisine: ["Churrasco", "Pizza", "Brasileira"],
          priceRange: "R$20 - R$100",
          telephone: "+55 99 3317-2043",
          url: "/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Pres. Médici, 2296 - Formosa",
            addressLocality: "Timon",
            addressRegion: "MA",
            postalCode: "65636-010",
            addressCountry: "BR",
          },
          hasMap: restaurant.mapsUrl,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.rating,
            reviewCount: restaurant.reviewCount,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "18:00",
              closes: "23:59",
            },
          ],
          acceptsReservations: "True",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <About />
      <Highlights />
      <Gallery />

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="glass-panel flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
              <h2 className="text-balance text-2xl font-bold sm:text-4xl">
                Cardápio completo, do <span className="text-gradient-gold">churrasco</span> à
                sobremesa
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Carnes, pizzas, porções, massas, hambúrgueres, bebidas e sobremesas — tudo preparado
                na hora.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/cardapio"
                  className="rounded-full px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  Ver cardápio
                </Link>
                <Link
                  to="/reservas"
                  className="rounded-full border border-gold/60 px-7 py-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
                >
                  Reservar mesa
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Reviews />
      <Delivery />
      <LocationSection />
      <Faq />
    </>
  );
}

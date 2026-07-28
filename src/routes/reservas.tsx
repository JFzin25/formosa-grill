import { createFileRoute } from "@tanstack/react-router";
import { ReservationForm } from "@/components/site/reservation-form";
import { SectionHeading } from "@/components/site/reveal";

const title = "Reservar Mesa — Formosa Grill Timon - MA";
const description =
  "Reserve sua mesa no Formosa Grill em Timon - MA. Informe data, horário e número de pessoas e receba a confirmação da nossa equipe.";

export const Route = createFileRoute("/reservas")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/reservas" },
    ],
    links: [{ rel: "canonical", href: "/reservas" }],
  }),
  component: ReservasPage,
});

function ReservasPage() {
  return (
    <div className="pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Reservas"
          title="Garanta sua mesa no Formosa Grill"
          description="Abrimos todos os dias às 18:00. Para grupos e eventos, recomendamos reservar com antecedência."
        />
        <div className="mt-14">
          <ReservationForm />
        </div>
      </div>
    </div>
  );
}

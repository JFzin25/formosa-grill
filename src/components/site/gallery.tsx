import { useEffect, useState } from "react";
import { Reveal, SectionHeading } from "./reveal";
import { fetchActiveGallery } from "@/lib/api/public";
import type { GalleryItem } from "@/lib/types";

// Fallback de imagens locais caso o banco esteja vazio
import heroImg from "@/assets/hero-grill.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import drinksImg from "@/assets/drinks.jpg";
import ambienteImg from "@/assets/ambiente.jpg";
import sobremesaImg from "@/assets/sobremesa.jpg";
import familiaImg from "@/assets/familia.jpg";

const fallbackPhotos = [
  { src: heroImg, alt: "Carnes nobres assando na brasa", label: "Carnes na brasa", span: "lg:col-span-2 lg:row-span-2" },
  { src: pizzaImg, alt: "Pizza artesanal saindo do forno", label: "Pizzas artesanais", span: "" },
  { src: drinksImg, alt: "Drinks e chopp gelados no balcão", label: "Drinks & bebidas", span: "" },
  { src: sobremesaImg, alt: "Petit gâteau com sorvete", label: "Sobremesas", span: "" },
  { src: ambienteImg, alt: "Salão do restaurante à noite", label: "Ambiente", span: "" },
  { src: familiaImg, alt: "Família reunida à mesa do Formosa Grill", label: "Clientes felizes", span: "lg:col-span-2" },
];

export function Gallery() {
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const gallery = await fetchActiveGallery();
        if (cancelled || gallery.length === 0) return;

        // Transforma os itens do banco no formato esperado pelo grid
        const dbPhotos = gallery.map((item, i) => {
          // Primeira e última foto ocupam mais espaço no grid
          const isFirst = i === 0;
          const isLast = i === gallery.length - 1 && gallery.length > 2;
          const span = isFirst
            ? "lg:col-span-2 lg:row-span-2"
            : isLast
              ? "lg:col-span-2"
              : "";
          return {
            src: item.imagem ?? "",
            alt: item.titulo ?? `Foto ${i + 1}`,
            label: item.titulo ?? `Galeria ${i + 1}`,
            span,
          };
        });
        if (!cancelled) setPhotos(dbPhotos);
      } catch {
        // Em caso de erro, mantém as fotos de fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="galeria" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Galeria"
          title="Um convite para os olhos antes do paladar"
          description="Carnes, pizzas, drinks, sobremesas e o clima da casa em uma noite comum no Formosa Grill."
        />

        {loading ? (
          <div className="mt-16 flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : (
          <div className="mt-16 grid auto-rows-[220px] gap-4 sm:grid-cols-2 sm:auto-rows-[260px] lg:grid-cols-4">
            {photos.map((p, i) => (
              <Reveal key={p.label + i} delay={i * 60} className={p.span}>
                <figure className="group relative h-full overflow-hidden rounded-3xl border border-border">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
                  <figcaption className="absolute bottom-4 left-5 text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                    {p.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

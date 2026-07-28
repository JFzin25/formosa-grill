import { useEffect, useState } from "react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import { fetchActiveCategories, fetchAvailableProducts } from "@/lib/api/public";
import type { Category, Product } from "@/lib/types";

function formatPrice(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MenuList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("Todos");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchActiveCategories(),
          fetchAvailableProducts(),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar o cardápio.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Agrupa produtos por categoria
  const grouped = categories
    .map((cat) => ({
      category: cat.nome,
      items: products.filter((p) => p.categoria === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  const visible = active === "Todos" ? grouped : grouped.filter((g) => g.category === active);
  const categoryNames = grouped.map((g) => g.category);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Nenhum produto disponível no momento.
      </div>
    );
  }

  return (
    <div>
      <Reveal className="flex flex-wrap justify-center gap-2">
        {["Todos", ...categoryNames].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
              active === c
                ? "border-gold text-gold shadow-[var(--shadow-gold)]"
                : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </Reveal>

      <div className="mt-14 space-y-16">
        {visible.map((group) => (
          <section key={group.category}>
            <Reveal className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{group.category}</h2>
              <span className="h-px flex-1 bg-border" />
            </Reveal>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {group.items.map((item, i) => (
                <Reveal key={item.id} delay={i * 50}>
                  <article className="hover-lift flex h-full items-start justify-between gap-5 rounded-2xl border border-border bg-card/50 p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">{item.nome}</h3>
                        {item.destaque && (
                          <span className="shrink-0 rounded-full border border-gold/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.descricao}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-bold text-gold">
                      {formatPrice(item.preco)}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Star, StarOff } from "lucide-react";
import { fetchReviews, createReview, updateReview, deleteReview } from "@/lib/api/content";
import { createLog } from "@/lib/api/admin";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — Formosa Grill Admin" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [stars, setStars] = useState("5");
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch {
      toast.error("Erro ao carregar avaliações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleApprove(r: Review) {
    try {
      await updateReview(r.id, { approved: !r.approved });
      await createLog({ action: r.approved ? "Avaliação reprovada" : "Avaliação aprovada", entity: "reviews", entityId: r.id });
      setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, approved: !x.approved } : x));
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    try {
      await deleteReview(id);
      await createLog({ action: "Avaliação excluída", entity: "reviews", entityId: id });
      toast.success("Avaliação excluída!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createReview({ nome, stars: parseInt(stars), text, approved: true });
      await createLog({ action: "Avaliação criada", entity: "reviews", entityId: created.id });
      toast.success("Avaliação adicionada!");
      setDialogOpen(false);
      setNome("");
      setStars("5");
      setText("");
      await load();
    } catch {
      toast.error("Erro ao criar avaliação.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Avaliações</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Avaliação</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div>
                <Label>Estrelas</Label>
                <Input type="number" min={1} max={5} value={stars} onChange={(e) => setStars(e.target.value)} />
              </div>
              <div>
                <Label>Texto</Label>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Criar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{r.nome}</h3>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.stars ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.approved ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {r.approved ? "Aprovada" : "Pendente"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleApprove(r)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title={r.approved ? "Reprovar" : "Aprovar"}>
                    {r.approved ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

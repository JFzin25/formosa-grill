import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/catalog";
import { createLog } from "@/lib/api/admin";
import type { Category } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/categorias")({
  head: () => ({ meta: [{ title: "Categorias — Formosa Grill Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("0");
  const [ativa, setAtiva] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setNome("");
    setOrdem("0");
    setAtiva(true);
    setDialogOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setNome(c.nome);
    setOrdem(c.ordem.toString());
    setAtiva(c.ativa);
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { nome, ordem: parseInt(ordem) || 0, ativa };
      if (editing) {
        await updateCategory(editing.id, payload);
        await createLog({ action: "Categoria atualizada", entity: "categories", entityId: editing.id, details: payload });
        toast.success("Categoria atualizada!");
      } else {
        const created = await createCategory(payload);
        await createLog({ action: "Categoria criada", entity: "categories", entityId: created.id, details: payload });
        toast.success("Categoria criada!");
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Erro ao salvar categoria.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria? Produtos vinculados ficarão sem categoria.")) return;
    try {
      await deleteCategory(id);
      await createLog({ action: "Categoria excluída", entity: "categories", entityId: id });
      toast.success("Categoria excluída!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  async function toggleAtiva(c: Category) {
    try {
      await updateCategory(c.id, { ativa: !c.ativa });
      setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, ativa: !x.ativa } : x));
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categorias</h1>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Categoria
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Ordem</th>
                <th className="p-3 text-left font-semibold">Nome</th>
                <th className="p-3 text-center font-semibold">Ativa</th>
                <th className="p-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      {c.ordem}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{c.nome}</td>
                  <td className="p-3 text-center">
                    <Switch checked={c.ativa} onCheckedChange={() => toggleAtiva(c)} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="cat-nome">Nome *</Label>
              <Input id="cat-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="cat-ordem">Ordem</Label>
              <Input id="cat-ordem" type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={ativa} onCheckedChange={setAtiva} />
              Ativa
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

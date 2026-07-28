import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/lib/api/media";
import { uploadFile } from "@/lib/api/storage";
import { createLog } from "@/lib/api/admin";
import type { GalleryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/galeria")({
  head: () => ({ meta: [{ title: "Galeria — Formosa Grill Admin" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState("");
  const [ordem, setOrdem] = useState("0");
  const [ativo, setAtivo] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGallery();
      setItems(data);
    } catch {
      toast.error("Erro ao carregar galeria.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setTitulo(""); setImagem(""); setOrdem("0"); setAtivo(true); setDialogOpen(true); }
  function openEdit(item: GalleryItem) {
    setEditing(item);
    setTitulo(item.titulo ?? "");
    setImagem(item.imagem ?? "");
    setOrdem(item.ordem.toString());
    setAtivo(item.ativo);
    setDialogOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile("GALLERY", file);
      setImagem(url);
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { titulo, imagem, ordem: parseInt(ordem) || 0, ativo };
    try {
      if (editing) {
        await updateGalleryItem(editing.id, payload);
        await createLog({ action: "Item da galeria atualizado", entity: "gallery", entityId: editing.id, details: payload });
        toast.success("Item atualizado!");
      } else {
        const created = await createGalleryItem(payload);
        await createLog({ action: "Item da galeria criado", entity: "gallery", entityId: created.id, details: payload });
        toast.success("Item criado!");
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este item?")) return;
    try {
      await deleteGalleryItem(id);
      await createLog({ action: "Item da galeria excluído", entity: "gallery", entityId: id });
      toast.success("Item excluído!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Galeria</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Adicionar Imagem</Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border">
              {item.imagem ? (
                <img src={item.imagem} alt={item.titulo ?? ""} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square w-full place-items-center bg-muted text-muted-foreground">Sem imagem</div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-semibold text-white">{item.titulo}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(item)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/30">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-lg bg-red-500/80 p-1.5 text-white hover:bg-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Imagem" : "Nova Imagem"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <Label>Imagem</Label>
              <div className="flex items-center gap-4">
                {imagem && <img src={imagem} alt="Preview" className="h-20 w-20 rounded-lg border border-border object-cover" />}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Enviando…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={ativo} onCheckedChange={setAtivo} /> Ativo
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

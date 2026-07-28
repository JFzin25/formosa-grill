import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "@/lib/api/media";
import { uploadFile } from "@/lib/api/storage";
import { createLog } from "@/lib/api/admin";
import type { Banner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "Banners — Formosa Grill Admin" }] }),
  component: BannersPage,
});

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ titulo: "", subtitulo: "", imagem: "", botao: "", link: "", ordem: "0", ativo: true });
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch {
      toast.error("Erro ao carregar banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm({ titulo: "", subtitulo: "", imagem: "", botao: "", link: "", ordem: "0", ativo: true }); setDialogOpen(true); }
  function openEdit(b: Banner) {
    setEditing(b);
    setForm({ titulo: b.titulo ?? "", subtitulo: b.subtitulo ?? "", imagem: b.imagem ?? "", botao: b.botao ?? "", link: b.link ?? "", ordem: b.ordem.toString(), ativo: b.ativo });
    setDialogOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile("BANNERS", file);
      setForm((f) => ({ ...f, imagem: url }));
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, ordem: parseInt(form.ordem) || 0 };
    try {
      if (editing) {
        await updateBanner(editing.id, payload);
        await createLog({ action: "Banner atualizado", entity: "banners", entityId: editing.id, details: payload });
        toast.success("Banner atualizado!");
      } else {
        const created = await createBanner(payload);
        await createLog({ action: "Banner criado", entity: "banners", entityId: created.id, details: payload });
        toast.success("Banner criado!");
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este banner?")) return;
    try {
      await deleteBanner(id);
      await createLog({ action: "Banner excluído", entity: "banners", entityId: id });
      toast.success("Banner excluído!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Banners</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Adicionar Banner</Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {b.imagem && <img src={b.imagem} alt={b.titulo ?? ""} className="h-40 w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-semibold">{b.titulo}</h3>
                {b.subtitulo && <p className="text-sm text-muted-foreground">{b.subtitulo}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.ativo ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {b.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Banner" : "Novo Banner"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
            <div><Label>Subtítulo</Label><Input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} /></div>
            <div>
              <Label>Imagem</Label>
              <div className="flex items-center gap-4">
                {form.imagem && <img src={form.imagem} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
                  <Upload className="h-4 w-4" /> {uploading ? "Enviando…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Texto do Botão</Label><Input value={form.botao} onChange={(e) => setForm({ ...form, botao: e.target.value })} /></div>
              <div><Label>Link</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} /></div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /> Ativo
              </label>
            </div>
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

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
import { fetchSettings, updateSettings } from "@/lib/api/content";
import { uploadFile } from "@/lib/api/storage";
import { createLog } from "@/lib/api/admin";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Formosa Grill Admin" }] }),
  component: SettingsPage,
});

const emptySettings: Settings = {
  id: "", logo: "", telefone: "", whatsapp: "", instagram: "", facebook: "",
  endereco: "", mapa_url: "", horario: "", email: "", cor_primaria: "", cor_secundaria: "",
  created_at: "", updated_at: "",
};

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      if (data) setSettings(data);
    } catch {
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...payload } = settings;
      await updateSettings(settings.id, payload);
      await createLog({ action: "Configurações atualizadas", entity: "settings", entityId: settings.id, details: payload });
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile("UPLOADS", file);
      setSettings((s) => ({ ...s, logo: url }));
      toast.success("Logo enviado!");
    } catch {
      toast.error("Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  if (loading) return <div className="text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Configurações</h1>

      <form onSubmit={handleSave} className="max-w-2xl space-y-5">
        <div>
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 w-16 rounded-lg border border-border object-contain" />}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> {uploading ? "Enviando…" : "Upload Logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div><Label>Telefone</Label><Input value={settings.telefone ?? ""} onChange={(e) => update("telefone", e.target.value)} /></div>
          <div><Label>WhatsApp</Label><Input value={settings.whatsapp ?? ""} onChange={(e) => update("whatsapp", e.target.value)} /></div>
          <div><Label>Instagram</Label><Input value={settings.instagram ?? ""} onChange={(e) => update("instagram", e.target.value)} /></div>
          <div><Label>Facebook</Label><Input value={settings.facebook ?? ""} onChange={(e) => update("facebook", e.target.value)} /></div>
          <div><Label>E-mail</Label><Input type="email" value={settings.email ?? ""} onChange={(e) => update("email", e.target.value)} /></div>
          <div><Label>Endereço</Label><Input value={settings.endereco ?? ""} onChange={(e) => update("endereco", e.target.value)} /></div>
          <div><Label>URL do Mapa</Label><Input value={settings.mapa_url ?? ""} onChange={(e) => update("mapa_url", e.target.value)} /></div>
          <div><Label>Horário</Label><Input value={settings.horario ?? ""} onChange={(e) => update("horario", e.target.value)} /></div>
          <div><Label>Cor Primária</Label><Input type="color" value={settings.cor_primaria ?? "#000000"} onChange={(e) => update("cor_primaria", e.target.value)} className="h-10 w-20 cursor-pointer rounded-lg border border-border p-1" /></div>
          <div><Label>Cor Secundária</Label><Input type="color" value={settings.cor_secundaria ?? "#FFD700"} onChange={(e) => update("cor_secundaria", e.target.value)} className="h-10 w-20 cursor-pointer rounded-lg border border-border p-1" /></div>
        </div>

        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando…" : "Salvar Configurações"}
        </Button>
      </form>
    </div>
  );
}

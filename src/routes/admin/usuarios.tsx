import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Pencil, UserCog } from "lucide-react";
import { fetchProfiles, updateProfile } from "@/lib/api/admin";
import { createLog } from "@/lib/api/admin";
import type { Profile, Role } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Formosa Grill Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editRole, setEditRole] = useState<Role>("employee");
  const [editActive, setEditActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfiles();
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(u: Profile) {
    setEditing(u);
    setEditNome(u.nome ?? "");
    setEditTelefone(u.telefone ?? "");
    setEditRole(u.role);
    setEditActive(u.active);
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateProfile(editing.id, { nome: editNome, telefone: editTelefone, role: editRole, active: editActive });
      await createLog({ action: "Usuário atualizado", entity: "profiles", entityId: editing.id, details: { nome: editNome, role: editRole, active: editActive } });
      toast.success("Usuário atualizado!");
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Usuários</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar usuários…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Usuário</th>
                <th className="p-3 text-left font-semibold">Telefone</th>
                <th className="p-3 text-center font-semibold">Cargo</th>
                <th className="p-3 text-center font-semibold">Ativo</th>
                <th className="p-3 text-center font-semibold">Criado em</th>
                <th className="p-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-bold">
                        {(u.nome ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.nome ?? "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.telefone ?? "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === "admin" ? "bg-primary text-primary-foreground" :
                      u.role === "manager" ? "bg-secondary text-secondary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.active ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"}`}>
                      {u.active ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Nome</Label><Input value={editNome} onChange={(e) => setEditNome(e.target.value)} /></div>
            <div><Label>Telefone</Label><Input value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} /></div>
            <div>
              <Label>Cargo</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={editActive} onCheckedChange={setEditActive} /> Ativo
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, MailCheck, MailX } from "lucide-react";
import {
  fetchAuthorizedEmails,
  createAuthorizedEmail,
  updateAuthorizedEmail,
  deleteAuthorizedEmail,
} from "@/lib/api/admin";
import { createLog } from "@/lib/api/admin";
import type { AuthorizedEmail, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/emails")({
  head: () => ({ meta: [{ title: "Emails Autorizados — Formosa Grill Admin" }] }),
  component: AuthorizedEmailsPage,
});

function AuthorizedEmailsPage() {
  const [emails, setEmails] = useState<AuthorizedEmail[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AuthorizedEmail | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<Role>("employee");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuthorizedEmails();
      setEmails(data);
    } catch {
      toast.error("Erro ao carregar emails.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = emails.filter((e) =>
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() { setEditing(null); setEmailInput(""); setRoleInput("employee"); setDialogOpen(true); }
  function openEdit(e: AuthorizedEmail) { setEditing(e); setEmailInput(e.email); setRoleInput(e.role); setDialogOpen(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateAuthorizedEmail(editing.id, { email: emailInput, role: roleInput });
        await createLog({ action: "Email autorizado atualizado", entity: "authorized_emails", entityId: editing.id, details: { email: emailInput, role: roleInput } });
        toast.success("Email atualizado!");
      } else {
        const created = await createAuthorizedEmail(emailInput, roleInput);
        await createLog({ action: "Email autorizado adicionado", entity: "authorized_emails", entityId: created.id, details: { email: emailInput, role: roleInput } });
        toast.success("Email autorizado!");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      toast.error(msg);
    }
  }

  async function toggleStatus(e: AuthorizedEmail) {
    try {
      const newStatus = e.status === "active" ? "inactive" : "active";
      await updateAuthorizedEmail(e.id, { status: newStatus });
      await createLog({ action: `Email ${newStatus === "active" ? "ativado" : "desativado"}`, entity: "authorized_emails", entityId: e.id });
      setEmails((prev) => prev.map((x) => x.id === e.id ? { ...x, status: newStatus } : x));
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este email autorizado?")) return;
    try {
      await deleteAuthorizedEmail(id);
      await createLog({ action: "Email autorizado removido", entity: "authorized_emails", entityId: id });
      toast.success("Email removido!");
      await load();
    } catch {
      toast.error("Erro ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Emails Autorizados</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Adicionar Email</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar emails…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Email</th>
                <th className="p-3 text-center font-semibold">Cargo</th>
                <th className="p-3 text-center font-semibold">Autorizado por</th>
                <th className="p-3 text-center font-semibold">Data</th>
                <th className="p-3 text-center font-semibold">Status</th>
                <th className="p-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{e.email}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      e.role === "admin" ? "bg-primary text-primary-foreground" :
                      e.role === "manager" ? "bg-secondary text-secondary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>{e.role}</span>
                  </td>
                  <td className="p-3 text-center text-muted-foreground">{e.authorized_by ? "—" : "Sistema"}</td>
                  <td className="p-3 text-center text-muted-foreground">{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleStatus(e)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {e.status === "active" ? (
                        <span className="flex items-center gap-1 bg-green-500/15 text-green-600"><MailCheck className="h-3 w-3" /> Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 bg-red-500/15 text-red-600"><MailX className="h-3 w-3" /> Inativo</span>
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
          <DialogHeader><DialogTitle>{editing ? "Editar Email" : "Adicionar Email"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
            </div>
            <div>
              <Label>Cargo</Label>
              <Select value={roleInput} onValueChange={(v) => setRoleInput(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Adicionar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

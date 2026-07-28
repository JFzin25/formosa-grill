import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Search } from "lucide-react";
import { fetchContacts, updateContact, deleteContact } from "@/lib/api/content";
import { createLog } from "@/lib/api/admin";
import type { Contact } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens — Formosa Grill Admin" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch {
      toast.error("Erro ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.mensagem ?? "").toLowerCase().includes(search.toLowerCase());
    const matchUnread = !filterUnread || !c.lida;
    return matchSearch && matchUnread;
  });

  async function toggleRead(c: Contact) {
    try {
      await updateContact(c.id, { lida: !c.lida });
      setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, lida: !x.lida } : x));
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta mensagem?")) return;
    try {
      await deleteContact(id);
      await createLog({ action: "Mensagem excluída", entity: "contacts", entityId: id });
      toast.success("Mensagem excluída!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Mensagens</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar mensagens…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant={filterUnread ? "default" : "outline"} onClick={() => setFilterUnread(!filterUnread)}>
          {filterUnread ? "Mostrando não lidas" : "Filtrar não lidas"}
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma mensagem encontrada.</p>}
          {filtered.map((c) => (
            <div key={c.id} className={`rounded-xl border p-4 ${c.lida ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.nome}</h3>
                    {!c.lida && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Nova</span>}
                  </div>
                  {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                  {c.telefone && <p className="text-xs text-muted-foreground">{c.telefone}</p>}
                  <p className="mt-2 text-sm">{c.mensagem}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => toggleRead(c)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" title={c.lida ? "Marcar como não lida" : "Marcar como lida"}>
                    {c.lida ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Excluir">
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

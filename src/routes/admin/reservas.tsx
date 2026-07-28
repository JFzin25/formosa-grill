import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Trash2, Pencil, Check, X, CheckCircle, Calendar } from "lucide-react";
import { fetchReservations, updateReservation, deleteReservation, createReservation } from "@/lib/api/content";
import { createLog } from "@/lib/api/admin";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/reservas")({
  head: () => ({ meta: [{ title: "Reservas — Formosa Grill Admin" }] }),
  component: ReservationsPage,
});

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Finalizada",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600",
  confirmed: "bg-green-500/15 text-green-600",
  cancelled: "bg-red-500/15 text-red-600",
  completed: "bg-blue-500/15 text-blue-600",
};

function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReservations();
      setReservations(data);
    } catch {
      toast.error("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.telefone.includes(search) ||
      (r.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function changeStatus(id: string, status: Reservation["status"]) {
    try {
      await updateReservation(id, { status });
      await createLog({ action: `Reserva ${statusLabels[status]}`, entity: "reservations", entityId: id });
      toast.success(`Reserva ${statusLabels[status].toLowerCase()}!`);
      await load();
    } catch {
      toast.error("Erro ao atualizar reserva.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta reserva?")) return;
    try {
      await deleteReservation(id);
      await createLog({ action: "Reserva excluída", entity: "reservations", entityId: id });
      toast.success("Reserva excluída!");
      await load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function openEdit(r: Reservation) {
    setEditing(r);
    setDialogOpen(true);
  }

  async function handleEditSave(data: Partial<Reservation>) {
    if (!editing) return;
    try {
      await updateReservation(editing.id, data);
      await createLog({ action: "Reserva editada", entity: "reservations", entityId: editing.id, details: data });
      toast.success("Reserva atualizada!");
      setDialogOpen(false);
      setEditing(null);
      await load();
    } catch {
      toast.error("Erro ao editar.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Reservas</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, telefone, e-mail…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
            <SelectItem value="completed">Finalizadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Nome</th>
                <th className="p-3 text-left font-semibold">Contato</th>
                <th className="p-3 text-left font-semibold">Data</th>
                <th className="p-3 text-left font-semibold">Hora</th>
                <th className="p-3 text-center font-semibold">Pessoas</th>
                <th className="p-3 text-center font-semibold">Status</th>
                <th className="p-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{r.nome}</td>
                  <td className="p-3 text-muted-foreground">
                    <div>{r.telefone}</div>
                    {r.email && <div className="text-xs">{r.email}</div>}
                  </td>
                  <td className="p-3">{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">{r.hora}</td>
                  <td className="p-3 text-center">{r.pessoas}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      {r.status === "pending" && (
                        <button onClick={() => changeStatus(r.id, "confirmed")} className="rounded-lg p-1.5 text-green-600 hover:bg-green-500/10" title="Confirmar">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {r.status === "confirmed" && (
                        <button onClick={() => changeStatus(r.id, "completed")} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-500/10" title="Finalizar">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {r.status !== "cancelled" && r.status !== "completed" && (
                        <button onClick={() => changeStatus(r.id, "cancelled")} className="rounded-lg p-1.5 text-red-600 hover:bg-red-500/10" title="Cancelar">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Excluir">
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
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          {editing && <EditReservationForm reservation={editing} onSave={handleEditSave} onCancel={() => setDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditReservationForm({ reservation, onSave, onCancel }: {
  reservation: Reservation;
  onSave: (data: Partial<Reservation>) => void;
  onCancel: () => void;
}) {
  const [nome, setNome] = useState(reservation.nome);
  const [telefone, setTelefone] = useState(reservation.telefone);
  const [email, setEmail] = useState(reservation.email ?? "");
  const [data, setData] = useState(reservation.data);
  const [hora, setHora] = useState(reservation.hora);
  const [pessoas, setPessoas] = useState(reservation.pessoas.toString());
  const [observacoes, setObservacoes] = useState(reservation.observacoes ?? "");
  const [status, setStatus] = useState(reservation.status);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ nome, telefone, email: email || null, data, hora, pessoas: parseInt(pessoas) || 1, observacoes: observacoes || null, status }); }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>E-mail</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Pessoas</Label>
          <Input type="number" value={pessoas} onChange={(e) => setPessoas(e.target.value)} min={1} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Data</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div>
          <Label>Hora</Label>
          <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Reservation["status"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="completed">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

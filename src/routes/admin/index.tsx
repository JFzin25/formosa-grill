import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CalendarCheck, Mail, UtensilsCrossed, Users, Star, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Formosa Grill Admin" }] }),
  component: DashboardPage,
});

interface Stats {
  products: number;
  reservations: number;
  pendingReservations: number;
  contacts: number;
  unreadContacts: number;
  users: number;
  reviews: number;
}

function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReservations, setRecentReservations] = useState<
    { id: string; nome: string; data: string; hora: string; pessoas: number; status: string }[]
  >([]);
  const [recentContacts, setRecentContacts] = useState<
    { id: string; nome: string; mensagem: string | null; lida: boolean }[]
  >([]);

  useEffect(() => {
    async function load() {
      const [p, r, rPend, c, cUnread, u, rev] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("reservations").select("*", { count: "exact", head: true }),
        supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("lida", false),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        products: p.count ?? 0,
        reservations: r.count ?? 0,
        pendingReservations: rPend.count ?? 0,
        contacts: c.count ?? 0,
        unreadContacts: cUnread.count ?? 0,
        users: u.count ?? 0,
        reviews: rev.count ?? 0,
      });

      const { data: recentR } = await supabase
        .from("reservations")
        .select("id, nome, data, hora, pessoas, status")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentReservations(recentR ?? []);

      const { data: recentC } = await supabase
        .from("contacts")
        .select("id, nome, mensagem, lida")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentContacts(recentC ?? []);
    }
    load();
  }, []);

  if (!stats) return <div className="animate-pulse text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">
        Olá, {profile?.nome || profile?.email} 👋
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UtensilsCrossed} label="Produtos" value={stats.products} />
        <StatCard icon={CalendarCheck} label="Reservas" value={stats.reservations} highlight={stats.pendingReservations > 0 ? `${stats.pendingReservations} pendentes` : undefined} />
        <StatCard icon={Mail} label="Mensagens" value={stats.contacts} highlight={stats.unreadContacts > 0 ? `${stats.unreadContacts} não lidas` : undefined} />
        <StatCard icon={Users} label="Usuários" value={stats.users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Reservas Recentes</h2>
          <div className="space-y-3">
            {recentReservations.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
            )}
            {recentReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{r.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.data).toLocaleDateString("pt-BR")} às {r.hora} · {r.pessoas} pessoas
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Mensagens Recentes</h2>
          <div className="space-y-3">
            {recentContacts.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
            )}
            {recentContacts.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{c.nome}</p>
                  {!c.lida && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {c.mensagem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {highlight && (
        <p className="mt-1 text-xs text-primary">{highlight}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-600",
    confirmed: "bg-green-500/15 text-green-600",
    cancelled: "bg-red-500/15 text-red-600",
    completed: "bg-blue-500/15 text-blue-600",
  };
  const labels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Finalizada",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

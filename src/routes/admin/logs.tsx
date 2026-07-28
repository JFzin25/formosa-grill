import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { fetchLogs } from "@/lib/api/admin";
import type { LogEntry } from "@/lib/types";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({ meta: [{ title: "Logs — Formosa Grill Admin" }] }),
  component: LogsPage,
});

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch {
      console.error("Erro ao carregar logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Logs</h1>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Usuário</th>
                <th className="p-3 text-left font-semibold">Ação</th>
                <th className="p-3 text-left font-semibold">Entidade</th>
                <th className="p-3 text-left font-semibold">Detalhes</th>
                <th className="p-3 text-left font-semibold">IP</th>
                <th className="p-3 text-left font-semibold">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{log.user_email}</td>
                  <td className="p-3 font-medium">{log.acao}</td>
                  <td className="p-3 text-muted-foreground">{log.entidade ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {log.detalhes ? JSON.stringify(log.detalhes).slice(0, 100) : "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">{log.ip ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

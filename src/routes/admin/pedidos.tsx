import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — Formosa Grill Admin" }] }),
  component: PedidosPage,
});

function PedidosPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">Pedidos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sistema de pedidos em desenvolvimento. Em breve disponível.
      </p>
    </div>
  );
}

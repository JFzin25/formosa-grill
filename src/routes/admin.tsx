import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  ClipboardList,
  CalendarCheck,
  Images,
  Mail,
  Star,
  Settings,
  Users,
  MailCheck,
  ScrollText,
  LogOut,
  Menu as MenuIcon,
  X,
  Store,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAdmin, isManagerOrAbove, isStaff } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — Formosa Grill" }] }),
  component: AdminLayout,
});

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
  { label: "Produtos", to: "/admin/produtos", icon: UtensilsCrossed, roles: ["admin", "manager"] },
  { label: "Categorias", to: "/admin/categorias", icon: FolderTree, roles: ["admin", "manager"] },
  { label: "Pedidos", to: "/admin/pedidos", icon: ClipboardList, roles: ["admin", "manager", "employee"] },
  { label: "Reservas", to: "/admin/reservas", icon: CalendarCheck, roles: ["admin", "manager", "employee"] },
  { label: "Galeria", to: "/admin/galeria", icon: Images, roles: ["admin", "manager"] },
  { label: "Mensagens", to: "/admin/mensagens", icon: Mail, roles: ["admin", "manager", "employee"] },
  { label: "Avaliações", to: "/admin/avaliacoes", icon: Star, roles: ["admin", "manager"] },
  { label: "Banners", to: "/admin/banners", icon: Images, roles: ["admin", "manager"] },
  { label: "Configurações", to: "/admin/configuracoes", icon: Settings, roles: ["admin"] },
  { label: "Usuários", to: "/admin/usuarios", icon: Users, roles: ["admin"] },
  { label: "Emails Autorizados", to: "/admin/emails", icon: MailCheck, roles: ["admin"] },
  { label: "Logs", to: "/admin/logs", icon: ScrollText, roles: ["admin"] },
];

function AdminLayout() {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      navigate({ to: "/login" });
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!profile) return null;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <SidebarContent
          items={visibleItems}
          pathname={pathname}
          profile={profile}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card lg:hidden">
            <SidebarContent
              items={visibleItems}
              pathname={pathname}
              profile={profile}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border p-2 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {profile.nome || profile.email}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                profile.role === "admin" && "bg-primary text-primary-foreground",
                profile.role === "manager" && "bg-secondary text-secondary-foreground",
                profile.role === "employee" && "bg-muted text-muted-foreground",
              )}
            >
              {profile.role}
            </span>
            <Link to="/" className="rounded-lg border border-border p-2 transition-colors hover:bg-accent" title="Ver site">
              <Store className="h-4 w-4" />
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-border p-2 transition-colors hover:bg-destructive hover:text-destructive-foreground"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  items,
  pathname,
  profile,
  onSignOut,
  onClose,
}: {
  items: typeof navItems;
  pathname: string;
  profile: { nome: string | null; email: string; role: string };
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-4">
        <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 font-display text-sm font-bold text-gradient-gold">
            FG
          </span>
          <span className="font-display text-lg font-bold">Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
          {profile.email}
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );
}

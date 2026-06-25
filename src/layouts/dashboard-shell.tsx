// src/layouts/dashboard-shell.tsx
import { type ReactNode, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type LucideIcon, LogOut, Menu, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useAuth } from "@/store/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  nav: NavItem[];
  workspaceLabel: string;
  children: ReactNode;
  loginPath?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  nav,
  workspaceLabel,
  children,
  loginPath = "/login",
}: DashboardShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out of BorlaGo...");
    try {
      await signOut();
      toast.success("Logged out successfully!", { id: toastId });
      navigate({ to: loginPath, replace: true });
    } catch (err) {
      console.error("Logout run execution breakdown:", err);
      toast.error("Failed to disconnect cleanly.", { id: toastId });
    }
  };

  // Determine the correct internal path based on the authenticated user's workspace role
  const authenticatedHomePath = user?.role 
    ? (user.role === "admin" ? "/admin/dashboard" : user.role === "collector" ? "/collector/dashboard" : "/user/dashboard")
    : "/";

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        {/* Dynamic routing parameter keeps logged-in users inside workspace boundaries */}
        <Logo size="sm" to={authenticatedHomePath} />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-5 pb-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {workspaceLabel}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-[18px] w-[18px]", active && "text-primary")}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-sidebar shadow-elevated">
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden text-sm text-muted-foreground sm:block">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                {user ? initials(user.name) : "BG"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
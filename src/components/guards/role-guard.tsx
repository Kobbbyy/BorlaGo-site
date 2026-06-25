import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth, dashboardPath } from "@/store/auth";
import type { Role } from "@/types";
import { Logo } from "@/components/brand/logo";

function GuardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Logo size="lg" />
      <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-brand" />
      </div>
    </div>
  );
}

interface RoleGuardProps {
  allow: Role;
  children: ReactNode;
  /** redirect target for unauthenticated users */
  loginPath?: string;
}

export function RoleGuard({ allow, children, loginPath = "/login" }: RoleGuardProps) {
  const { user, status } = useAuth();

  if (status === "loading") return <GuardLoading />;

  if (status === "anonymous" || !user) {
    return <Navigate to={loginPath} replace />;
  }

  if (user.role !== allow) {
    return <Navigate to={dashboardPath[user.role]} replace />;
  }

  return <>{children}</>;
}

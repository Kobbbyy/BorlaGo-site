import { type ReactNode } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  History,
  User,
} from "lucide-react";
import { RoleGuard } from "@/components/guards/role-guard";
import { DashboardShell, type NavItem } from "@/layouts/dashboard-shell";

const collectorNav: NavItem[] = [
  { label: "Dashboard", to: "/collector/dashboard", icon: LayoutDashboard },
  { label: "Available jobs", to: "/collector/jobs", icon: Briefcase },
  { label: "Earnings", to: "/collector/earnings", icon: Wallet },
  { label: "History", to: "/collector/history", icon: History },
  { label: "Profile", to: "/collector/profile", icon: User },
];

export function CollectorApp({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="collector" loginPath="/login">
      <DashboardShell
        nav={collectorNav}
        workspaceLabel="Collector field ops"
        loginPath="/login"
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}

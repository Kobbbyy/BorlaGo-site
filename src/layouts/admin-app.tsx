import { type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Truck,
  ClipboardList,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import { RoleGuard } from "@/components/guards/role-guard";
import { DashboardShell, type NavItem } from "@/layouts/dashboard-shell";

const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Collectors", to: "/admin/collectors", icon: Truck },
  { label: "Bookings", to: "/admin/bookings", icon: ClipboardList },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", to: "/admin/reports", icon: FileText },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export function AdminApp({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="admin" loginPath="/admin/login">
      <DashboardShell
        nav={adminNav}
        workspaceLabel="Admin console"
        loginPath="/admin/login"
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}

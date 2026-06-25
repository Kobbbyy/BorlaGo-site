import { type ReactNode } from "react";
import {
  LayoutDashboard,
  PackagePlus,
  CalendarClock,
  ClipboardList,
  MapPin,
  User,
  Settings,
} from "lucide-react";
import { RoleGuard } from "@/components/guards/role-guard";
import { DashboardShell, type NavItem } from "@/layouts/dashboard-shell";

const userNav: NavItem[] = [
  { label: "Dashboard", to: "/user/dashboard", icon: LayoutDashboard },
  { label: "Book pickup", to: "/user/book-pickup", icon: PackagePlus },
  { label: "Schedule", to: "/user/schedule", icon: CalendarClock },
  { label: "My bookings", to: "/user/bookings", icon: ClipboardList },
  { label: "Live tracking", to: "/user/tracking", icon: MapPin },
  { label: "Profile", to: "/user/profile", icon: User },
  { label: "Settings", to: "/user/settings", icon: Settings },
];

export function UserApp({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="user" loginPath="/login">
      <DashboardShell nav={userNav} workspaceLabel="Resident workspace" loginPath="/login">
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
